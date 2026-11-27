import type { BrowserContext } from '@playwright/test'

// Fake API answers in the shape the app reads, built around the current time,
// so the forecast always has "today" and the next hours

interface Place {
  lat: number
  lon: number
  name: { uk: string; en: string }
  admin1: string
  /** Current temperature, different per place so tests can tell them apart */
  temperature: number
}

export const POLTAVA: Place = {
  lat: 49.58925,
  lon: 34.55367,
  name: { uk: 'Полтава', en: 'Poltava' },
  admin1: 'Полтавська область',
  temperature: -2,
}

export const KYIV: Place = {
  lat: 50.45466,
  lon: 30.5238,
  name: { uk: 'Київ', en: 'Kyiv' },
  admin1: 'Київ',
  temperature: 5,
}

const PLACES = [POLTAVA, KYIV]

function findPlace(lat: number): Place | undefined {
  return PLACES.find((place) => Math.abs(place.lat - lat) < 0.05)
}

const pad = (n: number) => String(n).padStart(2, '0')
const format = (d: Date) =>
  `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`

function forecast(place: Place) {
  const now = new Date()
  now.setUTCSeconds(0, 0)
  now.setUTCMinutes(Math.floor(now.getUTCMinutes() / 15) * 15)
  const t = place.temperature
  // Yesterday + 16 days, like past_days=1&forecast_days=16
  const yesterday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1)
  const days = Array.from({ length: 17 }, (_, i) => new Date(yesterday + i * 86_400_000))
  const hours = Array.from({ length: 17 * 24 }, (_, i) => new Date(yesterday + i * 3_600_000))
  const steps = Array.from({ length: 9 }, (_, i) => new Date(now.getTime() + i * 900_000))
  const date = (d: Date) => format(d).slice(0, 10)
  const each = <T>(list: unknown[], value: T) => list.map(() => value)

  return {
    timezone: 'UTC',
    utc_offset_seconds: 0,
    current: {
      time: format(now),
      temperature_2m: t,
      apparent_temperature: t - 3,
      relative_humidity_2m: 60,
      wind_speed_10m: 2,
      wind_direction_10m: 45,
      pressure_msl: 1020,
      precipitation: 0,
      uv_index: 0,
      is_day: 0,
      weather_code: 3,
    },
    daily: {
      time: days.map(date),
      weather_code: each(days, 3),
      temperature_2m_max: each(days, t + 2),
      temperature_2m_min: each(days, t - 3),
      sunrise: days.map((d) => `${date(d)}T07:00`),
      sunset: days.map((d) => `${date(d)}T16:00`),
      daylight_duration: each(days, 32_400),
      precipitation_probability_max: each(days, 5),
    },
    hourly: {
      time: hours.map(format),
      temperature_2m: each(hours, t),
      apparent_temperature: each(hours, t - 3),
      wind_speed_10m: each(hours, 2),
      wind_direction_10m: each(hours, 45),
      precipitation: each(hours, 0),
      weather_code: each(hours, 3),
      precipitation_probability: each(hours, 5),
      is_day: each(hours, 0),
    },
    minutely_15: {
      time: steps.map(format),
      precipitation: each(steps, 0),
      snowfall: each(steps, 0),
    },
  }
}

/** The answer for an API request; undefined for a place the mocks don't know */
function answer(url: URL): unknown {
  const params = url.searchParams
  switch (url.hostname) {
    case 'geocoding-api.open-meteo.com': {
      const query = (params.get('name') ?? '').toLowerCase()
      const results = PLACES.filter((place) =>
        Object.values(place.name).some((name) => name.toLowerCase().startsWith(query)),
      ).map((place, i) => ({
        id: i + 1,
        name: place.name.uk,
        country: 'Україна',
        country_code: 'UA',
        admin1: place.admin1,
        latitude: place.lat,
        longitude: place.lon,
      }))
      return results.length ? { results } : {}
    }
    case 'nominatim.openstreetmap.org': {
      const place = findPlace(Number(params.get('lat')))
      const language = params.get('accept-language') === 'en' ? 'en' : 'uk'
      return place ? { address: { city: place.name[language] } } : { error: 'Unable to geocode' }
    }
    case 'air-quality-api.open-meteo.com':
      return {
        current: {
          european_aqi: 23,
          pm2_5: 7,
          pm10: 9,
          alder_pollen: null,
          birch_pollen: null,
          grass_pollen: null,
          mugwort_pollen: null,
          olive_pollen: null,
          ragweed_pollen: null,
        },
      }
    default: {
      // api.open-meteo.com: the main forecast, or the favorites' temperatures (no `daily`)
      if (params.has('daily')) {
        const place = findPlace(Number(params.get('latitude')))
        return place && forecast(place)
      }
      const temperatures = (params.get('latitude') ?? '')
        .split(',')
        .map((lat) => ({ current: { temperature_2m: findPlace(Number(lat))?.temperature ?? 0 } }))
      return temperatures.length > 1 ? temperatures : temperatures[0]
    }
  }
}

const API_HOSTS =
  /^https:\/\/(api|air-quality-api|geocoding-api)\.open-meteo\.com\/|^https:\/\/nominatim\.openstreetmap\.org\//

/** Answers every API request of the context, the service worker's included */
export async function mockApis(context: BrowserContext): Promise<void> {
  await context.route(API_HOSTS, (route) => {
    const body = answer(new URL(route.request().url()))
    const headers = { 'access-control-allow-origin': '*' }
    return body === undefined
      ? route.fulfill({ status: 404, headers })
      : route.fulfill({ json: body, headers })
  })
}
