import { useState, useEffect, useRef, useCallback } from 'react'
import { CityList } from '../CityList'
import type { GeoResult } from '../../types'
import styles from './SearchBar.module.scss'

interface SearchBarProps {
  placeholder: string
  onSearch: (query: string) => void
  onReset: () => void
  results: GeoResult[]
  onSelect: (city: GeoResult) => void
  loading?: boolean
  searchError?: string | null
  searchErrorMessage?: string
}

export function SearchBar({
  placeholder,
  onSearch,
  onReset,
  results,
  onSelect,
  loading = false,
  searchError,
  searchErrorMessage,
}: SearchBarProps) {
  const [value, setValue] = useState('')
  const [isDropdownDismissed, setIsDropdownDismissed] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputWrapRef = useRef<HTMLDivElement>(null)
  const onSearchRef = useRef(onSearch)

  const showEmptyState = !!searchError && !!searchErrorMessage && !loading
  const hasDropdownContent = loading || results.length > 0 || showEmptyState
  const isDropdownOpen = !isDropdownDismissed && !!value.trim() && hasDropdownContent

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

  useEffect(() => {
    if (!isDropdownOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!inputWrapRef.current?.contains(event.target as Node)) {
        setIsDropdownDismissed(true)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsDropdownDismissed(true)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isDropdownOpen])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value
    setValue(next)
    setIsDropdownDismissed(false)

    if (!next.trim()) onReset()
  }

  const handleSelect = useCallback(
    (city: GeoResult) => {
      setIsDropdownDismissed(true)
      setValue('')
      onReset()
      onSelect(city)
    },
    [onReset, onSelect],
  )

  const handleFocus = () => {
    if (value.trim() && hasDropdownContent) setIsDropdownDismissed(false)
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.inputWrap} ref={inputWrapRef}>
        <input
          className={`${styles.input}${loading ? ` ${styles.inputLoading}` : ''}`}
          type="text"
          value={value}
          placeholder={placeholder}
          aria-busy={loading}
          aria-expanded={isDropdownOpen}
          onChange={handleChange}
          onFocus={handleFocus}
        />
        {loading && <span className={styles.spinner} aria-hidden="true" />}
        {isDropdownOpen && (
          <CityList
            results={results}
            onSelect={handleSelect}
            emptyMessage={showEmptyState ? searchErrorMessage : undefined}
            emptyMessageVariant={searchError === 'fetch_failed' ? 'error' : 'muted'}
          />
        )}
      </div>
    </div>
  )
}
