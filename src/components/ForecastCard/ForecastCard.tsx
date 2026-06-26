import { useLayoutEffect, useMemo, useRef } from 'react'
import type { WeatherDaily, WeatherHourly } from '../../types'
import { getHourlyForDay, formatHour, getCurrentHourIndex } from '../../utils'
import { getWeatherIcon } from '../../utils/wmoIcons'
import { getWeatherLabel } from '../../utils'
import styles from './ForecastCard.module.scss'

interface ForecastCardTranslations {
  days: readonly string[]
  months: readonly string[]
  today: string
  temp_unit: string
  hourly_forecast: string
  precipitation: string
  weather: Record<number, string>
}

interface ForecastCardProps {
  forecast: WeatherDaily
  hourly: WeatherHourly
  timezone: string
  selectedDayIndex: number
  onSelectDay: (index: number) => void
  t: ForecastCardTranslations
}

export function ForecastCard({
  forecast,
  hourly,
  timezone,
  selectedDayIndex,
  onSelectDay,
  t,
}: ForecastCardProps) {
  const hourlyScrollRef = useRef<HTMLDivElement>(null)

  const selectedDate = forecast.time[selectedDayIndex]
  const hours = useMemo(() => getHourlyForDay(hourly, selectedDate), [hourly, selectedDate])
  const selectedDateObj = new Date(selectedDate)
  const dayLabel = selectedDayIndex === 0 ? t.today : t.days[selectedDateObj.getUTCDay()]
  const dateLabel = `${selectedDateObj.getUTCDate()} ${t.months[selectedDateObj.getUTCMonth()]}`
  const currentHourIndex = selectedDayIndex === 0 ? getCurrentHourIndex(hours, timezone) : null

  useLayoutEffect(() => {
    const container = hourlyScrollRef.current
    if (!container || hours.length === 0) return

    if (selectedDayIndex !== 0) {
      container.scrollLeft = 0
      return
    }

    const index = getCurrentHourIndex(hours, timezone)
    const cell = container.querySelector<HTMLElement>(`[data-hour-index="${index}"]`)
    if (!cell) return

    const containerRect = container.getBoundingClientRect()
    const cellRect = cell.getBoundingClientRect()
    const target =
      container.scrollLeft +
      (cellRect.left - containerRect.left) -
      (container.clientWidth - cell.clientWidth) / 2

    container.scrollTo({ left: Math.max(0, target), behavior: 'auto' })
  }, [selectedDayIndex, selectedDate, timezone, hours])

  return (
    <div className={styles.card}>
      <div className={styles.dayPicker} role="tablist" aria-label={t.hourly_forecast}>
        {forecast.time.map((dateStr, i) => {
          const date = new Date(dateStr)
          const label = i === 0 ? t.today : t.days[date.getUTCDay()]
          const isSelected = selectedDayIndex === i
          return (
            <button
              key={dateStr}
              type="button"
              role="tab"
              id={`forecast-day-${i}`}
              aria-selected={isSelected}
              aria-controls="forecast-hourly-panel"
              className={`${styles.dayTab} ${isSelected ? styles.dayTabSelected : ''}`}
              onClick={() => onSelectDay(i)}
            >
              <span className={styles.dayTabLabel}>{label}</span>
              <img
                className={styles.dayTabIcon}
                src={getWeatherIcon(forecast.weather_code[i])}
                alt=""
                aria-hidden
              />
              <span className={styles.dayTabTemps}>
                <span className={styles.dayTabMax}>
                  {Math.round(forecast.temperature_2m_max[i])}
                  {t.temp_unit}
                </span>
                <span className={styles.dayTabMin}>
                  {Math.round(forecast.temperature_2m_min[i])}
                  {t.temp_unit}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      {hours.length > 0 && (
        <div
          id="forecast-hourly-panel"
          role="tabpanel"
          aria-labelledby={`forecast-day-${selectedDayIndex}`}
          className={styles.hourlySection}
        >
          <h2 className={styles.hourlyHeading}>
            {dayLabel}
            <span className={styles.hourlyDate}>{dateLabel}</span>
          </h2>

          <div ref={hourlyScrollRef} className={styles.hourlyScroll}>
            {hours.map((hour, i) => (
              <div
                key={hour.time}
                data-hour-index={i}
                className={`${styles.hourCell} ${currentHourIndex === i ? styles.hourCellCurrent : ''}`}
              >
                <span className={styles.hourTime}>{formatHour(hour.time)}</span>
                <img
                  className={styles.hourIcon}
                  src={getWeatherIcon(hour.weatherCode)}
                  alt={getWeatherLabel(hour.weatherCode, t.weather)}
                />
                <span className={styles.hourTemp}>
                  {Math.round(hour.temperature)}
                  {t.temp_unit}
                </span>
                {hour.precipitationProbability > 0 ? (
                  <span className={styles.hourPrecip}>{hour.precipitationProbability}%</span>
                ) : (
                  <span className={styles.hourPrecipPlaceholder} aria-hidden />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
