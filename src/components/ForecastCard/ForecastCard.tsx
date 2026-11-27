import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { WeatherDaily, WeatherHourly } from '../../types'
import {
  getHourlyForDay,
  formatHour,
  getCurrentHourIndex,
  getChartPoints,
  getLinePath,
  getAreaPath,
  getBarHeights,
  getCompassIndex,
} from '../../utils'
import type { HourlyEntry } from '../../utils'
import { getWeatherIcon } from '../../utils/wmoIcons'
import { MeteoIcon } from '../MeteoIcon'
import { getWeatherLabel } from '../../utils'
import { useHorizontalScroll } from '../../hooks/useHorizontalScroll'
import styles from './ForecastCard.module.scss'

// Keep in sync with .hourlyTrack in ForecastCard.module.scss
const HOUR_CELL_WIDTH = 56
const HOUR_CELL_GAP = 4
const HOUR_STEP = HOUR_CELL_WIDTH + HOUR_CELL_GAP
// Minimum span of the chart scale, so small changes stay gentle slopes
const CHART_MIN_RANGE: Record<Exclude<HourlyView, 'precipitation'>, number> = {
  temperature: 8,
  feels_like: 8,
  wind: 5,
}
// mm: the precipitation bars fill the chart from this amount up
const PRECIPITATION_MIN_SCALE = 1
const BAR_WIDTH = 24
// Keep in sync with the edge-fade size: a selected day under the fade scrolls out of it
const DAY_PICKER_FADE = 24

const HOURLY_VIEWS = ['temperature', 'feels_like', 'wind', 'precipitation'] as const
type HourlyView = (typeof HOURLY_VIEWS)[number]

const getHourlyValue: Record<HourlyView, (hour: HourlyEntry) => number> = {
  temperature: (hour) => hour.temperature,
  feels_like: (hour) => hour.feelsLike,
  wind: (hour) => hour.windSpeed,
  precipitation: (hour) => hour.precipitation,
}

interface ForecastCardTranslations {
  days: readonly string[]
  months: readonly string[]
  today: string
  temp_unit: string
  wind_unit: string
  precipitation_unit: string
  directions: readonly string[]
  hourly_view: string
  hourly_views: Record<HourlyView, string>
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
  const viewName = useId()
  // Stays when another day is picked
  const [view, setView] = useState<HourlyView>('temperature')
  const dayPickerOverflow = useHorizontalScroll(dayPickerRef, forecast.time.length)

  const selectedDate = forecast.time[selectedDayIndex]
  const hours = useMemo(() => getHourlyForDay(hourly, selectedDate), [hourly, selectedDate])
  const selectedDateObj = new Date(selectedDate)
  const dayLabel = selectedDayIndex === 0 ? t.today : t.days[selectedDateObj.getUTCDay()]
  const dateLabel = `${selectedDateObj.getUTCDate()} ${t.months[selectedDateObj.getUTCMonth()]}`
  const currentHourIndex = selectedDayIndex === 0 ? getCurrentHourIndex(hours, timezone) : null

  const trackWidth = hours.length * HOUR_STEP - HOUR_CELL_GAP
  const values = useMemo(() => hours.map(getHourlyValue[view]), [hours, view])
  const chartPoints = useMemo(
    () =>
      getChartPoints(
        values,
        HOUR_STEP,
        HOUR_CELL_WIDTH / 2,
        15,
        view === 'precipitation' ? 0 : CHART_MIN_RANGE[view],
      ),
    [values, view],
  )
  const barHeights = useMemo(
    () => (view === 'precipitation' ? getBarHeights(values, PRECIPITATION_MIN_SCALE) : []),
    [values, view],
  )
  // Wind and precipitation have no unit in the cells: it is named next to the date
  const viewUnit =
    view === 'wind' ? t.wind_unit : view === 'precipitation' ? t.precipitation_unit : null

  const renderValue = (hour: HourlyEntry) => {
    switch (view) {
      case 'temperature':
      case 'feels_like':
        return `${Math.round(getHourlyValue[view](hour))}${t.temp_unit}`
      case 'wind':
        return (
          <>
            <svg
              className={styles.windArrow}
              style={{ transform: `rotate(${hour.windDirection + 180}deg)` }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 20V4M6 10l6-6 6 6" />
            </svg>
            {Math.round(hour.windSpeed)}
            <span className={styles.visuallyHidden}>
              {` ${t.wind_unit}, ${t.directions[getCompassIndex(hour.windDirection)]}`}
            </span>
          </>
        )
      case 'precipitation':
        return (
          <>
            {Number(hour.precipitation.toFixed(1))}
            <span className={styles.visuallyHidden}> {t.precipitation_unit}</span>
          </>
        )
    }
  }

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

  // Two weeks of days don't fit: bring the selected one fully into view, clear of the edge fade
  useLayoutEffect(() => {
    const picker = dayPickerRef.current
    const tab = picker?.querySelector<HTMLElement>(`[data-day-index="${selectedDayIndex}"]`)
    if (!picker || !tab) return

    const pickerRect = picker.getBoundingClientRect()
    const tabRect = tab.getBoundingClientRect()
    const hiddenStart = pickerRect.left + DAY_PICKER_FADE - tabRect.left
    const hiddenEnd = tabRect.right - (pickerRect.right - DAY_PICKER_FADE)
    if (hiddenStart > 0) picker.scrollLeft -= hiddenStart
    else if (hiddenEnd > 0) picker.scrollLeft += hiddenEnd
  }, [selectedDayIndex])

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
        data-fade-start={dayPickerOverflow.start || undefined}
        data-fade-end={dayPickerOverflow.end || undefined}
      >
        {forecast.time.map((dateStr, i) => {
          const date = new Date(dateStr)
          // The weekday repeats over two weeks: the day of the month tells them apart
          const label = i === 0 ? t.today : `${t.days[date.getUTCDay()]} ${date.getUTCDate()}`
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
          <div className={styles.hourlyHeader}>
            <h2 className={styles.hourlyHeading}>
              {dayLabel}
              <span className={styles.hourlyDate}>
                {dateLabel}
                {viewUnit && ` · ${viewUnit}`}
              </span>
            </h2>

            <fieldset className={styles.views}>
              <legend className={styles.visuallyHidden}>{t.hourly_view}</legend>
              {HOURLY_VIEWS.map((option) => (
                <label key={option} className={styles.view}>
                  <input
                    className={styles.viewInput}
                    type="radio"
                    name={viewName}
                    value={option}
                    checked={view === option}
                    onChange={() => setView(option)}
                  />
                  <span className={styles.viewLabel}>{t.hourly_views[option]}</span>
                </label>
              ))}
            </fieldset>
          </div>

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
                  {view === 'precipitation' ? (
                    chartPoints.map((point, i) => (
                      <rect
                        key={hours[i].time}
                        className={`${styles.chartBar} ${currentHourIndex === i ? styles.chartBarCurrent : ''}`}
                        x={point.x - BAR_WIDTH / 2}
                        y={100 - barHeights[i]}
                        width={BAR_WIDTH}
                        height={barHeights[i]}
                      />
                    ))
                  ) : (
                    <>
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
                    </>
                  )}
                </svg>
                {view !== 'precipitation' &&
                  chartPoints.map((point, i) => (
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
                  <span className={styles.hourValue}>{renderValue(hour)}</span>
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
