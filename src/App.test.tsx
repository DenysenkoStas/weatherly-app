import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import App from './App'
import { en, uk } from './locales'

describe('App', () => {
  beforeEach(() => {
    // jsdom has no matchMedia; useTheme and useMediaQuery read it
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: true,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    )
    localStorage.setItem('weatherly-lang', 'en')
  })

  it('renders the header, search and empty state', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Weatherly' })).toBeTruthy()
    expect(screen.getByRole('combobox', { name: en.searchPlaceholder })).toBeTruthy()
    expect(screen.getByText(en.empty_state)).toBeTruthy()
  })

  it('switches the language', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'EN' }))

    expect(screen.getByRole('button', { name: 'UA' })).toBeTruthy()
    expect(screen.getByText(uk.empty_state)).toBeTruthy()
    expect(localStorage.getItem('weatherly-lang')).toBe('uk')
  })

  it('switches the theme', () => {
    render(<App />)

    expect(document.documentElement.dataset.theme).toBe('dark')

    fireEvent.click(screen.getByRole('button', { name: en.theme_light }))

    expect(document.documentElement.dataset.theme).toBe('light')
    expect(localStorage.getItem('weatherly-theme')).toBe('light')
  })
})
