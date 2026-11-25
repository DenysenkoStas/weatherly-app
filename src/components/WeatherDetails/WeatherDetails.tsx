import thermometerAnimated from '@meteocons/svg/fill/thermometer.svg?url'
import thermometerStill from '@meteocons/svg-static/fill/thermometer.svg?url'
import humidityAnimated from '@meteocons/svg/fill/humidity.svg?url'
import humidityStill from '@meteocons/svg-static/fill/humidity.svg?url'
import windAnimated from '@meteocons/svg/fill/wind.svg?url'
import windStill from '@meteocons/svg-static/fill/wind.svg?url'
import barometerAnimated from '@meteocons/svg/fill/barometer.svg?url'
import barometerStill from '@meteocons/svg-static/fill/barometer.svg?url'
import uvIndexAnimated from '@meteocons/svg/fill/uv-index.svg?raw'
import uvIndexStill from '@meteocons/svg-static/fill/uv-index.svg?raw'
import raindropAnimated from '@meteocons/svg/fill/raindrop.svg?url'
import raindropStill from '@meteocons/svg-static/fill/raindrop.svg?url'
import sunriseAnimated from '@meteocons/svg/fill/sunrise.svg?raw'
import sunriseStill from '@meteocons/svg-static/fill/sunrise.svg?raw'
import sunsetAnimated from '@meteocons/svg/fill/sunset.svg?raw'
import sunsetStill from '@meteocons/svg-static/fill/sunset.svg?raw'
import type { ReactNode } from 'react'
import type { IconSources, WeatherCurrent } from '../../types'
import {
  formatDuration,
  formatHour,
  getCompassIndex,
  getDaylightProgress,
  getUvLevel,
} from '../../utils'
import type { UvLevel } from '../../utils'
import { MeteoIcon } from '../MeteoIcon'
import styles from './WeatherDetails.module.scss'

