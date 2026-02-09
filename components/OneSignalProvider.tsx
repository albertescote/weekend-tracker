'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, AlertCircle } from 'lucide-react'

export default function OneSignalProvider({ userId }: { userId: string | undefined }) {
  const [isSubscribed, setIsSubscribed] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const initRef = useRef(false)

  useEffect(() => {
    if (!userId || initRef.current) return
    
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID
    if (!appId) return

    initRef.current = true

    const syncSubscription = async (OneSignal: any) => {
      const id = OneSignal.User.PushSubscription.id
      const optedIn = OneSignal.User.PushSubscription.optedIn
      
      // Comprovar si el permís ha estat denegat manualment
      const isDenied = Notification.permission === 'denied'
      setPermissionDenied(isDenied)
      setIsSubscribed(optedIn && !isDenied)

      if (id && optedIn && !isDenied) {
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
    if (permissionDenied) {
      alert('Has bloquejat les notificacions. Per activar-les, has d\'anar a la configuració del teu navegador o dispositiu i permetre-les per aquesta web.')
      return
    }

    const OneSignal = (window as any).OneSignal
    if (OneSignal) {
      await OneSignal.Slidedown.promptPush()
    }
  }

  if (!userId || (isSubscribed && !permissionDenied) || !initialized) return null

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <button
        onClick={handleSubscribe}
        className={`flex items-center gap-2 px-5 py-3 rounded-full shadow-xl active:scale-95 transition-all font-bold text-sm ${
          permissionDenied 
            ? 'bg-red-500 text-white hover:bg-red-600' 
            : 'bg-zinc-900 text-white hover:bg-zinc-800'
        }`}
      >
        {permissionDenied ? (
          <>
            <AlertCircle size={18} />
            Notificacions bloquejades
          </>
        ) : (
          <>
            <Bell size={18} />
            Activa Notificacions
          </>
        )}
      </button>
    </div>
  )
}