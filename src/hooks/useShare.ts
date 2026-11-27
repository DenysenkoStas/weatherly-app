import { useCallback, useEffect, useRef, useState } from 'react'

// How long the button shows that the link was copied
const COPIED_MS = 2000

interface UseShareReturn {
  /** Opens the system share sheet, or copies the link where there is none */
  share: (data: ShareData) => Promise<void>
  /** The link was just copied (the fallback), for a moment */
  copied: boolean
}

export function useShare(): UseShareReturn {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  const share = useCallback(async (data: ShareData) => {
    if (navigator.share && (!navigator.canShare || navigator.canShare(data))) {
      try {
        await navigator.share(data)
        return
      } catch (error) {
        // Closing the share sheet is the user's choice; any other failure falls back to copying
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }

    try {
      await navigator.clipboard.writeText(data.url ?? window.location.href)
    } catch {
      // No clipboard access (insecure page or denied): nothing to do
      return
    }
    setCopied(true)
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setCopied(false), COPIED_MS)
  }, [])

  return { share, copied }
}
