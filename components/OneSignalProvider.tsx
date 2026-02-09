'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell } from 'lucide-react'

export default function OneSignalProvider({ userId }: { userId: string | undefined }) {
  const [isSubscribed, setIsSubscribed] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const initRef = useRef(false)

  useEffect(() => {
    if (!userId || initRef.current) return
    
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID
    if (!appId) return

    initRef.current = true

    const syncSubscription = async (OneSignal: any) => {
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

    const runInit = async () => {
      const OneSignal = (window as any).OneSignal
      if (!OneSignal) {
        // If not loaded yet, wait and try again
        setTimeout(runInit, 500)
        return
      }

      await OneSignal.push(async () => {
        try {
          await OneSignal.init({
            appId: appId,
            allowLocalhostAsSecureOrigin: true,
          })
          
          setInitialized(true)
          await syncSubscription(OneSignal)

          OneSignal.User.PushSubscription.addEventListener("change", () => syncSubscription(OneSignal))
        } catch (e) {
          console.error('OneSignal initialization error:', e)
        }
      })
    }

    runInit()
  }, [userId])

  const handleSubscribe = async () => {
    const OneSignal = (window as any).OneSignal
    if (OneSignal) {
      await OneSignal.Slidedown.promptPush()
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
        Activa Notificacions
      </button>
    </div>
  )
}
