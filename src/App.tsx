import { useState, useCallback, useEffect } from 'react'
import { useLanguage } from './hooks/useLanguage'
import { useGeocoding } from './hooks/useGeocoding'
import { useWeather } from './hooks/useWeather'
import { useGeolocation } from './hooks/useGeolocation'
import { useReverseGeocoding } from './hooks/useReverseGeocoding'
import { SearchBar } from './components/SearchBar'
import { CityList } from './components/CityList'
import { WeatherCard } from './components/WeatherCard'
import { getWeatherLabel } from './utils'
import type { GeoResult } from './types'
import styles from './App.module.scss'

function App() {
  const { language, toggleLanguage, t } = useLanguage()
  const { results, loading: geoLoading, error: geoError, search, reset } = useGeocoding(language)
  const { weather, loading: weatherLoading, error: weatherError, fetch: fetchWeather } = useWeather()
  const { latitude, longitude, loading: geolocLoading } = useGeolocation()
  const { cityName, fetchCityName } = useReverseGeocoding(language)

  const [selectedCity, setSelectedCity] = useState<GeoResult | null>(null)

  useEffect(() => {
    if (latitude === null || longitude === null) return
    void fetchWeather(latitude, longitude)
    void fetchCityName(latitude, longitude)
  }, [latitude, longitude, fetchWeather, fetchCityName])

  const handleSearch = useCallback(
    (query: string) => {
      setSelectedCity(null)
      void search(query)
    },
    [search],
  )

  const handleSelectCity = (city: GeoResult) => {
    setSelectedCity(city)
    reset()
    void fetchWeather(city.latitude, city.longitude)
  }

  const error = geoError || weatherError
  const displayCity = selectedCity?.name ?? cityName

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.logo}>{t.appName}</h1>
        <button className={styles.langToggle} onClick={toggleLanguage}>
          {language === 'en' ? 'EN' : 'UA'}
        </button>
      </header>

      <SearchBar placeholder={t.searchPlaceholder} onSearch={handleSearch} />

      {(geoLoading || weatherLoading || geolocLoading) && (
        <p className={styles.status}>...</p>
      )}

      {error && (
        <p className={styles.error}>{t.errors[error as keyof typeof t.errors]}</p>
      )}

      {!geoLoading ? (
        <CityList results={results} onSelect={handleSelectCity} />
      ) : null}

      {weather && displayCity && !weatherLoading && (
        <WeatherCard
          city={displayCity}
          weather={weather}
          description={getWeatherLabel(weather.weather_code, t.weather)}
          t={t}
        />
      )}
    </div>
  )
}

export default App
