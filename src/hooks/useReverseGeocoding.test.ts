import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useReverseGeocoding } from './useReverseGeocoding'

const NAMES: Record<string, string> = { '49.59': 'Полтава', '50.45': 'Київ', '46.48': 'Одеса' }

function mockNominatim() {
  const fetchMock = vi.fn((url: URL) =>
    Promise.resolve({
      ok: true,
      json: async () => ({ address: { city: NAMES[url.searchParams.get('lat') ?? ''] } }),
    }),
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

// The time of the previous request is kept between tests: each one starts a minute later
let now = Date.UTC(2026, 10, 28, 12)

describe('useReverseGeocoding', () => {
  beforeEach(() => {
    now += 60_000
    vi.useFakeTimers({ now })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('sends the next request no sooner than a second after the previous one', async () => {
    const fetchMock = mockNominatim()
    const { result } = renderHook(() => useReverseGeocoding('uk'))

    await act(() => result.current.fetchCityName(49.59, 34.55))
    expect(result.current.cityName).toBe('Полтава')

    let second: Promise<void> = Promise.resolve()
    act(() => {
      second = result.current.fetchCityName(50.45, 30.52)
    })
    await act(() => vi.advanceTimersByTimeAsync(999))
    expect(fetchMock).toHaveBeenCalledTimes(1)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
      await second
    })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(result.current.cityName).toBe('Київ')
  })

  it('never requests a place replaced while waiting', async () => {
    const fetchMock = mockNominatim()
    const { result } = renderHook(() => useReverseGeocoding('uk'))

    await act(() => result.current.fetchCityName(49.59, 34.55))
    let last: Promise<void> = Promise.resolve()
    act(() => {
      void result.current.fetchCityName(50.45, 30.52)
      last = result.current.fetchCityName(46.48, 30.72)
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
      await last
    })

    const lats = fetchMock.mock.calls.map(([url]) => url.searchParams.get('lat'))
    expect(lats).toEqual(['49.59', '46.48'])
    expect(result.current.cityName).toBe('Одеса')
    expect(result.current.loading).toBe(false)
  })

  it('has no name when the request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))),
    )
    const { result } = renderHook(() => useReverseGeocoding('uk'))

    await act(() => result.current.fetchCityName(49.59, 34.55))

    expect(result.current.cityName).toBeNull()
    expect(result.current.loading).toBe(false)
  })
})
