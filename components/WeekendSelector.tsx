'use client'

import { useState } from 'react'
import { getNextWeekends, formatDbDate, ca } from '@/lib/utils'
import { format, addDays, parseISO } from 'date-fns'
import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar } from 'lucide-react'
import CalendarModal from './CalendarModal'

export default function WeekendSelector() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const selectedDateStr = searchParams.get('date') || formatDbDate(getNextWeekends()[0])
  const weekends = getNextWeekends(10)

  const handleSelectDate = (date: Date) => {
    const dateStr = formatDbDate(date)
    router.push(`?date=${dateStr}`)
    setIsModalOpen(false)
  }

  return (
    <>
      <div className="w-full flex gap-3 overflow-x-auto pb-4 px-4 no-scrollbar scroll-smooth justify-start">
        {weekends.map((friday) => {
          const dateStr = formatDbDate(friday)
          const isSelected = selectedDateStr === dateStr

          const sat = addDays(friday, 1)
          const sun = addDays(friday, 2)

          return (
            <button
              key={dateStr}
              onClick={() => router.push(`?date=${dateStr}`)}
              className={`flex-shrink-0 flex flex-col items-center min-w-[100px] p-4 rounded-3xl border transition-all ${
                isSelected
                  ? 'bg-zinc-900 border-zinc-900 text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-500'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                {format(friday, 'MMM', { locale: ca })}
              </span>
              <span className="text-xl font-black my-0.5">
                {format(sat, 'd')}-{format(sun, 'd')}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-tighter">
                Ds-Dg
              </span>
            </button>
          )
        })}

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex-shrink-0 flex flex-col items-center justify-center min-w-[100px] p-4 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
        >
          <Calendar size={24} />
          <span className="text-[10px] font-bold uppercase tracking-widest mt-2">Mes</span>
        </button>
      </div>

      {isModalOpen && (
        <CalendarModal
          selectedDate={parseISO(selectedDateStr)}
          onSelect={handleSelectDate}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}
