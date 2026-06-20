import { useState, useCallback } from 'react'
import type { FavoriteCity } from '../types'

const STORAGE_KEY = 'weatherly_favorites'

export function makeFavoriteId(lat: number, lon: number): string {
  return `${lat.toFixed(2)},${lon.toFixed(2)}`
}

function load(): FavoriteCity[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function save(cities: FavoriteCity[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cities))
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteCity[]>(load)

  const isFavorite = useCallback(
    (id: string) => favorites.some((c) => c.id === id),
    [favorites],
  )

  const addFavorite = useCallback((city: FavoriteCity) => {
    setFavorites((prev) => {
      if (prev.some((c) => c.id === city.id)) return prev
      const next = [...prev, city]
      save(next)
      return next
    })
  }, [])

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.filter((c) => c.id !== id)
      save(next)
      return next
    })
  }, [])

  const toggleFavorite = useCallback(
    (city: FavoriteCity) => {
      if (isFavorite(city.id)) {
        removeFavorite(city.id)
      } else {
        addFavorite(city)
      }
    },
    [isFavorite, addFavorite, removeFavorite],
  )

  return { favorites, isFavorite, toggleFavorite }
}
