export interface ChartPoint {
  x: number
  y: number
}

/**
 * Maps values to chart points: x in pixels, y in percent of the chart height
 * (0 = top). The highest value is drawn at `padding`%, the lowest at `100 - padding`%.
 */
export function getChartPoints(
  values: number[],
  step: number,
  offset: number,
  padding = 15,
): ChartPoint[] {
  if (values.length === 0) return []

  const min = Math.min(...values)
  const max = Math.max(...values)
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
