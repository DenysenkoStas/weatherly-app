import { useCallback, useSyncExternalStore } from 'react'

// Keep in sync with $desktop in src/styles/_breakpoints.scss
export const DESKTOP_QUERY = '(min-width: 1080px)'

function matches(query: string): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(query).matches
}

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window.matchMedia !== 'function') return () => {}
      const mediaQuery = window.matchMedia(query)
      mediaQuery.addEventListener('change', onChange)
      return () => mediaQuery.removeEventListener('change', onChange)
    },
    [query],
  )

  return useSyncExternalStore(
    subscribe,
    () => matches(query),
    () => false,
  )
}
