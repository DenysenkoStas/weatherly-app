import { useState, useCallback, useEffect, useMemo } from 'react'
import { useLanguage } from './hooks/useLanguage'
import { useGeocoding } from './hooks/useGeocoding'
import { useWeather } from './hooks/useWeather'
import { useGeolocation } from './hooks/useGeolocation'
import { useReverseGeocoding } from './hooks/useReverseGeocoding'
import { SearchBar } from './components/SearchBar'
import { WeatherCard } from './components/WeatherCard'
import { WeatherCardSkeleton } from './components/WeatherCardSkeleton'
import { ForecastCard } from './components/ForecastCard'
import { FavoritesList } from './components/FavoritesList'
import { useFavorites, makeFavoriteId } from './hooks/useFavorites'
import type { FavoriteCity } from './types'
import { getWeatherLabel } from './utils'
import type { GeoResult } from './types'
import styles from './App.module.scss'

interface Coords {
  lat: number
  lon: number
}

function App() {
  const { language, toggleLanguage, t } = useLanguage()
  const {
    results,
    loading: geoLoading,
    error: geoError,
    search,
    reset,
  } = useGeocoding(language)
  const {
    weather,
    forecast,
    updatedAt,
    loading: weatherLoading,
    error: weatherError,
    fetch: fetchWeather,
  } = useWeather()
  const { latitude, longitude, loading: geolocLoading, denied: geolocDenied } = useGeolocation()
  const { cityName, loading: cityLoading, fetchCityName } = useReverseGeocoding(language)
  const { favorites, isFavorite, toggleFavorite } = useFavorites()

  const [selectedCoords, setSelectedCoords] = useState<Coords | null>(null)

  const geoCoords = useMemo<Coords | null>(
    () => (latitude !== null && longitude !== null ? { lat: latitude, lon: longitude } : null),
    [latitude, longitude],
  )

  const displayCoords = useMemo(() => selectedCoords ?? geoCoords, [selectedCoords, geoCoords])

  useEffect(() => {
    if (!geoCoords) return
    void fetchWeather(geoCoords.lat, geoCoords.lon)
  }, [geoCoords, fetchWeather])

  useEffect(() => {
    if (!displayCoords) return
    void fetchCityName(displayCoords.lat, displayCoords.lon)
  }, [displayCoords, fetchCityName])

  const handleSearch = useCallback(
    (query: string) => {
      setSelectedCoords(null)
      void search(query)
    },
    [search],
  )

  const handleSelectCity = useCallback(
    (city: GeoResult) => {
      reset()
      setSelectedCoords({ lat: city.latitude, lon: city.longitude })
      void fetchWeather(city.latitude, city.longitude)
    },
    [reset, fetchWeather],
  )

  const currentFavoriteId = displayCoords
    ? makeFavoriteId(displayCoords.lat, displayCoords.lon)
    : null

  const handleToggleFavorite = useCallback(() => {
    if (!displayCoords || !cityName) return
    const city: FavoriteCity = {
      id: makeFavoriteId(displayCoords.lat, displayCoords.lon),
      name: cityName,
      latitude: displayCoords.lat,
      longitude: displayCoords.lon,
    }
    toggleFavorite(city)
  }, [displayCoords, cityName, toggleFavorite])

  const handleSelectFavorite = useCallback(
    (city: FavoriteCity) => {
      setSelectedCoords({ lat: city.latitude, lon: city.longitude })
      void fetchWeather(city.latitude, city.longitude)
    },
    [fetchWeather],
  )

  const error = weatherError || (geoError === 'fetch_failed' ? geoError : null)
  const searchErrorMessage = geoError
    ? t.errors[geoError as keyof typeof t.errors]
    : undefined

  const handleRefresh = useCallback(() => {
    if (!displayCoords) return
    void fetchWeather(displayCoords.lat, displayCoords.lon)
  }, [displayCoords, fetchWeather])

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.logo}>{t.appName}</h1>
        <button className={styles.langToggle} onClick={toggleLanguage}>
          {language === 'en' ? 'EN' : 'UA'}
        </button>
      </header>

      <SearchBar
        placeholder={t.searchPlaceholder}
        onSearch={handleSearch}
        onReset={reset}
        results={results}
        onSelect={handleSelectCity}
        loading={geoLoading}
        searchError={geoError}
        searchErrorMessage={searchErrorMessage}
      />

      <FavoritesList favorites={favorites} onSelect={handleSelectFavorite} />

      {(weatherLoading ||
        geolocLoading ||
        cityLoading ||
        (!!displayCoords && (!weather || !cityName))) && <WeatherCardSkeleton />}

      {geolocDenied && !error && <p className={styles.error}>{t.errors.geolocation_denied}</p>}

      {error && <p className={styles.error}>{t.errors[error as keyof typeof t.errors]}</p>}

      {weather && cityName && updatedAt && !weatherLoading && (
        <WeatherCard
          city={cityName}
          weather={weather}
          description={getWeatherLabel(weather.weather_code, t.weather)}
          updatedAt={updatedAt}
          isFavorite={currentFavoriteId ? isFavorite(currentFavoriteId) : false}
          onRefresh={handleRefresh}
          onToggleFavorite={handleToggleFavorite}
          t={t}
        />
      )}

      {forecast && !weatherLoading && (
        <ForecastCard
          forecast={forecast}
          t={{ ...t, weather: t.weather as Record<number, string> }}
        />
      )}

      {!weather &&
        !weatherLoading &&
        !geolocLoading &&
        !geolocDenied &&
        !error &&
        !displayCoords && <p className={styles.emptyState}>{t.empty_state}</p>}
    </div>
  )
}

export default App
