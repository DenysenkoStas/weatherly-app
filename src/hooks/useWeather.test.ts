import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useWeather } from './useWeather'
import type { WeatherResponse } from '../types'

const response = {
  timezone: 'Europe/Kyiv',
  current: { temperature_2m: 3 },
  daily: { time: ['2026-11-23'] },
  hourly: { time: ['2026-11-23T00:00'], apparent_temperature: [1] },
} as unknown as WeatherResponse

const ok = () => Promise.resolve(new Response(JSON.stringify(response)))

describe('useWeather', () => {
  it('shows the saved forecast of the same place when offline', async () => {
    const fetchMock = vi.fn<typeof fetch>(ok)
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() => useWeather())

    await act(() => result.current.fetch(49.59, 34.55))
    expect(result.current.fromCache).toBe(false)
    const savedAt = result.current.updatedAt

    fetchMock.mockImplementation(() => Promise.reject(new TypeError('Failed to fetch')))
    await act(() => result.current.fetch(49.59, 34.55, { silent: true }))

    expect(result.current.error).toBeNull()
    expect(result.current.fromCache).toBe(true)
    expect(result.current.weather?.temperature_2m).toBe(3)
    expect(result.current.updatedAt?.getTime()).toBe(savedAt?.getTime())
  })

  it('finds the copy from the rounded coordinates of the page link', async () => {
    const fetchMock = vi.fn<typeof fetch>(ok)
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() => useWeather())

    // Opened from search with exact coordinates, reopened offline from ?lat=49.59&lon=34.55
    await act(() => result.current.fetch(49.5883, 34.5514))
    fetchMock.mockImplementation(() => Promise.reject(new TypeError('Failed to fetch')))
    await act(() => result.current.fetch(49.59, 34.55))

    expect(result.current.error).toBeNull()
    expect(result.current.fromCache).toBe(true)
  })

  it('skips a copy saved by an older version without the newer fields', async () => {
    const fetchMock = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        new Response(JSON.stringify({ ...response, hourly: { time: ['2026-11-23T00:00'] } })),
      ),
    )
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() => useWeather())

    await act(() => result.current.fetch(49.59, 34.55))
    fetchMock.mockImplementation(() => Promise.reject(new TypeError('Failed to fetch')))
    await act(() => result.current.fetch(49.59, 34.55))

    expect(result.current.error).toBe('fetch_failed')
    expect(result.current.fromCache).toBe(false)
  })

  it('reports an error offline when there is no copy of that place', async () => {
    const fetchMock = vi.fn<typeof fetch>(ok)
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() => useWeather())

    await act(() => result.current.fetch(49.59, 34.55))
    fetchMock.mockImplementation(() => Promise.reject(new TypeError('Failed to fetch')))
    await act(() => result.current.fetch(50.45, 30.52))

    expect(result.current.error).toBe('fetch_failed')
    expect(result.current.fromCache).toBe(false)
  })
})
