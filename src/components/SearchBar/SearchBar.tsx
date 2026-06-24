import { useState, useEffect, useRef, useCallback, useId } from 'react'
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
  const inputId = useId()
  const listboxId = useId()
  const [value, setValue] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isDropdownDismissed, setIsDropdownDismissed] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputWrapRef = useRef<HTMLDivElement>(null)
  const onSearchRef = useRef(onSearch)

  const showEmptyState = !!searchError && !!searchErrorMessage && !loading
  const hasDropdownContent = loading || results.length > 0 || showEmptyState
  const isDropdownOpen = !isDropdownDismissed && !!value.trim() && hasDropdownContent
  const activeOptionId =
    activeIndex >= 0 && results[activeIndex] ? `${listboxId}-option-${activeIndex}` : undefined

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

    document.addEventListener('mousedown', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [isDropdownOpen])

  const handleSelect = useCallback(
    (city: GeoResult) => {
      setIsDropdownDismissed(true)
      setActiveIndex(-1)
      setValue('')
      onReset()
      onSelect(city)
    },
    [onReset, onSelect],
  )

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value
    setValue(next)
    setActiveIndex(-1)
    setIsDropdownDismissed(false)

    if (!next.trim()) onReset()
  }

  const handleFocus = () => {
    if (value.trim() && hasDropdownContent) setIsDropdownDismissed(false)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setIsDropdownDismissed(true)
      return
    }

    if (!isDropdownOpen || results.length === 0) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setActiveIndex((index) => (index < results.length - 1 ? index + 1 : 0))
        break
      case 'ArrowUp':
        event.preventDefault()
        setActiveIndex((index) => (index > 0 ? index - 1 : results.length - 1))
        break
      case 'Enter':
        if (activeIndex >= 0) {
          event.preventDefault()
          handleSelect(results[activeIndex])
        }
        break
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.inputWrap} ref={inputWrapRef}>
        <input
          id={inputId}
          name="city-search"
          className={`${styles.input}${loading ? ` ${styles.inputLoading}` : ''}`}
          type="text"
          role="combobox"
          value={value}
          placeholder={placeholder}
          aria-label={placeholder}
          aria-busy={loading}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded={isDropdownOpen}
          aria-controls={isDropdownOpen && results.length > 0 ? listboxId : undefined}
          aria-activedescendant={isDropdownOpen ? activeOptionId : undefined}
          autoComplete="off"
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
        />
        {loading && <span className={styles.spinner} aria-hidden="true" />}
        {isDropdownOpen && (
          <CityList
            listboxId={listboxId}
            results={results}
            activeIndex={activeIndex}
            onHighlight={setActiveIndex}
            onSelect={handleSelect}
            emptyMessage={showEmptyState ? searchErrorMessage : undefined}
            emptyMessageVariant={searchError === 'fetch_failed' ? 'error' : 'muted'}
          />
        )}
      </div>
    </div>
  )
}
