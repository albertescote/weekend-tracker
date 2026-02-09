'use client'

import { signOut } from '@/app/actions/auth'
import { Lock, LogOut } from 'lucide-react'

export default function NotAuthorized({ email }: { email: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
      <div className="max-w-sm w-full space-y-8 animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-[2.5rem] flex items-center justify-center text-red-500 shadow-inner">
            <Lock size={40} />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tighter text-zinc-950 dark:text-white">
              ACCÉS RESTRINGIT
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">
              Ho sentim, el correu <span className="text-zinc-950 dark:text-white font-bold">{email}</span> no és a la llista de convidats.
            </p>
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <button
            onClick={() => signOut()}
            className="w-full py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl font-black shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={20} />
            TANCAR SESSIÓ
          </button>
          
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
            Contacta amb l'administrador per demanar accés.
          </p>
        </div>
      </div>
    </div>
  )
}
