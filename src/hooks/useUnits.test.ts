import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { DEFAULT_UNITS, loadUnits, useUnits } from './useUnits'

describe('loadUnits', () => {
  it('defaults to °C and m/s', () => {
    expect(loadUnits()).toEqual(DEFAULT_UNITS)
  })

  it('keeps valid values and replaces invalid ones', () => {
    localStorage.setItem(
      'weatherly-units',
      JSON.stringify({ temperature: 'fahrenheit', wind: 'mph' }),
    )
    expect(loadUnits()).toEqual({ temperature: 'fahrenheit', wind: 'ms' })

    localStorage.setItem('weatherly-units', '{broken')
    expect(loadUnits()).toEqual(DEFAULT_UNITS)
  })
})

describe('useUnits', () => {
  it('changes and remembers the units', () => {
    const { result } = renderHook(() => useUnits())

    act(() => result.current.setTemperatureUnit('fahrenheit'))
    act(() => result.current.setWindUnit('kmh'))

    expect(result.current.units).toEqual({ temperature: 'fahrenheit', wind: 'kmh' })
    expect(JSON.parse(localStorage.getItem('weatherly-units') ?? '')).toEqual({
      temperature: 'fahrenheit',
      wind: 'kmh',
    })
  })
})
