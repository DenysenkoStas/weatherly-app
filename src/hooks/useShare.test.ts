import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useShare } from './useShare'

const data = { title: 'Lviv — Weatherly', url: 'https://example.com/?lat=49.84&lon=24.03' }

function stubNavigator(props: Partial<Navigator>) {
  for (const [key, value] of Object.entries(props)) {
    Object.defineProperty(navigator, key, { value, configurable: true })
  }
}

describe('useShare', () => {
  afterEach(() => {
    // Back to jsdom's own navigator: no share sheet, no clipboard
    for (const key of ['share', 'canShare', 'clipboard']) {
      delete (navigator as unknown as Record<string, unknown>)[key]
    }
    vi.useRealTimers()
  })

  it('opens the share sheet where the browser has one', async () => {
    const shareMock = vi.fn(() => Promise.resolve())
    const writeText = vi.fn(() => Promise.resolve())
    stubNavigator({ share: shareMock, clipboard: { writeText } as unknown as Clipboard })
    const { result } = renderHook(() => useShare())

    await act(() => result.current.share(data))

    expect(shareMock).toHaveBeenCalledWith(data)
    expect(writeText).not.toHaveBeenCalled()
    expect(result.current.copied).toBe(false)
  })

  it('does nothing more when the share sheet is closed', async () => {
    const writeText = vi.fn(() => Promise.resolve())
    stubNavigator({
      share: () => Promise.reject(new DOMException('Share canceled', 'AbortError')),
      clipboard: { writeText } as unknown as Clipboard,
    })
    const { result } = renderHook(() => useShare())

    await act(() => result.current.share(data))

    expect(writeText).not.toHaveBeenCalled()
  })

  it('copies the link for a moment where there is no share sheet', async () => {
    vi.useFakeTimers()
    const writeText = vi.fn(() => Promise.resolve())
    stubNavigator({ clipboard: { writeText } as unknown as Clipboard })
    const { result } = renderHook(() => useShare())

    await act(() => result.current.share(data))

    expect(writeText).toHaveBeenCalledWith(data.url)
    expect(result.current.copied).toBe(true)

    act(() => vi.advanceTimersByTime(2000))
    expect(result.current.copied).toBe(false)
  })
})
