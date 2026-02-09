'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell } from 'lucide-react'

export default function OneSignalProvider({ userId }: { userId: string | undefined }) {
  const [isSubscribed, setIsSubscribed] = useState(true) // Default to true to hide button initially

  useEffect(() => {
    if (!userId) return

    const initOneSignal = async () => {
      const OneSignal = (window as any).OneSignal || []
      
      await OneSignal.push(async () => {
        await OneSignal.init({
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
          allowLocalhostAsSecureOrigin: true,
        })

        // Check subscription status
        const isPushEnabled = OneSignal.User.PushSubscription.optedIn
        setIsSubscribed(isPushEnabled)

        // Save ID if already subscribed
        if (isPushEnabled) {
          saveOneSignalId(OneSignal.User.PushSubscription.id)
        }

        // Listen for subscription changes
        OneSignal.User.PushSubscription.addEventListener("change", (event: any) => {
          if (event.current.id) {
            saveOneSignalId(event.current.id)
            setIsSubscribed(true)
          }
        })
      })
    }

    const saveOneSignalId = async (onesignalId: string) => {
      const supabase = createClient()
      await supabase
        .from('profiles')
        .update({ onesignal_id: onesignalId })
        .eq('id', userId)
    }

    if (!(window as any).OneSignal) {
      const script = document.createElement('script')
      script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'
      script.defer = true
      document.head.appendChild(script)
      script.onload = () => initOneSignal()
    } else {
      initOneSignal()
    }
  }, [userId])

  const handleSubscribe = async () => {
    const OneSignal = (window as any).OneSignal
    if (OneSignal) {
      await OneSignal.Slidedown.promptPush()
    }
  }

  if (isSubscribed || !userId) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={handleSubscribe}
        className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-3 rounded-full shadow-2xl hover:scale-105 transition-transform font-bold"
      >
        <Bell size={20} />
        Enable Notifications
      </button>
    </div>
  )
}