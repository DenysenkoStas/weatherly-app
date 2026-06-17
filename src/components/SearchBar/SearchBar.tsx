import { useState, useEffect, useRef } from 'react'
import styles from './SearchBar.module.scss'

interface SearchBarProps {
  placeholder: string
  onSearch: (query: string) => void
}

export function SearchBar({ placeholder, onSearch }: SearchBarProps) {
  const [value, setValue] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!value.trim()) return

    timerRef.current = setTimeout(() => {
      onSearch(value.trim())
    }, 500)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [value, onSearch])

  return (
    <div className={styles.wrapper}>
      <input
        className={styles.input}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  )
}
