import type { WeatherHourly } from '../types'

export interface HourlyEntry {
  time: string
  temperature: number
  weatherCode: number
  precipitationProbability: number
}

export function getHourlyForDay(hourly: WeatherHourly, dateStr: string): HourlyEntry[] {
  return hourly.time
    .map((time, i) => ({
      time,
      temperature: hourly.temperature_2m[i],
      weatherCode: hourly.weather_code[i],
      precipitationProbability: hourly.precipitation_probability[i] ?? 0,
    }))
    .filter((entry) => entry.time.startsWith(dateStr))
}

export function formatHour(isoTime: string): string {
  return isoTime.slice(11, 16)
}

function getHourlyTimeKey(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
  }).formatToParts(date)

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '00'

  return `${value('year')}-${value('month')}-${value('day')}T${value('hour')}:00`
}

export function getCurrentHourIndex(hours: HourlyEntry[], timeZone: string): number {
  if (hours.length === 0) return 0

  const nowKey = getHourlyTimeKey(new Date(), timeZone)
  let index = 0

  for (let i = 0; i < hours.length; i++) {
    if (hours[i].time <= nowKey) {
      index = i
    } else {
      break
    }
  }

  return index
}
