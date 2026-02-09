'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function OneSignalProvider({ userId }: { userId: string | undefined }) {
  useEffect(() => {
    if (!userId) return

    const initOneSignal = async () => {
      // 1. Load OneSignal SDK dynamically
      const OneSignal = (window as any).OneSignal || []
      
      await OneSignal.push(() => {
        OneSignal.init({
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
          safari_web_id: "optional-safari-id",
          notifyButton: { enable: true },
          allowLocalhostAsSecureOrigin: true,
        })
      })

      // 2. Get the OneSignal Player ID and save it to Supabase
      const externalId = await OneSignal.getUserId()
      
      if (externalId) {
        const supabase = createClient()
        await supabase
          .from('profiles')
          .update({ onesignal_id: externalId })
          .eq('id', userId)
      }
    }

    // Add script tag
    const script = document.createElement('script')
    script.src = 'https://cdn.onesignal.com/sdks/OneSignalSDK.js'
    script.async = true
    document.head.appendChild(script)

    script.onload = () => initOneSignal()
  }, [userId])

  return null
}
