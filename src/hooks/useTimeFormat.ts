import { createContext, useContext, useEffect, useState } from 'react'
import type { Language, TimeFormat } from '../types'
import type { Clock } from '../utils'

const STORAGE_KEY = 'weatherly-time-format'

export function loadTimeFormat(): TimeFormat {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === '12h' || stored === '24h' ? stored : 'auto'
  } catch {
    return 'auto'
  }
}

export function useTimeFormat() {
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(loadTimeFormat)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, timeFormat)
    } catch {
      // Storage can be full or disabled (private mode) — the choice just isn't remembered
    }
  }, [timeFormat])

  return { timeFormat, setTimeFormat }
}

/** `auto` follows the app language: 12-hour in English, 24-hour in Ukrainian */
export function getClock(timeFormat: TimeFormat, language: Language): Clock {
  return {
    locale: language,
    hour12: timeFormat === '12h' || (timeFormat === 'auto' && language === 'en'),
  }
}

// Without a provider (component tests): 24-hour, English
export const ClockContext = createContext<Clock>({ locale: 'en', hour12: false })

export function useClock(): Clock {
  return useContext(ClockContext)
}
