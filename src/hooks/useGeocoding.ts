import { useState } from 'react'
import type { GeoResult, GeoResponse } from '../types'

const GEO_API = 'https://geocoding-api.open-meteo.com/v1/search'

interface UseGeocodingReturn {
  results: GeoResult[]
  loading: boolean
  error: string | null
  search: (query: string) => Promise<void>
  reset: () => void
}

export function useGeocoding(): UseGeocodingReturn {
  const [results, setResults] = useState<GeoResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = async (query: string) => {
    if (!query.trim()) return

    setLoading(true)
    setError(null)

    try {
      const url = new URL(GEO_API)
      url.searchParams.set('name', query)
      url.searchParams.set('count', '5')
      url.searchParams.set('language', 'en')
      url.searchParams.set('format', 'json')

      const res = await fetch(url)
      if (!res.ok) throw new Error()

      const data: GeoResponse = await res.json()
      setResults(data.results ?? [])
    } catch {
      setError('fetch_failed')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setResults([])
    setError(null)
  }

  return { results, loading, error, search, reset }
}
