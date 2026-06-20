import type { WeatherDaily } from '../../types'
import { getWeatherIcon } from '../../utils/wmoIcons'
import { getWeatherLabel } from '../../utils'
import styles from './ForecastCard.module.scss'

interface ForecastCardTranslations {
  days: readonly string[]
  months: readonly string[]
  today: string
  temp_unit: string
  weather: Record<number, string>
}

interface ForecastCardProps {
  forecast: WeatherDaily
  t: ForecastCardTranslations
}

export function ForecastCard({ forecast, t }: ForecastCardProps) {
  return (
    <div className={styles.card}>
      {forecast.time.map((dateStr, i) => {
        const date = new Date(dateStr)
        const dayName = i === 0 ? t.today : t.days[date.getUTCDay()]
        const dateLabel = `${date.getUTCDate()} ${t.months[date.getUTCMonth()]}`
        return (
          <div key={dateStr} className={styles.row}>
            <div className={styles.dayCol}>
              <span className={styles.day}>{dayName}</span>
              <span className={styles.date}>{dateLabel}</span>
            </div>
            <img
              className={styles.icon}
              src={getWeatherIcon(forecast.weather_code[i])}
              alt={getWeatherLabel(forecast.weather_code[i], t.weather)}
            />
            <span className={styles.min}>
              {Math.round(forecast.temperature_2m_min[i])}{t.temp_unit}
            </span>
            <span className={styles.max}>
              {Math.round(forecast.temperature_2m_max[i])}{t.temp_unit}
            </span>
          </div>
        )
      })}
    </div>
  )
}
