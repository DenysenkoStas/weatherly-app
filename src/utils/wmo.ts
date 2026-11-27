// The labels cover every code Open-Meteo documents; any other code gets a neutral label
// instead of pretending to be a clear sky
export function getWeatherLabel(
  code: number,
  translations: Record<number, string>,
  unknown: string,
): string {
  return Object.hasOwn(translations, code) ? translations[code] : unknown
}
