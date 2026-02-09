'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell } from 'lucide-react'

export default function OneSignalProvider({ userId }: { userId: string | undefined }) {
  const [isSubscribed, setIsSubscribed] = useState(true)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!userId) return

    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID
    if (!appId) return

    // Create the command queue if it doesn't exist
    const OneSignal = (window as any).OneSignal || []
    if (!(window as any).OneSignal) {
      (window as any).OneSignal = OneSignal
    }

    const syncSubscription = async () => {
      const OS = (window as any).OneSignal
      const id = OS.User.PushSubscription.id
      const optedIn = OS.User.PushSubscription.optedIn
      
      setIsSubscribed(optedIn)

      if (id && optedIn) {
        const supabase = createClient()
        await supabase
          .from('profiles')
          .update({ onesignal_id: id })
          .eq('id', userId)
      }
    }

    const init = async () => {
      const OS = (window as any).OneSignal
      
      // Use push to ensure the SDK is fully loaded and ready
      OS.push(async () => {
        try {
          await OS.init({
            appId: appId,
            allowLocalhostAsSecureOrigin: true,
          })
          
          setInitialized(true)
          await syncSubscription()

          OS.User.PushSubscription.addEventListener("change", syncSubscription)
        } catch (e) {
          console.error('OneSignal execution failed', e)
        }
      })
    }

    if (!document.getElementById('onesignal-sdk')) {
      const script = document.createElement('script')
      script.id = 'onesignal-sdk'
      script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'
      script.async = true
      document.head.appendChild(script)
      script.onload = init
    } else {
      init()
    }
  }, [userId])

  const handleSubscribe = async () => {
    const OS = (window as any).OneSignal
    if (OS) {
      OS.push(async () => {
        await OS.Slidedown.promptPush()
      })
    }
  }

  if (!userId || isSubscribed || !initialized) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={handleSubscribe}
        className="flex items-center gap-2 bg-zinc-900 text-white px-5 py-3 rounded-full shadow-xl hover:bg-zinc-800 active:scale-95 transition-all font-bold text-sm"
      >
        <Bell size={18} />
        Enable Notifications
      </button>
    </div>
  )
}