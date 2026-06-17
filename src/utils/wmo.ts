import { en } from '../locales'

type WmoWeather = typeof en.weather
type WmoCode = keyof WmoWeather

const VALID_CODES = new Set<number>([
  0, 1, 2, 3, 45, 48, 51, 53, 55, 61, 63, 65, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99,
])

export function getWeatherLabel(code: number, translations: WmoWeather): string {
  const key = (VALID_CODES.has(code) ? code : 0) as WmoCode
  return translations[key]
}
