import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { makeFavoriteId, useFavorites } from './useFavorites'

describe('makeFavoriteId', () => {
  it('rounds coordinates to two decimals', () => {
    expect(makeFavoriteId(49.5883, 34.5514)).toBe('49.59,34.55')
  })

  it('keeps the sign of negative coordinates', () => {
    expect(makeFavoriteId(-33.8688, 151.2093)).toBe('-33.87,151.21')
  })

  it('gives the same id for nearby search results of one city', () => {
    expect(makeFavoriteId(50.4501, 30.5234)).toBe(makeFavoriteId(50.4499, 30.5241))
  })
})

describe('useFavorites', () => {
  const city = (name: string, lat: number) => ({
    id: makeFavoriteId(lat, 30),
    name,
    latitude: lat,
    longitude: 30,
  })

  it('reorders and saves the favorites', () => {
    const a = city('A', 1)
    const b = city('B', 2)
    const c = city('C', 3)
    localStorage.setItem('weatherly_favorites', JSON.stringify([a, b, c]))

    const { result } = renderHook(() => useFavorites())
    act(() => result.current.reorderFavorites([c.id, a.id, 'unknown']))

    expect(result.current.favorites.map((f) => f.name)).toEqual(['C', 'A', 'B'])
    expect(
      JSON.parse(localStorage.getItem('weatherly_favorites') ?? '[]').map(
        (f: { name: string }) => f.name,
      ),
    ).toEqual(['C', 'A', 'B'])
  })
})
