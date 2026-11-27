// Some Meteocons draw details (the "UV" and "N/A" text, the horizon line) in near-black, which
// disappears on the dark card: a mid gray reads in both themes
export function withVisibleDetails(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg.replaceAll('#202939', '#64748b'))}`
}
