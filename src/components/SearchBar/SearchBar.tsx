import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import styles from './SearchBar.module.scss'

interface SearchBarProps {
  placeholder: string
  buttonLabel: string
  onSearch: (query: string) => void
}

export function SearchBar({ placeholder, buttonLabel, onSearch }: SearchBarProps) {
  const [value, setValue] = useState('')

  const handleSearch = () => {
    if (value.trim()) onSearch(value.trim())
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className={styles.wrapper}>
      <input
        className={styles.input}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button className={styles.button} onClick={handleSearch}>
        {buttonLabel}
      </button>
    </div>
  )
}
