import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useWeather } from './useWeather'
import type { WeatherResponse } from '../types'

const response = {
  timezone: 'Europe/Kyiv',
  current: { temperature_2m: 3 },
  daily: { time: ['2026-11-23'] },
  hourly: { time: ['2026-11-23T00:00'] },
} as unknown as WeatherResponse

const ok = () => Promise.resolve(new Response(JSON.stringify(response)))

describe('useWeather', () => {
  it('shows fresh data from the network', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>(ok))
    const { result } = renderHook(() => useWeather())

    const before = Date.now()
    await act(() => result.current.fetch(49.59, 34.55))

    expect(result.current.error).toBeNull()
    expect(result.current.fromCache).toBe(false)
    expect(result.current.weather?.temperature_2m).toBe(3)
    expect(result.current.updatedAt?.getTime()).toBeGreaterThanOrEqual(before)
  })

  it("shows the service worker's copy as offline, with the time it was saved", async () => {
    const savedAt = '2026-11-22T18:30:00.000Z'
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(() =>
        Promise.resolve(
          new Response(JSON.stringify(response), {
            headers: { 'X-Weatherly-Cached-At': savedAt },
          }),
        ),
      ),
    )
    const { result } = renderHook(() => useWeather())

    await act(() => result.current.fetch(49.59, 34.55))

    expect(result.current.error).toBeNull()
    expect(result.current.fromCache).toBe(true)
    expect(result.current.weather?.temperature_2m).toBe(3)
    expect(result.current.updatedAt?.toISOString()).toBe(savedAt)
    // The next 2 hours of precipitation are out of date in a saved copy
    expect(result.current.minutely).toBeNull()
  })

  it('aborts the previous request and ignores its late answer', async () => {
    let answerFirst: (res: Response) => void = () => {}
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockImplementationOnce(() => new Promise((resolve) => (answerFirst = resolve)))
      .mockImplementationOnce(ok)
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() => useWeather())

    let first: Promise<void> = Promise.resolve()
    act(() => {
      first = result.current.fetch(49.59, 34.55)
    })
    await act(() => result.current.fetch(50.45, 30.52))
    expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true)

    // The first city answers last, with another temperature: it must not replace the second
    const late = { ...response, current: { temperature_2m: -10 } }
    await act(async () => {
      answerFirst(new Response(JSON.stringify(late)))
      await first
    })

    expect(result.current.weather?.temperature_2m).toBe(3)
    expect(result.current.loading).toBe(false)
  })

  it('reports an error offline when there is no copy of that place', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(() => Promise.reject(new TypeError('Failed to fetch'))),
    )
    const { result } = renderHook(() => useWeather())

    await act(() => result.current.fetch(50.45, 30.52))

    expect(result.current.error).toBe('fetch_failed')
    expect(result.current.fromCache).toBe(false)
  })
})
