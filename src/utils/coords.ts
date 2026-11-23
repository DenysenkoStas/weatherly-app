import type { Coords } from '../types'

export function isValidCoords(lat: unknown, lon: unknown): boolean {
  return (
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lon) <= 180
  )
}

// Two decimals (~1 km) are enough for weather and keep a shared link from exposing an exact position
function formatCoord(value: number): string {
  return String(Number(value.toFixed(2)))
}

/** Reads `?lat=…&lon=…` from a query string */
export function parseLocationParams(search: string): Coords | null {
  const params = new URLSearchParams(search)
  const latParam = params.get('lat')
  const lonParam = params.get('lon')
  if (!latParam?.trim() || !lonParam?.trim()) return null

  const lat = Number(latParam)
  const lon = Number(lonParam)
  return isValidCoords(lat, lon) ? { lat, lon } : null
}

/** Returns `href` with `lat`/`lon` set to the coordinates, or removed when there are none */
export function withLocationParams(href: string, coords: Coords | null): string {
  const url = new URL(href)
  if (coords) {
    url.searchParams.set('lat', formatCoord(coords.lat))
    url.searchParams.set('lon', formatCoord(coords.lon))
  } else {
    url.searchParams.delete('lat')
    url.searchParams.delete('lon')
  }
  return url.toString()
}
