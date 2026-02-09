'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, AlertTriangle } from 'lucide-react'

export default function OneSignalProvider({ userId }: { userId: string | undefined }) {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return

    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID

    if (!appId || appId === 'your-onesignal-app-id') {
      console.error('OneSignal: NEXT_PUBLIC_ONESIGNAL_APP_ID is missing or default!')
      setError('Missing App ID')
      return
    }

    const onSubscribed = async (onesignalId: string) => {
      console.log('OneSignal: Saving ID to DB:', onesignalId)
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({ onesignal_id: onesignalId })
        .eq('id', userId)
      
      if (error) console.error('OneSignal: Supabase error:', error)
      else setIsSubscribed(true)
    }

    const setupOneSignal = async () => {
      const OneSignal = (window as any).OneSignal
      
      try {
        console.log('OneSignal: Starting Init...')
        await OneSignal.init({
          appId: appId,
          allowLocalhostAsSecureOrigin: true,
        })

        setInitialized(true)
        console.log('OneSignal: Init complete')

        // 1. Initial check
        const id = OneSignal.User.PushSubscription.id
        const optedIn = OneSignal.User.PushSubscription.optedIn
        
        if (id && optedIn) {
          await onSubscribed(id)
        }

        // 2. Listen for changes
        OneSignal.User.PushSubscription.addEventListener("change", (event: any) => {
          if (event.current.id && event.current.optedIn) {
            onSubscribed(event.current.id)
          }
        })

      } catch (err: any) {
        console.error('OneSignal: Fatal Error during init:', err)
        setError(err.message || 'Initialization failed')
      }
    }

    // Load SDK if not present
    if (!(window as any).OneSignal) {
      const script = document.createElement('script')
      script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'
      script.async = true
      document.head.appendChild(script)
      script.onload = setupOneSignal
      script.onerror = () => setError('SDK Load Blocked (check AdBlocker)')
    } else {
      setupOneSignal()
    }
  }, [userId])

  const handleSubscribe = async () => {
    const OneSignal = (window as any).OneSignal
    if (!OneSignal) return

    try {
      console.log('OneSignal: Prompting...')
      // Try to use the Native Prompt first
      await OneSignal.Notifications.requestPermission()
    } catch (err) {
      console.error('OneSignal: Prompt failed', err)
      // Fallback to Slidedown
      await OneSignal.Slidedown.promptPush()
    }
  }

  if (!userId || isSubscribed) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={handleSubscribe}
        disabled={!initialized || !!error}
        className={`flex items-center gap-2 px-6 py-4 rounded-full shadow-2xl transition-all font-bold ${
          error 
            ? 'bg-red-500 text-white opacity-80' 
            : 'bg-orange-500 text-white hover:scale-105 active:scale-95 animate-bounce'
        }`}
      >
        {error ? (
          <>
            <AlertTriangle size={24} />
            {error}
          </>
        ) : initialized ? (
          <>
            <Bell size={24} />
            Enable Notifications
          </>
        ) : (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Loading...
          </>
        )}
      </button>
    </div>
  )
}