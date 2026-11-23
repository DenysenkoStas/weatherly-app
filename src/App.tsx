import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { useLanguage } from './hooks/useLanguage'
import { useTheme } from './hooks/useTheme'
import { useGeocoding } from './hooks/useGeocoding'
import { useWeather } from './hooks/useWeather'
import { useGeolocation } from './hooks/useGeolocation'
import { useReverseGeocoding } from './hooks/useReverseGeocoding'
import { DESKTOP_QUERY, useMediaQuery } from './hooks/useMediaQuery'
import { loadLastLocation, saveLastLocation } from './hooks/useLastLocation'
import { useRefreshWhenStale } from './hooks/useRefreshWhenStale'
import { useAirQuality } from './hooks/useAirQuality'
import { useUnits } from './hooks/useUnits'
import { SearchBar } from './components/SearchBar'
import { WeatherCard } from './components/WeatherCard'
import { WeatherCardSkeleton } from './components/WeatherCardSkeleton'
import { WeatherDetails } from './components/WeatherDetails'
import { WeatherDetailsSkeleton } from './components/WeatherDetailsSkeleton'
import { ForecastCard } from './components/ForecastCard'
import { ForecastCardSkeleton } from './components/ForecastCardSkeleton'
import { FavoritesList } from './components/FavoritesList'
import { EmptyState } from './components/EmptyState'
import { AirQualityCard } from './components/AirQualityCard'
import { AirQualityCardSkeleton } from './components/AirQualityCardSkeleton'
import { UnitsMenu } from './components/UnitsMenu'
import { SunIcon, MoonIcon, LocationIcon } from './components/ThemeIcons'
import { useFavorites, makeFavoriteId } from './hooks/useFavorites'
import type { Coords, FavoriteCity, GeoResult } from './types'
import {
  compareWithYesterday,
  getSky,
  getWeatherLabel,
  parseLocationParams,
  withLocationParams,
} from './utils'
import styles from './App.module.scss'

