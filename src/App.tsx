import { useState, useCallback, useEffect, useMemo } from 'react'
import { useLanguage } from './hooks/useLanguage'
import { useGeocoding } from './hooks/useGeocoding'
import { useWeather } from './hooks/useWeather'
import { useGeolocation } from './hooks/useGeolocation'
import { useReverseGeocoding } from './hooks/useReverseGeocoding'
import { SearchBar } from './components/SearchBar'
import { WeatherCard } from './components/WeatherCard'
import { getWeatherLabel } from './utils'
import type { GeoResult } from './types'
import styles from './App.module.scss'

interface Coords {
  lat: number
  lon: number
}

function App() {
  const { language, toggleLanguage, t } = useLanguage()
  const { results, loading: geoLoading, error: geoError, search, reset } = useGeocoding(language)
  const { weather, loading: weatherLoading, error: weatherError, fetch: fetchWeather } = useWeather()
  const { latitude, longitude, loading: geolocLoading, denied: geolocDenied } = useGeolocation()
  const { cityName, fetchCityName } = useReverseGeocoding(language)

  const [selectedCoords, setSelectedCoords] = useState<Coords | null>(null)

  const geoCoords = useMemo<Coords | null>(
    () => (latitude !== null && longitude !== null ? { lat: latitude, lon: longitude } : null),
    [latitude, longitude],
  )

  const displayCoords = useMemo(
    () => selectedCoords ?? geoCoords,
    [selectedCoords, geoCoords],
  )

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

  const error = geoError || weatherError

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
        results={results}
        onSelect={handleSelectCity}
      />

      {(geoLoading || weatherLoading || geolocLoading) && (
        <p className={styles.status}>...</p>
      )}

      {geolocDenied && !error && (
        <p className={styles.error}>{t.errors.geolocation_denied}</p>
      )}

      {error && (
        <p className={styles.error}>{t.errors[error as keyof typeof t.errors]}</p>
      )}

      {weather && cityName && !weatherLoading && (
        <WeatherCard
          city={cityName}
          weather={weather}
          description={getWeatherLabel(weather.weather_code, t.weather)}
          t={t}
        />
      )}

      {!weather && !weatherLoading && !geolocLoading && !geolocDenied && !error && (
        <p className={styles.emptyState}>{t.empty_state}</p>
      )}
    </div>
  )
}

export default App
