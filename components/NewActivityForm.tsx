'use client'

import { useState } from 'react'
import { createActivity } from '@/app/actions/activities'
import { Plus, X, Clock } from 'lucide-react'
import { parseISO, addDays, format } from 'date-fns'

export default function NewActivityForm({ weekendDate }: { weekendDate: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState('dissabte')
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const anchorDate = parseISO(weekendDate)
  const daysData = [
    { id: 'divendres', label: 'Div', date: anchorDate },
    { id: 'dissabte', label: 'Dis', date: addDays(anchorDate, 1) },
    { id: 'diumenge', label: 'Diu', date: addDays(anchorDate, 2) },
  ]

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
        setIsPending(true)
        setError(null)
        
        const hour = formData.get('hour')
        const minute = formData.get('minute')
        formData.set('start_time', `${hour}:${minute}`)

        const res = await createActivity(formData)
        setIsPending(false)
        if (res.success) {
          setIsOpen(false)
        } else {
          setError(res.error || 'Alguna cosa ha anat malament')
        }
      }}
      className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 rounded-[2rem] shadow-xl space-y-4 relative animate-in zoom-in-95 duration-200"
    >
      <button
        type="button"
        onClick={() => {
          setIsOpen(false)
          setError(null)
        }}
        className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600"
      >
        <X size={20} />
      </button>

      <h3 className="text-lg font-bold tracking-tight text-zinc-950 dark:text-white">Nou Pla</h3>

      {error && (
        <p className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">
          {error}
        </p>
      )}

      <input type="hidden" name="weekend_date" value={weekendDate} />
      <input type="hidden" name="day_of_week" value={selectedDay} />

      <div className="space-y-4">
        {/* Selector de Dia */}
        <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
          {daysData.map((day) => (
            <button
              key={day.id}
              type="button"
              onClick={() => setSelectedDay(day.id)}
              className={`flex-1 py-2 flex flex-col items-center rounded-xl transition-all ${
                selectedDay === day.id 
                  ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-sm scale-[1.02]' 
                  : 'text-zinc-400'
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-wider leading-none">{day.label}</span>
              <span className="text-sm font-bold mt-0.5">{format(day.date, 'd')}</span>
            </button>
          ))}
        </div>

        <input
          name="title"
          placeholder="Títol"
          required
          className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 font-bold"
        />

        {/* Selector d'hora personalitzat de 15 minuts */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">
            <Clock size={12} />
            A quina hora?
          </label>
          <div className="flex gap-2">
            <select
              name="hour"
              defaultValue="19"
              className="flex-1 px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 font-bold text-zinc-950 dark:text-white appearance-none text-center"
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <option key={i} value={i.toString().padStart(2, '0')}>
                  {i.toString().padStart(2, '0')}h
                </option>
              ))}
            </select>
            <div className="flex items-center font-bold text-zinc-400">:</div>
            <select
              name="minute"
              defaultValue="00"
              className="flex-1 px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 font-bold text-zinc-950 dark:text-white appearance-none text-center"
            >
              {['00', '15', '30', '45'].map((m) => (
                <option key={m} value={m}>
                  {m}m
                </option>
              ))}
            </select>
          </div>
          {/* Combinem els valors en un input hidden per l'acció */}
          <input type="hidden" name="start_time" value="" />
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
        disabled={isPending}
        className="w-full py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-black transition-transform active:scale-95 shadow-lg disabled:opacity-50"
      >
        {isPending ? 'CREANT...' : 'AFEGIR PLA'}
      </button>
    </form>
  )
}
