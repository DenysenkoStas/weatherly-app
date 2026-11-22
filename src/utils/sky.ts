export type Sky = 'clear-day' | 'clear-night' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'storm'

/** Groups a WMO weather code into a background mood. */
export function getSky(code: number, isDay: boolean): Sky {
  if (code <= 1) return isDay ? 'clear-day' : 'clear-night'
  if (code === 2 || code === 3) return 'cloudy'
  if (code === 45 || code === 48) return 'fog'
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow'
  if (code >= 95) return 'storm'
  if (code >= 51 && code <= 82) return 'rain'
  return 'cloudy'
}
