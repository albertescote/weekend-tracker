'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RefreshOnFocus() {
  const router = useRouter()

  useEffect(() => {
    const onFocus = () => {
      // Refresh the current route data without losing client-side state
      router.refresh()
    }

    // Window focus is triggered when the user switches tabs or returns to the browser
    window.addEventListener('focus', onFocus)
    
    // visibilitychange handles cases where the PWA is resumed from the background on mobile
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        onFocus()
      }
    })

    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [router])

  return null
}
