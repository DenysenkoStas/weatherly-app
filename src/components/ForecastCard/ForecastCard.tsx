import { useId, useLayoutEffect, useMemo, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import type { WeatherDaily, WeatherHourly } from '../../types'
import {
  getHourlyForDay,
  formatHour,
  getCurrentHourIndex,
  getChartPoints,
  getLinePath,
  getAreaPath,
} from '../../utils'
import { getWeatherIcon } from '../../utils/wmoIcons'
import { MeteoIcon } from '../MeteoIcon'
import { getWeatherLabel } from '../../utils'
import styles from './ForecastCard.module.scss'

// Keep in sync with .hourlyTrack in ForecastCard.module.scss
const HOUR_CELL_WIDTH = 56
const HOUR_CELL_GAP = 4
const HOUR_STEP = HOUR_CELL_WIDTH + HOUR_CELL_GAP
// Minimum temperature span of the chart scale, in degrees
const CHART_MIN_RANGE = 8

interface ForecastCardTranslations {
  days: readonly string[]
  months: readonly string[]
  today: string
  temp_unit: string
  forecast: string
  forecast_days: string
  hourly_forecast: string
  now: string
  precipitation_chance: string
  weather: Record<number, string>
  weather_unknown: string
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
  const dayPickerRef = useRef<HTMLDivElement>(null)
  const gradientId = `chart-fill-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

  const selectedDate = forecast.time[selectedDayIndex]
  const hours = useMemo(() => getHourlyForDay(hourly, selectedDate), [hourly, selectedDate])
  const selectedDateObj = new Date(selectedDate)
  const dayLabel = selectedDayIndex === 0 ? t.today : t.days[selectedDateObj.getUTCDay()]
  const dateLabel = `${selectedDateObj.getUTCDate()} ${t.months[selectedDateObj.getUTCMonth()]}`
  const currentHourIndex = selectedDayIndex === 0 ? getCurrentHourIndex(hours, timezone) : null

  const trackWidth = hours.length * HOUR_STEP - HOUR_CELL_GAP
  const chartPoints = useMemo(
    () =>
      getChartPoints(
        hours.map((hour) => hour.temperature),
        HOUR_STEP,
        HOUR_CELL_WIDTH / 2,
        15,
        CHART_MIN_RANGE,
      ),
    [hours],
  )

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

  // Tabs pattern: one Tab stop for the whole row, arrows and Home/End pick the day
  const handleDayKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = forecast.time.length - 1
    const next = {
      ArrowLeft: selectedDayIndex > 0 ? selectedDayIndex - 1 : last,
      ArrowRight: selectedDayIndex < last ? selectedDayIndex + 1 : 0,
      Home: 0,
      End: last,
    }[event.key]
    if (next === undefined) return
    event.preventDefault()
    onSelectDay(next)
    dayPickerRef.current?.querySelector<HTMLButtonElement>(`[data-day-index="${next}"]`)?.focus()
  }

  return (
    <section className={styles.card} aria-label={t.forecast}>
      <div
        ref={dayPickerRef}
        className={styles.dayPicker}
        role="tablist"
        aria-label={t.forecast_days}
      >
        {forecast.time.map((dateStr, i) => {
          const date = new Date(dateStr)
          const label = i === 0 ? t.today : t.days[date.getUTCDay()]
          const isSelected = selectedDayIndex === i
          const precipChance = forecast.precipitation_probability_max[i] ?? 0
          return (
            <button
              key={dateStr}
              type="button"
              role="tab"
              id={`forecast-day-${i}`}
              aria-selected={isSelected}
              aria-controls="forecast-hourly-panel"
              tabIndex={isSelected ? 0 : -1}
              data-day-index={i}
              className={`${styles.dayTab} ${isSelected ? styles.dayTabSelected : ''}`}
              onClick={() => onSelectDay(i)}
              onKeyDown={handleDayKeyDown}
            >
              <span className={styles.dayTabLabel}>{label}</span>
              <MeteoIcon
                className={styles.dayTabIcon}
                icon={getWeatherIcon(forecast.weather_code[i])}
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
              {precipChance > 0 ? (
                <span className={styles.dayTabPrecip} title={t.precipitation_chance}>
                  <span className={styles.visuallyHidden}>{t.precipitation_chance}: </span>
                  {precipChance}%
                </span>
              ) : (
                <span className={styles.dayTabPrecipPlaceholder} aria-hidden />
              )}
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

          {/* Focusable, so the keyboard can scroll the hours with the arrow keys */}
          <div
            ref={hourlyScrollRef}
            className={styles.hourlyScroll}
            tabIndex={0}
            role="region"
            aria-label={t.hourly_forecast}
          >
            <div
              role="list"
              className={styles.hourlyTrack}
              style={{ gridTemplateColumns: `repeat(${hours.length}, ${HOUR_CELL_WIDTH}px)` }}
            >
              <div className={styles.chart} aria-hidden>
                <svg
                  className={styles.chartSvg}
                  width={trackWidth}
                  viewBox={`0 0 ${trackWidth} 100`}
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" className={styles.chartFillTop} />
                      <stop offset="100%" className={styles.chartFillBottom} />
                    </linearGradient>
                  </defs>
                  <path d={getAreaPath(chartPoints)} fill={`url(#${gradientId})`} />
                  <path
                    d={getLinePath(chartPoints)}
                    className={styles.chartLine}
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
                {chartPoints.map((point, i) => (
                  <span
                    key={hours[i].time}
                    className={`${styles.chartDot} ${currentHourIndex === i ? styles.chartDotCurrent : ''}`}
                    style={{ left: point.x, top: `${point.y}%` }}
                  />
                ))}
              </div>

              {hours.map((hour, i) => (
                <div
                  key={hour.time}
                  role="listitem"
                  aria-current={currentHourIndex === i ? 'time' : undefined}
                  data-hour-index={i}
                  className={`${styles.hourCell} ${currentHourIndex === i ? styles.hourCellCurrent : ''}`}
                >
                  <span className={styles.hourTime}>
                    {currentHourIndex === i && (
                      <span className={styles.visuallyHidden}>{t.now}, </span>
                    )}
                    {formatHour(hour.time)}
                  </span>
                  <MeteoIcon
                    className={styles.hourIcon}
                    icon={getWeatherIcon(hour.weatherCode, hour.isDay)}
                    alt={getWeatherLabel(hour.weatherCode, t.weather, t.weather_unknown)}
                  />
                  <span className={styles.hourTemp}>
                    {Math.round(hour.temperature)}
                    {t.temp_unit}
                  </span>
                  {hour.precipitationProbability > 0 ? (
                    <span className={styles.hourPrecip}>
                      <span className={styles.visuallyHidden}>{t.precipitation_chance}: </span>
                      {hour.precipitationProbability}%
                    </span>
                  ) : (
                    <span className={styles.hourPrecipPlaceholder} aria-hidden />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
