import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
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
    expect(screen.getByRole('main')).toBeTruthy()
  })

  it('switches the language', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: en.language_switch }))

    expect(screen.getByRole('button', { name: uk.language_switch })).toBeTruthy()
    expect(screen.getByText(uk.empty_state)).toBeTruthy()
    expect(localStorage.getItem('weatherly-lang')).toBe('uk')
    expect(document.documentElement.lang).toBe('uk')
  })

  it('switches the theme', () => {
    render(<App />)

    expect(document.documentElement.dataset.theme).toBe('dark')

    fireEvent.click(screen.getByRole('button', { name: en.theme_light }))

    expect(document.documentElement.dataset.theme).toBe('light')
    expect(localStorage.getItem('weatherly-theme')).toBe('light')
  })

  it('opens the last viewed city instead of the empty state', () => {
    const fetchMock = vi.fn<typeof fetch>(() => new Promise<Response>(() => {}))
    vi.stubGlobal('fetch', fetchMock)
    localStorage.setItem('weatherly_last_location', JSON.stringify({ lat: 49.59, lon: 34.55 }))

    render(<App />)

    expect(screen.queryByText(en.empty_state)).toBeNull()
    const weatherUrl = fetchMock.mock.calls
      .map(([url]) => String(url))
      .find((url) => url.startsWith('https://api.open-meteo.com/'))
    expect(weatherUrl).toContain('latitude=49.59')
    expect(weatherUrl).toContain('longitude=34.55')
  })

  it('switches back to the current location from the header', () => {
    const fetchMock = vi.fn<typeof fetch>(() => new Promise<Response>(() => {}))
    vi.stubGlobal('fetch', fetchMock)
    localStorage.setItem('weatherly_last_location', JSON.stringify({ lat: 49.59, lon: 34.55 }))
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (success: PositionCallback) =>
          success({ coords: { latitude: 50.45, longitude: 30.52 } } as GeolocationPosition),
      },
    })

    try {
      render(<App />)
      const locateButton = screen.getByRole('button', { name: en.locate_me })
      expect(locateButton.getAttribute('aria-pressed')).toBe('false')

      fireEvent.click(locateButton)

      expect(locateButton.getAttribute('aria-pressed')).toBe('true')
      const weatherUrls = fetchMock.mock.calls
        .map(([url]) => String(url))
        .filter((url) => url.startsWith('https://api.open-meteo.com/'))
      expect(weatherUrls.at(-1)).toContain('latitude=50.45')
      expect(JSON.parse(localStorage.getItem('weatherly_last_location') ?? '')).toEqual({
        lat: 50.45,
        lon: 30.52,
      })
    } finally {
      // @ts-expect-error -- jsdom has no geolocation; remove the stub again
      delete navigator.geolocation
    }
  })

  it('opens the city from the link and keeps the address in sync', () => {
    const fetchMock = vi.fn<typeof fetch>(() => new Promise<Response>(() => {}))
    vi.stubGlobal('fetch', fetchMock)
    localStorage.setItem('weatherly_last_location', JSON.stringify({ lat: 49.59, lon: 34.55 }))
    window.history.replaceState(null, '', '/?lat=50.4501&lon=30.5234')

    render(<App />)

    const weatherUrl = fetchMock.mock.calls
      .map(([url]) => String(url))
      .find((url) => url.startsWith('https://api.open-meteo.com/'))
    expect(weatherUrl).toContain('latitude=50.4501')
    expect(window.location.search).toBe('?lat=50.45&lon=30.52')
  })

  it('refetches the weather in the chosen units', () => {
    const fetchMock = vi.fn<typeof fetch>(() => new Promise<Response>(() => {}))
    vi.stubGlobal('fetch', fetchMock)
    localStorage.setItem('weatherly_last_location', JSON.stringify({ lat: 49.59, lon: 34.55 }))

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: `${en.units}: °C, m/s` }))
    fireEvent.click(screen.getByRole('radio', { name: '°F' }))
    fireEvent.click(screen.getByRole('radio', { name: 'km/h' }))

    const weatherUrls = fetchMock.mock.calls
      .map(([url]) => String(url))
      .filter((url) => url.startsWith('https://api.open-meteo.com/'))
    expect(weatherUrls.at(-1)).toContain('temperature_unit=fahrenheit')
    expect(weatherUrls.at(-1)).toContain('wind_speed_unit=kmh')
    expect(screen.getByRole('button', { name: `${en.units}: °F, km/h` })).toBeTruthy()
  })

  it('removes a city from the favorites chips', () => {
    localStorage.setItem(
      'weatherly_favorites',
      JSON.stringify([
        { id: '49.59,34.55', name: 'Poltava', latitude: 49.59, longitude: 34.55 },
        { id: '48.62,22.29', name: 'Uzhhorod', latitude: 48.62, longitude: 22.29 },
      ]),
    )

    render(<App />)
    // Not the popular cities of the empty state, so only the favorites chips match
    fireEvent.click(screen.getByRole('button', { name: `${en.remove_favorite}: Poltava` }))

    expect(screen.queryByRole('button', { name: 'Poltava' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Uzhhorod' })).toBeTruthy()
    expect(JSON.parse(localStorage.getItem('weatherly_favorites') ?? '[]')).toHaveLength(1)
  })

  it('moves a favorites chip with Alt + arrow keys', () => {
    localStorage.setItem(
      'weatherly_favorites',
      JSON.stringify([
        { id: '49.59,34.55', name: 'Poltava', latitude: 49.59, longitude: 34.55 },
        { id: '48.62,22.29', name: 'Uzhhorod', latitude: 48.62, longitude: 22.29 },
      ]),
    )

    render(<App />)
    const nav = screen.getByRole('navigation', { name: en.favorites })
    expect(within(nav).getAllByRole('listitem')).toHaveLength(2)

    fireEvent.keyDown(screen.getByRole('button', { name: 'Poltava' }), {
      key: 'ArrowRight',
      altKey: true,
    })

    const stored = JSON.parse(localStorage.getItem('weatherly_favorites') ?? '[]')
    expect(stored.map((city: { name: string }) => city.name)).toEqual(['Uzhhorod', 'Poltava'])
  })
})
