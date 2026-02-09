'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, AlertCircle, Settings } from 'lucide-react'

export default function OneSignalProvider({ userId }: { userId: string | undefined }) {
  const [isSubscribed, setIsSubscribed] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown')
  const [showInstructions, setShowInstructions] = useState(false)
  const initRef = useRef(false)

  useEffect(() => {
    console.log('DEBUG: OneSignalProvider montat. UserID:', userId)
    
    if (!userId || initRef.current) return
    
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID
    if (!appId) {
      console.error('DEBUG: OneSignal APP ID falta!')
      return
    }

    initRef.current = true

    const syncSubscription = async (OneSignal: any) => {
      console.log('DEBUG: Iniciant syncSubscription...')
      try {
        const id = OneSignal.User.PushSubscription.id
        const optedIn = OneSignal.User.PushSubscription.optedIn
        const perm = window.Notification?.permission || 'not-supported'
        
        console.log('DEBUG: OneSignal ID:', id)
        console.log('DEBUG: OneSignal OptedIn:', optedIn)
        console.log('DEBUG: Browser Permission:', perm)

        setPermissionStatus(perm)
        setIsSubscribed(optedIn && perm === 'granted')

        if (id && optedIn && perm === 'granted') {
          console.log('DEBUG: Intentant guardar ID a Supabase...')
          const supabase = createClient()
          const { error } = await supabase
            .from('profiles')
            .update({ onesignal_id: id })
            .eq('id', userId)
          
          if (error) console.error('DEBUG: Error Supabase:', error)
          else console.log('DEBUG: ID guardat correctament.')
        }
      } catch (e) {
        console.error("DEBUG: Error en syncSubscription", e)
      }
    }

    const runInit = async () => {
      const OneSignal = (window as any).OneSignal
      if (!OneSignal) {
        console.log('DEBUG: Esperant que OneSignal carregui...')
        setTimeout(runInit, 500)
        return
      }

      console.log('DEBUG: OneSignal trobat. Executant .push(init)...')
      await OneSignal.push(async () => {
        try {
          await OneSignal.init({
            appId: appId,
            allowLocalhostAsSecureOrigin: true,
          })
          
          console.log('DEBUG: OneSignal.init() completat.')
          setInitialized(true)
          await syncSubscription(OneSignal)

          OneSignal.User.PushSubscription.addEventListener("change", () => {
            console.log('DEBUG: Canvi detectat a la subscripció.')
            syncSubscription(OneSignal)
          })
        } catch (e) {
          console.error('DEBUG: Error en OneSignal.init():', e)
        }
      })
    }

    runInit()
  }, [userId])

  const handleSubscribe = async () => {
    console.log('DEBUG: Click al botó de subscripció. Estat permís:', permissionStatus)
    
    if (permissionStatus === 'denied') {
      console.log('DEBUG: Permís denegat. Mostrant instruccions.')
      setShowInstructions(true)
      setTimeout(() => setShowInstructions(false), 8000)
      return
    }

    const OneSignal = (window as any).OneSignal
    if (OneSignal) {
      console.log('DEBUG: Executant Slidedown.promptPush()...')
      try {
        await OneSignal.Slidedown.promptPush()
      } catch (e) {
        console.error("DEBUG: Error en promptPush():", e)
      }
    } else {
      console.error('DEBUG: Objecte OneSignal no trobat en fer clic.')
    }
  }

  // Lògica de visibilitat
  const shouldShow = userId && initialized && (!isSubscribed || permissionStatus === 'denied')
  
  console.log('DEBUG: Render check - UserID:', !!userId, 'Init:', initialized, 'isSubscribed:', isSubscribed, 'Perm:', permissionStatus, 'Result:', shouldShow)

  if (!shouldShow) return null

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 max-w-[280px]">
      {showInstructions && (
        <div className="bg-white dark:bg-zinc-900 border-2 border-red-500 p-4 rounded-3xl shadow-2xl animate-in slide-in-from-bottom-2 duration-300">
          <p className="text-[11px] font-black text-red-600 dark:text-red-400 uppercase tracking-tight leading-relaxed">
            ⚠️ ACCÉS BLOQUEJAT: Has d'anar a la configuració del mòbil, buscar aquesta App i permetre les notificacions manualment.
          </p>
        </div>
      )}
      
      <button
        onClick={() => {
          console.log('DEBUG: onClick disparat des del JSX')
          handleSubscribe()
        }}
        className={`flex items-center gap-2 px-6 py-4 rounded-full shadow-2xl active:scale-95 transition-all font-black text-sm ${
          permissionStatus === 'denied'
            ? 'bg-red-500 text-white' 
            : 'bg-zinc-900 text-white hover:bg-zinc-800'
        }`}
      >
        {permissionStatus === 'denied' ? (
          <>
            <Settings size={20} />
            Configura Notificacions
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