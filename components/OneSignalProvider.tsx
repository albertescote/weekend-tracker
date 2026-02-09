'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, Settings } from 'lucide-react'

export default function OneSignalProvider({ userId }: { userId: string | undefined }) {
  const [isSubscribed, setIsSubscribed] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown')
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
        const perm = window.Notification?.permission || 'default'
        
        setPermissionStatus(perm)
        setIsSubscribed(!!id && optedIn && perm === 'granted')

        if (id && optedIn && perm === 'granted') {
          const supabase = createClient()
          await supabase.from('profiles').update({ onesignal_id: id }).eq('id', userId)
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
          console.error('OneSignal init error:', e)
        }
      })
    }

    runInit()
  }, [userId])

  const handleSubscribe = async () => {
    const OneSignal = (window as any).OneSignal
    
    // 1. Si ja ens han denegat el permís manualment
    if (window.Notification?.permission === 'denied') {
      setShowInstructions(true)
      setTimeout(() => setShowInstructions(false), 8000)
      return
    }

    try {
      // 2. Intentem primer la via NATIVA (especialment per a iOS PWA)
      if (typeof Notification !== 'undefined' && Notification.requestPermission) {
        const result = await Notification.requestPermission()
        if (result === 'granted' && OneSignal) {
          // Si ens donen permís, avisem a OneSignal perquè es registri
          await OneSignal.User.PushSubscription.optIn()
        }
      } else if (OneSignal) {
        // 3. Fallback a OneSignal
        await OneSignal.Notifications.requestPermission()
      }
    } catch (err) {
      console.error("Prompt error", err)
      if (OneSignal) await OneSignal.Slidedown.promptPush()
    }
  }

  const shouldShow = userId && initialized && !isSubscribed

  if (!shouldShow) return null

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 max-w-[280px]">
      {showInstructions && (
        <div className="bg-white dark:bg-zinc-900 border-2 border-red-500 p-4 rounded-3xl shadow-2xl animate-in slide-in-from-bottom-2 duration-300">
          <p className="text-[11px] font-black text-red-600 dark:text-red-400 uppercase tracking-tight leading-relaxed text-center">
            ⚠️ ACCÉS BLOQUEJAT: Ves a la configuració de l'iPhone, busca aquesta App i activa les notificacions.
          </p>
        </div>
      )}
      
      <button
        onClick={handleSubscribe}
        className={`flex items-center gap-2 px-6 py-4 rounded-full shadow-2xl active:scale-95 transition-all font-black text-sm ${
          permissionStatus === 'denied'
            ? 'bg-red-500 text-white' 
            : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
        }`}
      >
        {permissionStatus === 'denied' ? (
          <>
            <Settings size={20} />
            Corregir permisos
          </>
        ) : (
          <>
            <Bell size={20} />
            Activa Notificacions
          </>
        )}
      </button>
    </div>
  )
}