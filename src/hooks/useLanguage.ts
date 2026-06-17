import { useState } from 'react'
import { en, uk } from '../locales'
import type { Language } from '../types'

const STORAGE_KEY = 'weatherly-lang'

function getInitialLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'en' || stored === 'uk') return stored
  return navigator.language.startsWith('uk') ? 'uk' : 'en'
}

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(getInitialLanguage)

  const toggleLanguage = () => {
    const next: Language = language === 'en' ? 'uk' : 'en'
    setLanguage(next)
    localStorage.setItem(STORAGE_KEY, next)
  }

  const t = language === 'en' ? en : uk

  return { language, toggleLanguage, t }
}