function App() {
  // On start: a city from the link, then the last viewed city, then geolocation
  const [initialLocation] = useState(
    () => parseLocationParams(window.location.search) ?? loadLastLocation(),
  )
  const { language, toggleLanguage, t } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const { units, setTemperatureUnit, setWindUnit } = useUnits()
  const { results, loading: geoLoading, error: geoError, search, reset } = useGeocoding(language)
  const {
    weather,
    forecast,
    hourly,
    timezone,
    updatedAt,
    units: weatherUnits,
    fromCache: weatherFromCache,
    yesterday,
    loading: weatherLoading,
    refreshing: weatherRefreshing,
    error: weatherError,
    fetch: fetchWeather,
  } = useWeather()
  const {
    latitude,
    longitude,
    loading: geolocLoading,
    denied: geolocDenied,
    supported: geolocSupported,
    request: requestGeolocation,
  } = useGeolocation({ auto: !initialLocation })
  const { cityName, fetchCityName } = useReverseGeocoding(language)
  const { airQuality, loading: airQualityLoading, fetch: fetchAirQuality } = useAirQuality()
  const { favorites, isFavorite, toggleFavorite, removeFavorite, reorderFavorites } = useFavorites()
  const isDesktop = useMediaQuery(DESKTOP_QUERY)

  const [selectedCoords, setSelectedCoords] = useState<Coords | null>(initialLocation)

  const geoCoords = useMemo<Coords | null>(
    () => (latitude !== null && longitude !== null ? { lat: latitude, lon: longitude } : null),
    [latitude, longitude],
  )

  const displayCoords = useMemo(() => selectedCoords ?? geoCoords, [selectedCoords, geoCoords])

  const locationKey = displayCoords ? `${displayCoords.lat}:${displayCoords.lon}` : ''
  const [daySelection, setDaySelection] = useState({ locationKey: '', index: 0 })

  if (locationKey !== daySelection.locationKey) {
    setDaySelection({ locationKey, index: 0 })
  }

  const selectedDayIndex = daySelection.index
  const setSelectedDayIndex = useCallback((index: number) => {
    setDaySelection((prev) => ({ ...prev, index }))
  }, [])

  // Units the weather was last requested in: a city change reads them without refetching on unit changes
  const unitsRef = useRef(units)

  // New units: refetch the same place in the background, the open-meteo API converts for us
  useEffect(() => {
    if (unitsRef.current === units) return
    unitsRef.current = units
    if (!displayCoords) return
    // While a new city is still loading, keep its skeleton instead of the previous city's data
    void fetchWeather(displayCoords.lat, displayCoords.lon, { silent: !weatherLoading, units })
  }, [units, displayCoords, weatherLoading, fetchWeather])

  useEffect(() => {
    if (!displayCoords) return
    void fetchWeather(displayCoords.lat, displayCoords.lon, { units: unitsRef.current })
    void fetchAirQuality(displayCoords.lat, displayCoords.lon)
    saveLastLocation(displayCoords)
  }, [displayCoords, fetchWeather, fetchAirQuality])

  // Keep the address bar shareable; replaceState, so city changes don't flood the history
  useEffect(() => {
    const href = withLocationParams(window.location.href, displayCoords)
    if (href !== window.location.href) {
      window.history.replaceState(window.history.state, '', href)
    }
  }, [displayCoords])

  useEffect(() => {
    document.title = displayCoords && cityName ? `${cityName} — ${t.appName}` : t.appName
  }, [displayCoords, cityName, t.appName])

  useEffect(() => {
    if (!displayCoords) return
    void fetchCityName(displayCoords.lat, displayCoords.lon)
  }, [displayCoords, fetchCityName])

  const handleSearch = useCallback(
    (query: string) => {
      void search(query)
    },
    [search],
  )

  const handleSelectCity = useCallback(
    (city: GeoResult) => {
      reset()
      setSelectedCoords({ lat: city.latitude, lon: city.longitude })
    },
    [reset],
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

  // Keep the current city on screen until the new position arrives
  const handleLocate = useCallback(() => {
    requestGeolocation(() => setSelectedCoords(null))
  }, [requestGeolocation])

  const isViewingLocation = !selectedCoords && !!geoCoords

  const handleSelectFavorite = useCallback((city: FavoriteCity) => {
    setSelectedCoords({ lat: city.latitude, lon: city.longitude })
  }, [])

  const error = weatherError || (geoError === 'fetch_failed' ? geoError : null)
  const searchErrorMessage = geoError ? t.errors[geoError as keyof typeof t.errors] : undefined

  // Same place: keep the data on screen and refresh in the background
  const handleRefresh = useCallback(() => {
    if (!displayCoords || weatherLoading) return
    void fetchWeather(displayCoords.lat, displayCoords.lon, { silent: true, units })
    void fetchAirQuality(displayCoords.lat, displayCoords.lon, { silent: true })
  }, [displayCoords, weatherLoading, units, fetchWeather, fetchAirQuality])

  useRefreshWhenStale(updatedAt, handleRefresh)

  // Showing the offline copy: refresh as soon as the network is back
  useEffect(() => {
    if (!weatherFromCache) return
    window.addEventListener('online', handleRefresh)
    return () => window.removeEventListener('online', handleRefresh)
  }, [weatherFromCache, handleRefresh])

  // While re-locating from the header the current city stays visible
  const locatingFromScratch = geolocLoading && !displayCoords
  // Labels follow the data on screen, so a pending refetch never shows °F next to °C values
  const shownUnits = weatherUnits ?? units
  const tWithUnits = useMemo(
    () => ({
      ...t,
      temp_unit: t.temp_units[shownUnits.temperature],
      wind_unit: t.wind_units[shownUnits.wind],
    }),
    [t, shownUnits],
  )

  const showWeatherSkeleton =
    weatherLoading || locatingFromScratch || (!!displayCoords && (!weather || !cityName))
  const showWeather = !!weather && !!cityName && !!updatedAt && !weatherLoading
  const sun = forecast
    ? {
        sunrise: forecast.sunrise[0],
        sunset: forecast.sunset[0],
        daylightDuration: forecast.daylight_duration[0],
      }
    : null

  const showEmptyState = !displayCoords && !weatherLoading && !geolocLoading && !error

  const sky = weather && displayCoords ? getSky(weather.weather_code, weather.is_day === 1) : null

  return (
    <div className={styles.app} data-sky={sky ?? undefined}>
      <header className={styles.header}>
        <h1 className={styles.logo}>{t.appName}</h1>
        <div className={styles.headerSearch}>
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
        </div>
        <div className={styles.headerFavorites}>
          <FavoritesList
            favorites={favorites}
            activeId={currentFavoriteId}
            onSelect={handleSelectFavorite}
            onRemove={(city) => removeFavorite(city.id)}
            onReorder={reorderFavorites}
            t={t}
          />
        </div>
        <div className={styles.headerActions}>
          {geolocSupported && (
            <button
              type="button"
              className={`${styles.headerToggle} ${styles.headerToggleIcon}`}
              onClick={handleLocate}
              disabled={geolocDenied}
              aria-label={t.locate_me}
              aria-pressed={isViewingLocation}
              aria-busy={geolocLoading}
              title={geolocDenied ? t.errors.geolocation_denied : t.locate_me}
            >
              <LocationIcon
                className={`${styles.toggleIcon}${geolocLoading ? ` ${styles.locating}` : ''}`}
              />
            </button>
          )}
          <UnitsMenu
            units={units}
            onTemperatureChange={setTemperatureUnit}
            onWindChange={setWindUnit}
            buttonClassName={styles.headerToggle}
            t={t}
          />
          <button
            type="button"
            className={`${styles.headerToggle} ${styles.headerToggleIcon}`}
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? t.theme_light : t.theme_dark}
          >
            {theme === 'dark' ? (
              <SunIcon className={styles.toggleIcon} />
            ) : (
              <MoonIcon className={styles.toggleIcon} />
            )}
          </button>
          <button type="button" className={styles.headerToggle} onClick={toggleLanguage}>
            {language === 'en' ? 'EN' : 'UA'}
          </button>
        </div>
      </header>

      <div className={`${styles.layout}${showEmptyState ? ` ${styles.layoutEmpty}` : ''}`}>
        <div className={styles.main}>
          {showWeatherSkeleton && <WeatherCardSkeleton showDetails={!isDesktop} />}

          {error && <p className={styles.error}>{t.errors[error as keyof typeof t.errors]}</p>}

          {showWeather && (
            <WeatherCard
              city={cityName}
              weather={weather}
              sun={sun}
              description={getWeatherLabel(weather.weather_code, t.weather)}
              updatedAt={updatedAt}
              isFavorite={currentFavoriteId ? isFavorite(currentFavoriteId) : false}
              offline={weatherFromCache}
              comparison={compareWithYesterday(weather.time, weather.temperature_2m, yesterday)}
              refreshing={weatherRefreshing}
              onRefresh={handleRefresh}
              onToggleFavorite={handleToggleFavorite}
              showDetails={!isDesktop}
              t={tWithUnits}
            />
          )}
        </div>

        <div className={styles.aside}>
          {showEmptyState && (
            <EmptyState
              canLocate={geolocSupported}
              locationDenied={geolocDenied}
              onLocate={handleLocate}
              onSelectCity={handleSelectFavorite}
              t={t}
            />
          )}

          {(weatherLoading || locatingFromScratch || (!!displayCoords && !forecast)) && (
            <ForecastCardSkeleton />
          )}

          {forecast && hourly && timezone && !weatherLoading && (
            <ForecastCard
              forecast={forecast}
              hourly={hourly}
              timezone={timezone}
              selectedDayIndex={selectedDayIndex}
              onSelectDay={setSelectedDayIndex}
              t={{ ...tWithUnits, weather: t.weather as Record<number, string> }}
            />
          )}
        </div>

        {isDesktop && (showWeatherSkeleton || showWeather) && (
          <div className={styles.wide}>
            {showWeatherSkeleton && <WeatherDetailsSkeleton variant="card" />}
            {showWeather && (
              <WeatherDetails weather={weather} sun={sun} variant="card" t={tWithUnits} />
            )}
          </div>
        )}

        {(showWeatherSkeleton || (showWeather && airQualityLoading)) && (
          <div className={styles.wide}>
            <AirQualityCardSkeleton />
          </div>
        )}

        {showWeather && airQuality && (
          <div className={styles.wide}>
            <AirQualityCard airQuality={airQuality} t={t} />
          </div>
        )}
      </div>
    </div>
  )
}

export default App
