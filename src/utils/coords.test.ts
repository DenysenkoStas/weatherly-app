import { describe, expect, it } from 'vitest'
import { isValidCoords, parseLocationParams, withLocationParams } from './coords'

describe('isValidCoords', () => {
  it('accepts coordinates within range', () => {
    expect(isValidCoords(49.59, 34.55)).toBe(true)
    expect(isValidCoords(-90, 180)).toBe(true)
  })

  it('rejects wrong types and out-of-range values', () => {
    expect(isValidCoords('49', 34)).toBe(false)
    expect(isValidCoords(91, 34)).toBe(false)
    expect(isValidCoords(49, -181)).toBe(false)
    expect(isValidCoords(Number.NaN, 34)).toBe(false)
  })
})

describe('parseLocationParams', () => {
  it('reads lat and lon from the query string', () => {
    expect(parseLocationParams('?lat=50.45&lon=30.52')).toEqual({ lat: 50.45, lon: 30.52 })
  })

  it('returns null when a parameter is missing, empty or invalid', () => {
    expect(parseLocationParams('')).toBeNull()
    expect(parseLocationParams('?lat=50.45')).toBeNull()
    expect(parseLocationParams('?lat=&lon=30.52')).toBeNull()
    expect(parseLocationParams('?lat=abc&lon=30.52')).toBeNull()
    expect(parseLocationParams('?lat=95&lon=30.52')).toBeNull()
  })
})

describe('withLocationParams', () => {
  const base = 'https://denysenkostas.github.io/weatherly-app/'

  it('adds coordinates rounded to two decimals', () => {
    expect(withLocationParams(base, { lat: 50.4501, lon: 30.5234 })).toBe(
      `${base}?lat=50.45&lon=30.52`,
    )
  })

  it('keeps other parameters and the hash', () => {
    expect(withLocationParams(`${base}?debug=1#top`, { lat: 49.5, lon: 34.55 })).toBe(
      `${base}?debug=1&lat=49.5&lon=34.55#top`,
    )
  })

  it('removes coordinates when there is no location', () => {
    expect(withLocationParams(`${base}?lat=50.45&lon=30.52`, null)).toBe(base)
  })
})
