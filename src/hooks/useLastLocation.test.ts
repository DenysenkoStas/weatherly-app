import { describe, expect, it } from 'vitest'
import { loadLastLocation, saveLastLocation } from './useLastLocation'

describe('last location storage', () => {
  it('returns null when nothing is saved', () => {
    expect(loadLastLocation()).toBeNull()
  })

  it('restores saved coordinates', () => {
    saveLastLocation({ lat: 49.59, lon: 34.55 })

    expect(loadLastLocation()).toEqual({ lat: 49.59, lon: 34.55 })
  })

  it('ignores broken or invalid data', () => {
    localStorage.setItem('weatherly_last_location', '{not json')
    expect(loadLastLocation()).toBeNull()

    localStorage.setItem('weatherly_last_location', JSON.stringify({ lat: '49', lon: 34 }))
    expect(loadLastLocation()).toBeNull()

    localStorage.setItem('weatherly_last_location', JSON.stringify({ lat: 120, lon: 34 }))
    expect(loadLastLocation()).toBeNull()
  })
})
