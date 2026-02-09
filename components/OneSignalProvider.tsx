'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, AlertCircle, Settings } from 'lucide-react'

export default function OneSignalProvider({ userId }: { userId: string | undefined }) {
  const [isSubscribed, setIsSubscribed] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const initRef = useRef(false)

  useEffect(() => {
    if (!userId || initRef.current) return
    
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID
    if (!appId) return

    initRef.current = true

    const syncSubscription = async (OneSignal: any) => {
      try {
        const id = OneSignal.User.PushSubscription.id
        const optedIn = OneSignal.User.PushSubscription.optedIn
        
        const isDenied = window.Notification?.permission === 'denied'
        setPermissionDenied(isDenied)
        setIsSubscribed(optedIn && !isDenied)

        if (id && optedIn && !isDenied) {
          const supabase = createClient()
          await supabase
            .from('profiles')
            .update({ onesignal_id: id })
            .eq('id', userId)
        }
      } catch (e) {
        console.error("OneSignal sync error", e)
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
      setShowInstructions(true)
      // Reset el missatge després de 5 segons
      setTimeout(() => setShowInstructions(false), 5000)
      return
    }

    const OneSignal = (window as any).OneSignal
    if (OneSignal) {
      try {
        await OneSignal.Slidedown.promptPush()
      } catch (e) {
        console.error("Prompt error", e)
      }
    }
  }

  if (!userId || (isSubscribed && !permissionDenied) || !initialized) return null

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 max-w-[280px]">
      {showInstructions && (
        <div className="bg-white dark:bg-zinc-900 border border-red-100 dark:border-red-900/30 p-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-2 duration-300">
          <p className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-tight">
            Accés bloquejat al mòbil. Ves a Configuració {'>'} Notificacions i activa-les per aquesta App.
          </p>
        </div>
      )}
      
      <button
        onClick={handleSubscribe}
        className={`flex items-center gap-2 px-5 py-3 rounded-full shadow-xl active:scale-95 transition-all font-bold text-sm ${
          permissionDenied 
            ? 'bg-red-500 text-white' 
            : 'bg-zinc-900 text-white hover:bg-zinc-800'
        }`}
      >
        {permissionDenied ? (
          <>
            <Settings size={18} className={showInstructions ? 'animate-spin' : ''} />
            {showInstructions ? "Mira les instruccions" : "Corregir permisos"}
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
