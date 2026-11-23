import type { WeatherResponse, YesterdayHourly } from '../types'

/**
 * With `past_days=1` the response starts with yesterday. Splits it off, so the rest of the app
 * keeps seeing today as the first day. A response without a past day comes back unchanged.
 */
export function splitPastDay(data: WeatherResponse): {
  data: WeatherResponse
  yesterday: YesterdayHourly | null
} {
  const today = data.current?.time?.slice(0, 10)
  const firstDay = data.daily?.time?.[0]
  if (!today || !firstDay || firstDay >= today) return { data, yesterday: null }

  // Hours of yesterday by their date, not a fixed 24: a DST day has 23 or 25 hours
  const pastHours = data.hourly.time.filter((time) => time.startsWith(firstDay)).length
  const dropDay = <T>(values: T[]) => values.slice(1)
  const dropHours = <T>(values: T[]) => values.slice(pastHours)

  return {
    data: {
      ...data,
      daily: {
        time: dropDay(data.daily.time),
        weather_code: dropDay(data.daily.weather_code),
        temperature_2m_max: dropDay(data.daily.temperature_2m_max),
        temperature_2m_min: dropDay(data.daily.temperature_2m_min),
        sunrise: dropDay(data.daily.sunrise),
        sunset: dropDay(data.daily.sunset),
        daylight_duration: dropDay(data.daily.daylight_duration),
        precipitation_probability_max: dropDay(data.daily.precipitation_probability_max),
      },
      hourly: {
        time: dropHours(data.hourly.time),
        temperature_2m: dropHours(data.hourly.temperature_2m),
        weather_code: dropHours(data.hourly.weather_code),
        precipitation_probability: dropHours(data.hourly.precipitation_probability),
        is_day: dropHours(data.hourly.is_day),
      },
    },
    yesterday: {
      time: data.hourly.time.slice(0, pastHours),
      temperature_2m: data.hourly.temperature_2m.slice(0, pastHours),
    },
  }
}

export interface YesterdayComparison {
  /** Rounded like the temperatures on screen: today minus yesterday */
  difference: number
  yesterdayTemperature: number
  /** Yesterday's hour that was compared, e.g. "17:00" */
  hour: string
}

/** Current temperature against yesterday at the same hour (local time of the city) */
export function compareWithYesterday(
  currentTime: string,
  currentTemperature: number,
  yesterday: YesterdayHourly | null,
): YesterdayComparison | null {
  const firstTime = yesterday?.time[0]
  if (!yesterday || !firstTime) return null

  const hour = `${currentTime.slice(11, 13)}:00`
  const index = yesterday.time.indexOf(`${firstTime.slice(0, 10)}T${hour}`)
  const temperature = yesterday.temperature_2m[index]
  if (index === -1 || temperature === null || temperature === undefined) return null

  const yesterdayTemperature = Math.round(temperature)
  return {
    difference: Math.round(currentTemperature) - yesterdayTemperature,
    yesterdayTemperature,
    hour,
  }
}
