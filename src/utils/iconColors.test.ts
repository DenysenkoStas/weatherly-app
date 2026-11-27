import { describe, expect, it } from 'vitest'
import { withVisibleDetails } from './iconColors'

describe('withVisibleDetails', () => {
  it('recolors every near-black detail into a data URL', () => {
    const url = withVisibleDetails('<svg><path fill="#202939"/><path fill="#202939"/></svg>')

    expect(url.startsWith('data:image/svg+xml,')).toBe(true)
    const svg = decodeURIComponent(url.slice('data:image/svg+xml,'.length))
    expect(svg).toBe('<svg><path fill="#64748b"/><path fill="#64748b"/></svg>')
  })
})
