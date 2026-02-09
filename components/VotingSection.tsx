'use client'

import { useOptimistic, useTransition } from 'react'
import { updateStatus } from '@/app/actions/plans'
import { Check, X, Minus } from 'lucide-react'

type Status = 'going' | 'not_going' | 'pending'

interface Props {
  userId: string
  weekendDate: string
  initialStatus: Status
  displayDate: string
}

export default function VotingSection({ userId, weekendDate, initialStatus, displayDate }: Props) {
  const [isPending, startTransition] = useTransition()
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    initialStatus,
    (_, newStatus: Status) => newStatus
  )

  async function handleVote(status: Status) {
    startTransition(async () => {
      setOptimisticStatus(status)
      try {
        await updateStatus(userId, weekendDate, status)
      } catch (error) {
        console.error(error)
      }
    })
  }

  return (
    <div className="flex flex-col items-center gap-2 p-5 bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800">
      <div className="text-center space-y-0.5">
        <h2 className="text-lg font-bold tracking-tight text-zinc-950 dark:text-white">Hi seràs?</h2>
        <p className="text-[9px] font-black uppercase tracking-widest text-blue-500 dark:text-blue-400">
          Cap de setmana del {displayDate}
        </p>
      </div>
      
      <div className="flex gap-4 mt-1">
        <button
          onClick={() => handleVote('going')}
          disabled={isPending}
          className={`px-4 py-3 rounded-2xl transition-all ${
            optimisticStatus === 'going'
              ? 'bg-green-500 text-white shadow-lg scale-110'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          <Check size={32} />
          <span className="block text-xs mt-1 font-medium">Sí</span>
        </button>

        <button
          onClick={() => handleVote('not_going')}
          disabled={isPending}
          className={`px-4 py-3 rounded-2xl transition-all ${
            optimisticStatus === 'not_going'
              ? 'bg-red-500 text-white shadow-lg scale-110'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          <X size={32} />
          <span className="block text-xs mt-1 font-medium">No</span>
        </button>

        <button
          onClick={() => handleVote('pending')}
          disabled={isPending}
          className={`px-4 py-3 rounded-2xl transition-all ${
            optimisticStatus === 'pending'
              ? 'bg-zinc-400 text-white shadow-lg scale-110'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          <Minus size={32} />
          <span className="block text-xs mt-1 font-medium">Potser</span>
        </button>
      </div>
    </div>
  )
}
