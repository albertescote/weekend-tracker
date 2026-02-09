import { createClient } from '@/lib/supabase/server'
import { Trophy } from 'lucide-react'

export default async function HallOfFame() {
  const supabase = await createClient()
  const { data: winners } = await supabase.rpc('get_hall_of_fame')

  if (!winners || winners.length === 0) return null

  return (
    <section className="w-full max-w-md space-y-4">
      <div className="flex items-center gap-2 px-2 text-zinc-500">
        <Trophy size={18} className="text-amber-500" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Top Vilatans</h3>
      </div>
      
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-4 space-y-3 shadow-sm">
        {winners.map((user: any, i: number) => (
          <div key={i} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border-2 border-transparent group-first:border-amber-400 shadow-inner">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold">{user.full_name?.[0] || user.email[0]}</span>
                  )}
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center text-[10px] font-black border border-zinc-200 dark:border-zinc-700 shadow-sm">
                  {i + 1}
                </div>
              </div>
              <span className="font-semibold text-sm">{user.full_name || user.email.split('@')[0]}</span>
            </div>
            <span className="px-3 py-1 bg-zinc-50 dark:bg-zinc-800 rounded-full text-[9px] font-black text-zinc-500 uppercase tracking-wider">
              {user.visit_count} visites
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}