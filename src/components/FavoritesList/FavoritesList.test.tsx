import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { FavoriteCity } from '../../types'
import { en } from '../../locales'
import { FavoritesList } from './FavoritesList'

const favorites: FavoriteCity[] = [
  { id: '49.59,34.55', name: 'Poltava', latitude: 49.59, longitude: 34.55 },
  { id: '48.62,22.30', name: 'Uzhhorod', latitude: 48.62, longitude: 22.3 },
]

describe('FavoritesList temperatures', () => {
  it('shows the rounded current temperature after the name, and just the name without one', () => {
    render(
      <FavoritesList
        favorites={favorites}
        temperatures={{ '49.59,34.55': -2.4 }}
        onSelect={vi.fn()}
        onRemove={vi.fn()}
        onReorder={vi.fn()}
        t={en}
      />,
    )

    expect(screen.getByRole('button', { name: 'Poltava -2°' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Uzhhorod' })).toBeTruthy()
  })
})
