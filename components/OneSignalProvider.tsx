'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell } from 'lucide-react'

export default function OneSignalProvider({ userId }: { userId: string | undefined }) {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // We only want to run this if we have a logged-in user
    if (!userId) {
      console.log('OneSignal: No userId provided, skipping init.')
      return
    }

    const initOneSignal = async () => {
      try {
        const OneSignal = (window as any).OneSignal || []
        
        await OneSignal.push(async () => {
          console.log('OneSignal: Initializing with ID:', process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID)
          
          await OneSignal.init({
            appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
            allowLocalhostAsSecureOrigin: true,
          })

          setInitialized(true)

          // Check if user is opted in
          const isPushEnabled = OneSignal.User.PushSubscription.optedIn
          console.log('OneSignal: Is push enabled?', isPushEnabled)
          setIsSubscribed(isPushEnabled)

          if (isPushEnabled && OneSignal.User.PushSubscription.id) {
            console.log('OneSignal: User is already subscribed, saving ID:', OneSignal.User.PushSubscription.id)
            saveOneSignalId(OneSignal.User.PushSubscription.id)
          }

          // Listen for subscription changes (e.g. when they click Allow)
          OneSignal.User.PushSubscription.addEventListener("change", (event: any) => {
            console.log('OneSignal: Subscription changed:', event)
            if (event.current.id && event.current.optedIn) {
              saveOneSignalId(event.current.id)
              setIsSubscribed(true)
            }
          })
        })
      } catch (err) {
        console.error('OneSignal Init Error:', err)
      }
    }

    const saveOneSignalId = async (onesignalId: string) => {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({ onesignal_id: onesignalId })
        .eq('id', userId)
      
      if (error) console.error('OneSignal: Error saving to Supabase:', error)
      else console.log('OneSignal: Successfully saved ID to Supabase')
    }

    // Load Script
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
      console.log('OneSignal: Prompting for push...')
      try {
        await OneSignal.Slidedown.promptPush()
      } catch (err) {
        console.error('OneSignal: Prompt error:', err)
      }
    }
  }

  // Don't show anything if user isn't logged in, or if they're already subscribed
  if (!userId || isSubscribed) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={handleSubscribe}
        className="flex items-center gap-2 bg-orange-500 text-white px-6 py-4 rounded-full shadow-2xl hover:scale-105 transition-transform font-bold animate-bounce"
      >
        <Bell size={24} />
        {initialized ? "Enable Notifications" : "Loading Notifications..."}
      </button>
    </div>
  )
}
