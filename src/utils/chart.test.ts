import { describe, expect, it } from 'vitest'
import { getAreaPath, getChartPoints, getLinePath } from './chart'

describe('getChartPoints', () => {
  it('places x at the centre of each cell', () => {
    const points = getChartPoints([1, 2, 3], 60, 28)
    expect(points.map((p) => p.x)).toEqual([28, 88, 148])
  })

  it('puts the highest value at the top padding and the lowest at the bottom', () => {
    const points = getChartPoints([5, 10, 0], 60, 0)
    expect(points.map((p) => p.y)).toEqual([50, 15, 85])
  })

  it('draws a flat line in the middle when all values are equal', () => {
    expect(getChartPoints([7, 7, 7], 60, 0).map((p) => p.y)).toEqual([50, 50, 50])
  })

  it('handles negative temperatures', () => {
    const points = getChartPoints([-4, -1], 60, 0)
    expect(points[0].y).toBe(85)
    expect(points[1].y).toBe(15)
  })

  it('widens the scale to minRange around the middle of the values', () => {
    // 4..6 spans 2 degrees; with minRange 10 the scale becomes 0..10
    const points = getChartPoints([4, 6], 60, 0, 0, 10)
    expect(points.map((p) => p.y)).toEqual([60, 40])
  })

  it('keeps the full scale when the values already span more than minRange', () => {
    const points = getChartPoints([0, 20], 60, 0, 15, 10)
    expect(points.map((p) => p.y)).toEqual([85, 15])
  })

  it('draws equal values in the middle with minRange', () => {
    expect(getChartPoints([3, 3], 60, 0, 15, 8).map((p) => p.y)).toEqual([50, 50])
  })

  it('returns an empty array for no values', () => {
    expect(getChartPoints([], 60, 0)).toEqual([])
  })
})

describe('chart paths', () => {
  const points = [
    { x: 0, y: 50 },
    { x: 60, y: 15 },
  ]

  it('builds a line path', () => {
    expect(getLinePath(points)).toBe('M0 50 L60 15')
  })

  it('closes the area path at the bottom', () => {
    expect(getAreaPath(points)).toBe('M0 50 L60 15 L60 100 L0 100 Z')
  })

  it('returns an empty area path for no points', () => {
    expect(getAreaPath([])).toBe('')
  })
})
