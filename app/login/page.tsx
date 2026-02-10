'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground">
      <div className="w-full max-w-sm space-y-8 bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">KONNECTA</h1>
          <p className="text-zinc-500">Inicia sessió per organitzar el cap de setmana amb els teus amics</p>
        </div>

        <div className="py-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-semibold text-zinc-700 dark:text-zinc-200 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-750 disabled:opacity-50 shadow-sm"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.18 1-.78 1.85-1.63 2.53v2.1h2.63c1.54-1.42 2.43-3.5 2.43-6.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-2.63-2.1c-.73.5-1.66.79-2.65.79-2.84 0-5.24-1.92-6.1-4.5H2.64v2.16C4.45 20.21 8 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.9 14.53c-.22-.66-.35-1.36-.35-2.03s.13-1.37.35-2.03V8.31H2.64c-.73 1.48-1.14 3.12-1.14 4.89s.41 3.41 1.14 4.89l3.26-2.56z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 8 1 4.45 3.79 2.64 7.41l3.26 2.56c.86-2.58 3.26-4.59 6.1-4.59z"
                  fill="#EA4335"
                />
              </svg>
            )}
            {loading ? 'Connectant...' : 'Continua amb Google'}
          </button>
        </div>

        {error && (
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <p className="text-xs text-zinc-400 px-4">
          En iniciar sessió, acceptes compartir els teus plans amb els teus amics.
        </p>
      </div>
    </div>
  )
}
