import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { MeteoIcon } from './MeteoIcon'

describe('MeteoIcon', () => {
  it('offers the still icon for reduced motion', () => {
    const { container } = render(
      <MeteoIcon icon={{ animated: 'animated.svg', still: 'still.svg' }} className="icon" />,
    )

    const source = container.querySelector('source')
    expect(source?.getAttribute('media')).toBe('(prefers-reduced-motion: reduce)')
    expect(source?.getAttribute('srcset')).toBe('still.svg')

    const img = container.querySelector('img')
    expect(img?.getAttribute('src')).toBe('animated.svg')
    expect(img?.getAttribute('alt')).toBe('')
    expect(img?.className).toBe('icon')
  })
})