// These icons draw details (the "UV" text, the horizon line) in near-black, which disappears
// on the dark card: a mid gray reads in both themes
function withVisibleDetails(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg.replace('#202939', '#64748b'))}`
}

const thermometerIcon: IconSources = { animated: thermometerAnimated, still: thermometerStill }
const humidityIcon: IconSources = { animated: humidityAnimated, still: humidityStill }
const windIcon: IconSources = { animated: windAnimated, still: windStill }
const barometerIcon: IconSources = { animated: barometerAnimated, still: barometerStill }
const raindropIcon: IconSources = { animated: raindropAnimated, still: raindropStill }
const uvIndexIcon: IconSources = {
  animated: withVisibleDetails(uvIndexAnimated),
  still: withVisibleDetails(uvIndexStill),
}
const sunriseIcon: IconSources = {
  animated: withVisibleDetails(sunriseAnimated),
  still: withVisibleDetails(sunriseStill),
}
const sunsetIcon: IconSources = {
  animated: withVisibleDetails(sunsetAnimated),
  still: withVisibleDetails(sunsetStill),
}

export interface WeatherDetailsTranslations {
  weather_details: string
  feels_like: string
  humidity: string
  wind: string
  wind_unit: string
  temp_unit: string
  pressure: string
  pressure_unit: string
  uv_index: string
  uv_levels: Record<UvLevel, string>
  precipitation_amount: string
  precipitation_unit: string
  directions: readonly string[]
  sunrise: string
  sunset: string
  daylight: string
  hours_short: string
  minutes_short: string
}

export interface SunTimes {
  sunrise: string
  sunset: string
  daylightDuration: number
}

interface WeatherDetailsProps {
  weather: WeatherCurrent
  sun: SunTimes | null
  // inline: part of the weather card (mobile); card: a card of its own (desktop)
  variant?: 'inline' | 'card'
  t: WeatherDetailsTranslations
}

interface DetailProps {
  icon: IconSources
  iconClassName?: string
  label: string
  value: ReactNode
  hint?: string
  // Show the hint next to the value instead of on its own line
  inlineHint?: boolean
}

function Detail({ icon, iconClassName, label, value, hint, inlineHint = false }: DetailProps) {
  return (
    <div className={styles.detail}>
      <MeteoIcon
        className={`${styles.detailIcon}${iconClassName ? ` ${iconClassName}` : ''}`}
        icon={icon}
        alt=""
        width={36}
        height={36}
      />
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>
        {value}
        {hint && inlineHint && <span className={styles.hintInline}>{hint}</span>}
      </span>
      {hint && !inlineHint && <span className={styles.hint}>{hint}</span>}
    </div>
  )
}

export function WeatherDetails({ weather, sun, variant = 'inline', t }: WeatherDetailsProps) {
  const isCard = variant === 'card'
  const direction = t.directions[getCompassIndex(weather.wind_direction_10m)]
  const uvLevel = getUvLevel(weather.uv_index)
  const daylightProgress = sun ? getDaylightProgress(sun.sunrise, sun.sunset, weather.time) : null

  // On desktop the details are a card of their own, so they get a region name
  const Root = isCard ? 'section' : 'div'

  return (
    <Root
      className={isCard ? styles.card : styles.inline}
      aria-label={isCard ? t.weather_details : undefined}
    >
      <div className={styles.details}>
        <Detail
          inlineHint={isCard}
          icon={thermometerIcon}
          label={t.feels_like}
          value={`${Math.round(weather.apparent_temperature)}${t.temp_unit}`}
        />
        <Detail
          inlineHint={isCard}
          icon={humidityIcon}
          label={t.humidity}
          value={`${weather.relative_humidity_2m}%`}
        />
        <Detail
          inlineHint={isCard}
          icon={windIcon}
          iconClassName={styles.windIcon}
          label={t.wind}
          value={
            <>
              <svg
                className={styles.windArrow}
                style={{ transform: `rotate(${weather.wind_direction_10m + 180}deg)` }}
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
              {Math.round(weather.wind_speed_10m)} {t.wind_unit}
            </>
          }
          hint={direction}
        />
        <Detail
          inlineHint={isCard}
          icon={barometerIcon}
          label={t.pressure}
          value={`${Math.round(weather.pressure_msl)} ${t.pressure_unit}`}
        />
        <Detail
          inlineHint={isCard}
          icon={uvIndexIcon}
          label={t.uv_index}
          value={Math.round(weather.uv_index)}
          hint={t.uv_levels[uvLevel]}
        />
        <Detail
          inlineHint={isCard}
          icon={raindropIcon}
          label={t.precipitation_amount}
          value={`${Number(weather.precipitation.toFixed(1))} ${t.precipitation_unit}`}
        />
      </div>

      {sun && (
        <div className={styles.sun}>
          <div className={styles.sunEnd}>
            <MeteoIcon className={styles.sunIcon} icon={sunriseIcon} width={40} height={40} />
            <span className={styles.sunTime}>{formatHour(sun.sunrise)}</span>
            <span className={styles.label}>{t.sunrise}</span>
          </div>

          <div className={styles.sunMiddle}>
            <div className={styles.sunTrack}>
              {daylightProgress !== null && (
                <>
                  <div className={styles.sunFill} style={{ width: `${daylightProgress * 100}%` }} />
                  <div className={styles.sunDot} style={{ left: `${daylightProgress * 100}%` }} />
                </>
              )}
            </div>
            <span className={styles.hint}>
              {t.daylight} {formatDuration(sun.daylightDuration, t)}
            </span>
          </div>

          <div className={styles.sunEnd}>
            <MeteoIcon className={styles.sunIcon} icon={sunsetIcon} width={40} height={40} />
            <span className={styles.sunTime}>{formatHour(sun.sunset)}</span>
            <span className={styles.label}>{t.sunset}</span>
          </div>
        </div>
      )}
    </Root>
  )
}
