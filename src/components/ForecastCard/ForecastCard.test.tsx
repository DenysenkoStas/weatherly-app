import { useState } from 'react'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import type { WeatherDaily, WeatherHourly } from '../../types'
import { en } from '../../locales'
import { ForecastCard } from './ForecastCard'

const days = ['2026-11-23', '2026-11-24', '2026-11-25']

const forecast: WeatherDaily = {
  time: days,
  weather_code: [0, 3, 61],
  temperature_2m_max: [5, 4, 3],
  temperature_2m_min: [-1, -2, -3],
  sunrise: days.map((day) => `${day}T07:40`),
  sunset: days.map((day) => `${day}T16:30`),
  daylight_duration: [31000, 30900, 30800],
  precipitation_probability_max: [0, 10, 80],
}

const hourlyTimes = days.flatMap((day) => [`${day}T12:00`, `${day}T13:00`])

const hourly: WeatherHourly = {
  time: hourlyTimes,
  temperature_2m: hourlyTimes.map(() => 2),
  weather_code: hourlyTimes.map(() => 3),
  precipitation_probability: hourlyTimes.map(() => 0),
  is_day: hourlyTimes.map(() => 1),
}

function Forecast() {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  return (
    <ForecastCard
      forecast={forecast}
      hourly={hourly}
      timezone="UTC"
      selectedDayIndex={selectedDayIndex}
      onSelectDay={setSelectedDayIndex}
      t={{ ...en, temp_unit: '°C' }}
    />
  )
}

describe('ForecastCard day tabs', () => {
  // jsdom has no Element.scrollTo, which the card uses to center the current hour
  const originalScrollTo = Element.prototype.scrollTo
  beforeAll(() => {
    Element.prototype.scrollTo = vi.fn()
  })
  afterAll(() => {
    Element.prototype.scrollTo = originalScrollTo
  })

  it('keeps a single tab in the Tab order', () => {
    render(<Forecast />)

    const tabs = screen.getAllByRole('tab')
    expect(tabs.map((tab) => tab.tabIndex)).toEqual([0, -1, -1])
  })

  it('moves between days with the arrow, Home and End keys', () => {
    render(<Forecast />)
    const tabs = screen.getAllByRole('tab')

    fireEvent.keyDown(tabs[0], { key: 'ArrowRight' })
    expect(tabs[1].getAttribute('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(tabs[1])

    fireEvent.keyDown(tabs[1], { key: 'End' })
    expect(tabs[2].getAttribute('aria-selected')).toBe('true')

    // Wraps around past the last day
    fireEvent.keyDown(tabs[2], { key: 'ArrowRight' })
    expect(tabs[0].getAttribute('aria-selected')).toBe('true')

    fireEvent.keyDown(tabs[0], { key: 'ArrowLeft' })
    expect(tabs[2].getAttribute('aria-selected')).toBe('true')

    fireEvent.keyDown(tabs[2], { key: 'Home' })
    expect(tabs[0].getAttribute('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(tabs[0])
  })
})
