import type { Coords } from '../types'
import { isValidCoords } from '../utils'

const STORAGE_KEY = 'weatherly_last_location'

export function loadLastLocation(): Coords | null {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (typeof value !== 'object' || value === null) return null
    const { lat, lon } = value as Record<string, unknown>
    return isValidCoords(lat, lon) ? { lat: lat as number, lon: lon as number } : null
  } catch {
    return null
  }
}

export function saveLastLocation(coords: Coords): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat: coords.lat, lon: coords.lon }))
  } catch {
    // Storage can be full or disabled (private mode) — remembering the city is optional
  }
}
