'use client'

import { useOptimistic, useTransition } from 'react'
import { toggleActivityParticipation, deleteActivity } from '@/app/actions/activities'
import { Users, Clock, Trash2 } from 'lucide-react'

interface Participant {
  user_id: string
  profiles: {
    full_name: string | null
    avatar_url: string | null
    email: string
  }
}

interface Activity {
  id: string
  creator_id: string
  title: string
  description: string | null
  start_time: string | null
  day_of_week: string
  activity_participants: Participant[]
}

export default function ActivityCard({ activity, currentUserId }: { activity: Activity, currentUserId: string }) {
  const [isPending, startTransition] = useTransition()
  const isJoined = activity.activity_participants.some(p => p.user_id === currentUserId)
  const isCreator = activity.creator_id === currentUserId

  const [optimisticParticipants, setOptimisticParticipants] = useOptimistic(
    activity.activity_participants,
    (state, isJoining: boolean) => {
      if (isJoining) {
        return [...state, { user_id: currentUserId, profiles: { full_name: 'Tu', avatar_url: null, email: '' } }]
      }
      return state.filter(p => p.user_id !== currentUserId)
    }
  )

  const handleToggle = async () => {
    const nextJoining = !isJoined
    startTransition(async () => {
      setOptimisticParticipants(nextJoining)
      await toggleActivityParticipation(activity.id, nextJoining)
    })
  }

  const handleDelete = async () => {
    if (!confirm('Segur que vols esborrar aquest pla?')) return
    startTransition(async () => {
      await deleteActivity(activity.id)
    })
  }

  const dayLabels: { [key: string]: string } = {
    'divendres': 'Div',
    'dissabte': 'Dis',
    'diumenge': 'Diu'
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 rounded-3xl shadow-sm space-y-4 relative">
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">
              {dayLabels[activity.day_of_week]}
            </span>
            <h4 className="font-bold text-lg leading-tight text-zinc-950 dark:text-white truncate">{activity.title}</h4>
            {isCreator && (
              <button 
                onClick={handleDelete}
                className="p-1.5 text-zinc-300 dark:text-zinc-600 hover:text-red-500 transition-all rounded-lg active:scale-90"
                aria-label="Esborra el pla"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
          {activity.description && <p className="text-sm text-zinc-500 line-clamp-2">{activity.description}</p>}
        </div>
        <button
          onClick={handleToggle}
          disabled={isPending}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-[10px] font-black tracking-widest transition-all ${
            isJoined
              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
              : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md active:scale-95'
          }`}
        >
          {isJoined ? 'SURT' : 'APUNTA\'T'}
        </button>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-zinc-50 dark:border-zinc-800">
        <div className="flex -space-x-2">
          {optimisticParticipants.map((p, i) => (
            <div 
              key={i} 
              className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 border-2 border-white dark:border-zinc-900 flex items-center justify-center overflow-hidden"
              title={p.profiles.full_name || p.profiles.email}
            >
              {p.profiles.avatar_url ? (
                <img src={p.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] font-bold uppercase">
                  {p.profiles.full_name?.[0] || p.profiles.email?.[0] || '?'}
                </span>
              )}
            </div>
          ))}
          {optimisticParticipants.length === 0 && (
            <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1 uppercase tracking-widest">
              <Users size={12} /> Ningú encara
            </span>
          )}
        </div>

        {activity.start_time && (
          <div className="flex items-center gap-1 text-zinc-400">
            <Clock size={12} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{activity.start_time}</span>
          </div>
        )}
      </div>
    </div>
  )
}