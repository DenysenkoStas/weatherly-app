import { useState, useCallback } from 'react'
import type { GeoResult, GeoResponse, Language } from '../types'
import { useLatestRequest } from './useLatestRequest'

const GEO_API = 'https://geocoding-api.open-meteo.com/v1/search'

interface UseGeocodingReturn {
  results: GeoResult[]
  loading: boolean
  error: string | null
  search: (query: string) => Promise<void>
  reset: () => void
}

export function useGeocoding(language: Language): UseGeocodingReturn {
  const [results, setResults] = useState<GeoResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // A slower answer for an older query must not replace the newer results
  const { start, abort } = useLatestRequest()

  const search = useCallback(
    async (query: string) => {
      if (!query.trim()) return

      const signal = start()
      setLoading(true)
      setError(null)

      try {
        const url = new URL(GEO_API)
        url.searchParams.set('name', query)
        url.searchParams.set('count', '5')
        url.searchParams.set('language', language)
        url.searchParams.set('format', 'json')

        const res = await fetch(url, { signal })
        if (signal.aborted) return
        if (!res.ok) {
          setError('fetch_failed')
          return
        }

        const data: GeoResponse = await res.json()
        if (signal.aborted) return
        const nextResults = data.results ?? []
        setResults(nextResults)
        if (nextResults.length === 0) setError('city_not_found')
      } catch {
        if (!signal.aborted) setError('fetch_failed')
      } finally {
        if (!signal.aborted) setLoading(false)
      }
    },
    [language, start],
  )

  // Also drops the search still running, so its results don't reopen the list
  const reset = useCallback(() => {
    abort()
    setResults([])
    setError(null)
    setLoading(false)
  }, [abort])

  return { results, loading, error, search, reset }
}
