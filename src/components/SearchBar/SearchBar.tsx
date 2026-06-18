import { useState, useEffect, useRef } from 'react'
import { CityList } from '../CityList'
import type { GeoResult } from '../../types'
import styles from './SearchBar.module.scss'

interface SearchBarProps {
  placeholder: string
  onSearch: (query: string) => void
  results: GeoResult[]
  onSelect: (city: GeoResult) => void
}

export function SearchBar({ placeholder, onSearch, results, onSelect }: SearchBarProps) {
  const [value, setValue] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onSearchRef = useRef(onSearch)

  useEffect(() => {
    onSearchRef.current = onSearch
  }, [onSearch])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!value.trim()) return

    timerRef.current = setTimeout(() => {
      onSearchRef.current(value.trim())
    }, 500)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [value])

  return (
    <div className={styles.wrapper}>
      <input
        className={styles.input}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
      />
      <CityList results={results} onSelect={onSelect} />
    </div>
  )
}
