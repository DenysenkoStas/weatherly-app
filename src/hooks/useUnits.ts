import { useCallback, useEffect, useState } from 'react'
import type { TemperatureUnit, Units, WindUnit } from '../types'

const STORAGE_KEY = 'weatherly-units'

export const DEFAULT_UNITS: Units = { temperature: 'celsius', wind: 'ms' }

export function loadUnits(): Units {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (typeof value !== 'object' || value === null) return DEFAULT_UNITS
    const { temperature, wind } = value as Record<string, unknown>
    return {
      temperature:
        temperature === 'celsius' || temperature === 'fahrenheit'
          ? temperature
          : DEFAULT_UNITS.temperature,
      wind: wind === 'ms' || wind === 'kmh' ? wind : DEFAULT_UNITS.wind,
    }
  } catch {
    return DEFAULT_UNITS
  }
}

export function useUnits() {
  const [units, setUnits] = useState<Units>(loadUnits)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(units))
    } catch {
      // Storage can be full or disabled (private mode) — the choice just isn't remembered
    }
  }, [units])

  const setTemperatureUnit = useCallback((temperature: TemperatureUnit) => {
    setUnits((prev) => (prev.temperature === temperature ? prev : { ...prev, temperature }))
  }, [])

  const setWindUnit = useCallback((wind: WindUnit) => {
    setUnits((prev) => (prev.wind === wind ? prev : { ...prev, wind }))
  }, [])

  return { units, setTemperatureUnit, setWindUnit }
}
