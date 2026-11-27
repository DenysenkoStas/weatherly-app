export interface ChartPoint {
  x: number
  y: number
}

/**
 * Maps values to chart points: x in pixels, y in percent of the chart height
 * (0 = top). The highest value is drawn at `padding`%, the lowest at `100 - padding`%.
 * When the values span less than `minRange`, the scale is widened around their middle,
 * so a change of 1–2 degrees is drawn as a gentle slope rather than a full-height jump.
 */
export function getChartPoints(
  values: number[],
  step: number,
  offset: number,
  padding = 15,
  minRange = 0,
): ChartPoint[] {
  if (values.length === 0) return []

  let min = Math.min(...values)
  let max = Math.max(...values)

  if (max - min < minRange) {
    const middle = (min + max) / 2
    min = middle - minRange / 2
    max = middle + minRange / 2
  }

  const range = max - min

  return values.map((value, i) => ({
    x: offset + i * step,
    y: range === 0 ? 50 : padding + (1 - (value - min) / range) * (100 - 2 * padding),
  }))
}

export function getLinePath(points: ChartPoint[]): string {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ')
}

export function getAreaPath(points: ChartPoint[], bottom = 100): string {
  if (points.length === 0) return ''
  const first = points[0]
  const last = points[points.length - 1]
  return `${getLinePath(points)} L${last.x} ${bottom} L${first.x} ${bottom} Z`
}

/**
 * Heights of bars standing on the chart bottom, in percent of the chart height, for amounts
 * from 0. The scale reaches at least `minMax`, so light rain stays a short bar instead of
 * filling the chart; the tallest bar stops `padding`% below the top.
 */
export function getBarHeights(values: number[], minMax: number, padding = 15): number[] {
  const max = Math.max(minMax, ...values)
  return values.map((value) => (Math.max(value, 0) / max) * (100 - padding))
}
