import { createContext, useContext, useEffect, useState } from 'react'
import type { Motion } from '../types'
import { useMediaQuery } from './useMediaQuery'

const STORAGE_KEY = 'weatherly-motion'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export function loadMotion(): Motion {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'on' || stored === 'off' ? stored : 'auto'
  } catch {
    return 'auto'
  }
}

// CSS animations (skeletons, spinners) read the choice from <html data-motion>
export function useMotion() {
  const [motion, setMotion] = useState<Motion>(loadMotion)

  useEffect(() => {
    document.documentElement.dataset.motion = motion
    try {
      localStorage.setItem(STORAGE_KEY, motion)
    } catch {
      // Storage can be full or disabled (private mode) — the choice just isn't remembered
    }
  }, [motion])

  return { motion, setMotion }
}

export const MotionContext = createContext<Motion>('auto')

// The icons animate themselves (SMIL), which CSS can't stop, so the component picks the copy
export function useShouldAnimate(): boolean {
  const motion = useContext(MotionContext)
  const prefersReducedMotion = useMediaQuery(REDUCED_MOTION_QUERY)
  return motion === 'on' || (motion === 'auto' && !prefersReducedMotion)
}
