import { describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useFavoritesWeather } from './useFavoritesWeather'
import type { FavoriteCity, TemperatureUnit } from '../types'

const poltava: FavoriteCity = {
  id: '49.59,34.55',
  name: 'Poltava',
  latitude: 49.5883,
  longitude: 34.5514,
}
const uzhhorod: FavoriteCity = {
  id: '48.62,22.30',
  name: 'Uzhhorod',
  latitude: 48.62,
  longitude: 22.3,
}

const json = (data: unknown) => Promise.resolve(new Response(JSON.stringify(data)))
const current = (temperature: number) => ({ current: { temperature_2m: temperature } })

describe('useFavoritesWeather', () => {
  it('asks for all favorites at once and keys the answers by favorite id', async () => {
    // Answers come in the requested order: by id, so Uzhhorod (48.62) before Poltava (49.59)
    const fetchMock = vi.fn<typeof fetch>(() => json([current(-1.2), current(3.4)]))
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useFavoritesWeather([uzhhorod, poltava], 'celsius'))

    await waitFor(() => expect(result.current).toEqual({ '48.62,22.30': -1.2, '49.59,34.55': 3.4 }))
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const url = new URL(String(fetchMock.mock.calls[0][0]))
    // Sorted by id, so the order of the chips doesn't matter
    expect(url.searchParams.get('latitude')).toBe('48.62,49.59')
    expect(url.searchParams.get('longitude')).toBe('22.30,34.55')
  })

  it('reads the single-object answer for one favorite', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(() => json(current(5))),
    )

    const { result } = renderHook(() => useFavoritesWeather([poltava], 'celsius'))

    await waitFor(() => expect(result.current).toEqual({ '49.59,34.55': 5 }))
  })

  it('does not ask again when the favorites are only reordered', async () => {
    const fetchMock = vi.fn<typeof fetch>(() => json([current(1), current(2)]))
    vi.stubGlobal('fetch', fetchMock)

    const { result, rerender } = renderHook(
      ({ favorites }) => useFavoritesWeather(favorites, 'celsius'),
      { initialProps: { favorites: [poltava, uzhhorod] } },
    )
    await waitFor(() => expect(Object.keys(result.current)).toHaveLength(2))

    rerender({ favorites: [uzhhorod, poltava] })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('hides temperatures in the old unit until the new ones arrive', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(() => json(current(5))),
    )
    const { result, rerender } = renderHook(
      ({ unit }: { unit: TemperatureUnit }) => useFavoritesWeather([poltava], unit),
      { initialProps: { unit: 'celsius' } },
    )
    await waitFor(() => expect(result.current).toEqual({ '49.59,34.55': 5 }))

    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(() => new Promise<Response>(() => {})),
    )
    rerender({ unit: 'fahrenheit' })
    expect(result.current).toEqual({})
  })

  it('shows no temperatures when the request fails', async () => {
    const fetchMock = vi.fn<typeof fetch>(() => json(current(5)))
    vi.stubGlobal('fetch', fetchMock)
    const { result, rerender } = renderHook(
      ({ key }) => useFavoritesWeather([poltava], 'celsius', key),
      {
        initialProps: { key: 1 },
      },
    )
    await waitFor(() => expect(result.current).toEqual({ '49.59,34.55': 5 }))

    fetchMock.mockImplementation(() => Promise.reject(new TypeError('Failed to fetch')))
    await act(async () => rerender({ key: 2 }))
    await waitFor(() => expect(result.current).toEqual({}))
  })
})
