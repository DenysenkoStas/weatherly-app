import { describe, expect, it } from 'vitest'
import { makeFavoriteId } from './useFavorites'

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
