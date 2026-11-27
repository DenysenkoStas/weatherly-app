import { describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { MotionContext } from '../../hooks/useMotion'
import type { Motion } from '../../types'
import { MeteoIcon } from './MeteoIcon'

const icon = { animated: 'animated.svg', still: 'still.svg' }

function renderIcon(motion: Motion) {
  const { container } = render(
    <MotionContext value={motion}>
      <MeteoIcon icon={icon} className="icon" />
    </MotionContext>,
  )
  return container.querySelector('img')
}

function stubReducedMotion(reduce: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reduce && query === '(prefers-reduced-motion: reduce)',
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
}

describe('MeteoIcon', () => {
  it('renders a decorative image with the given props', () => {
    const img = renderIcon('on')

    expect(img?.getAttribute('alt')).toBe('')
    expect(img?.className).toBe('icon')
  })

  it('follows the system reduced-motion setting in auto mode', () => {
    stubReducedMotion(false)
    expect(renderIcon('auto')?.getAttribute('src')).toBe('animated.svg')

    stubReducedMotion(true)
    expect(renderIcon('auto')?.getAttribute('src')).toBe('still.svg')
  })

  it('lets the app setting override the system', () => {
    stubReducedMotion(true)
    expect(renderIcon('on')?.getAttribute('src')).toBe('animated.svg')

    stubReducedMotion(false)
    expect(renderIcon('off')?.getAttribute('src')).toBe('still.svg')
  })
})
