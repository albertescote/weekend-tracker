'use client'

import { useState } from 'react'
import { createActivity } from '@/app/actions/activities'
import { Plus, X, Clock } from 'lucide-react'
import { parseISO, addDays, format } from 'date-fns'

export default function NewActivityForm({ weekendDate }: { weekendDate: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState('dissabte')

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

      <h3 className="text-lg font-bold tracking-tight text-zinc-950 dark:text-white">Nou Pla</h3>
      
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
          placeholder="Títol (ex: Sopar a la plaça)"
          required
          className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 font-bold"
        />
        
        {/* Camp d'hora millorat amb icona i label */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">
            <Clock size={12} />
            A quina hora?
          </label>
          <input
            name="start_time"
            type="time"
            required
            className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 font-bold text-zinc-950 dark:text-white appearance-none"
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
