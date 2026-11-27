import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useGeocoding } from './useGeocoding'
import type { GeoResult } from '../types'

const poltava: GeoResult = {
  id: 696643,
  name: 'Полтава',
  country: 'Україна',
  country_code: 'UA',
  admin1: 'Полтавська область',
  latitude: 49.58925,
  longitude: 34.55367,
}

function mockFetchResponse(body: unknown, ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({ ok, json: async () => body })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('useGeocoding', () => {
  it('returns found cities and builds the request URL', async () => {
    const fetchMock = mockFetchResponse({ results: [poltava] })
    const { result } = renderHook(() => useGeocoding('uk'))

    await act(() => result.current.search('Полтава'))

    expect(result.current.results).toEqual([poltava])
    expect(result.current.error).toBeNull()
    expect(result.current.loading).toBe(false)

    const url = new URL(String(fetchMock.mock.calls[0][0]))
    expect(url.searchParams.get('name')).toBe('Полтава')
    expect(url.searchParams.get('language')).toBe('uk')
    expect(url.searchParams.get('count')).toBe('5')
  })

  it('sets city_not_found when the API returns an empty list', async () => {
    mockFetchResponse({ results: [] })
    const { result } = renderHook(() => useGeocoding('en'))

    await act(() => result.current.search('Poltava1'))

    expect(result.current.results).toEqual([])
    expect(result.current.error).toBe('city_not_found')
  })

  it('sets city_not_found when the API omits results', async () => {
    mockFetchResponse({})
    const { result } = renderHook(() => useGeocoding('en'))

    await act(() => result.current.search('Qwerty'))

    expect(result.current.error).toBe('city_not_found')
  })

  it('sets fetch_failed when the response is not ok', async () => {
    mockFetchResponse({}, false)
    const { result } = renderHook(() => useGeocoding('en'))

    await act(() => result.current.search('Poltava'))

    expect(result.current.error).toBe('fetch_failed')
    expect(result.current.loading).toBe(false)
  })

  it('sets fetch_failed on a network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    const { result } = renderHook(() => useGeocoding('en'))

    await act(() => result.current.search('Poltava'))

    expect(result.current.error).toBe('fetch_failed')
  })

  it('shows loading while the request is in progress', async () => {
    let respond: (value: unknown) => void = () => {}
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise((resolve) => (respond = resolve))),
    )
    const { result } = renderHook(() => useGeocoding('en'))

    let pending: Promise<void> = Promise.resolve()
    act(() => {
      pending = result.current.search('Poltava')
    })
    expect(result.current.loading).toBe(true)

    await act(async () => {
      respond({ ok: true, json: async () => ({ results: [poltava] }) })
      await pending
    })
    expect(result.current.loading).toBe(false)
  })

  it('does not call the API for a blank query', async () => {
    const fetchMock = mockFetchResponse({ results: [poltava] })
    const { result } = renderHook(() => useGeocoding('en'))

    await act(() => result.current.search('   '))

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('ignores the late answer of an older query', async () => {
    const kyiv = { ...poltava, id: 703448, name: 'Київ' }
    let answerFirst: (value: unknown) => void = () => {}
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() => new Promise((resolve) => (answerFirst = resolve)))
      .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [kyiv] }) })
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() => useGeocoding('uk'))

    let first: Promise<void> = Promise.resolve()
    act(() => {
      first = result.current.search('Пол')
    })
    await act(() => result.current.search('Київ'))
    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true)

    await act(async () => {
      answerFirst({ ok: true, json: async () => ({ results: [poltava] }) })
      await first
    })

    expect(result.current.results).toEqual([kyiv])
  })

  it('reset drops the search still running', async () => {
    let answer: (value: unknown) => void = () => {}
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementationOnce(() => new Promise((resolve) => (answer = resolve))),
    )
    const { result } = renderHook(() => useGeocoding('uk'))

    let pending: Promise<void> = Promise.resolve()
    act(() => {
      pending = result.current.search('Полтава')
    })
    expect(result.current.loading).toBe(true)
    act(() => result.current.reset())

    await act(async () => {
      answer({ ok: true, json: async () => ({ results: [poltava] }) })
      await pending
    })

    expect(result.current.results).toEqual([])
    expect(result.current.loading).toBe(false)
  })

  it('reset clears results and error', async () => {
    mockFetchResponse({ results: [] })
    const { result } = renderHook(() => useGeocoding('en'))

    await act(() => result.current.search('Poltava1'))
    expect(result.current.error).toBe('city_not_found')

    act(() => result.current.reset())

    expect(result.current.results).toEqual([])
    expect(result.current.error).toBeNull()
  })
})
