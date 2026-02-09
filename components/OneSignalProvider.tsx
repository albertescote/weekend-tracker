'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell } from 'lucide-react'

export default function OneSignalProvider({ userId }: { userId: string | undefined }) {
  const [isSubscribed, setIsSubscribed] = useState(true) // Default to true to avoid flicker
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!userId) return

    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID
    if (!appId) return

    const syncSubscription = async () => {
      const OneSignal = (window as any).OneSignal
      const id = OneSignal.User.PushSubscription.id
      const optedIn = OneSignal.User.PushSubscription.optedIn
      
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
      const OneSignal = (window as any).OneSignal
      try {
        await OneSignal.init({
          appId: appId,
          allowLocalhostAsSecureOrigin: true,
        })
        
        setInitialized(true)
        await syncSubscription()

        OneSignal.User.PushSubscription.addEventListener("change", syncSubscription)
      } catch (e) {
        console.error('OneSignal initialization failed', e)
      }
    }

    if (!(window as any).OneSignal) {
      const script = document.createElement('script')
      script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'
      script.async = true
      document.head.appendChild(script)
      script.onload = init
    } else {
      init()
    }
  }, [userId])

  const handleSubscribe = async () => {
    const OneSignal = (window as any).OneSignal
    if (!OneSignal) return
    await OneSignal.Slidedown.promptPush()
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
