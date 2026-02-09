'use client'

import { useState } from 'react'
import { createActivity } from '@/app/actions/activities'
import { Plus, X } from 'lucide-react'

export default function NewActivityForm({ weekendDate }: { weekendDate: string }) {
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl flex items-center justify-center gap-2 text-zinc-400 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
      >
        <Plus size={20} />
        Proposa un Pla
      </button>
    )
  }

  return (
    <form
      action={async (formData) => {
        await createActivity(formData)
        setIsOpen(false)
      }}
      className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 rounded-[2rem] shadow-xl space-y-4 relative animate-in zoom-in-95 duration-200"
    >
      <button
        type="button"
        onClick={() => setIsOpen(false)}
        className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600"
      >
        <X size={20} />
      </button>

      <h3 className="text-lg font-bold tracking-tight">Nou Pla</h3>
      
      <input type="hidden" name="weekend_date" value={weekendDate} />
      
      <div className="space-y-3">
        <input
          name="title"
          placeholder="Títol (ex: Sopar a la plaça)"
          required
          className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 font-medium"
        />
        <div className="flex gap-3">
          <input
            name="start_time"
            type="time"
            placeholder="Hora"
            className="flex-1 px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 font-medium"
          />
        </div>
        <textarea
          name="description"
          placeholder="Detalls (opcional)"
          rows={2}
          className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 font-medium"
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-black transition-transform active:scale-95 shadow-lg"
      >
        AFEGIR PLA
      </button>
    </form>
  )
}