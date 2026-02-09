'use client'

import { useState } from 'react'
import ProfileModal from './ProfileModal'

export default function ProfileButton({ user, profile }: { user: any, profile: any }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border-2 border-white dark:border-zinc-900 shadow-sm hover:scale-105 transition-transform"
      >
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <span className="font-black text-sm uppercase">
            {profile?.full_name?.[0] || user?.email?.[0] || '?'}
          </span>
        )}
      </button>

      {isOpen && (
        <ProfileModal
          user={user}
          profile={profile}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
