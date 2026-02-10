'use client'

import { useState } from 'react'
import { Profile } from '@/types'
import UserSummaryModal from './UserSummaryModal'

interface Props {
  profile: Profile
}

export default function UserAttendanceCard({ profile }: Props) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm active:scale-95 transition-all cursor-pointer hover:border-zinc-200 dark:hover:border-zinc-700"
      >
        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-100 dark:border-zinc-700">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-zinc-500 font-bold uppercase">
              {(profile.full_name || profile.email)[0]}
            </span>
          )}
        </div>
        <span className="font-semibold text-sm">
          {profile.full_name || profile.email.split('@')[0]}
        </span>
      </div>

      {showModal && (
        <UserSummaryModal
          profile={profile}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
