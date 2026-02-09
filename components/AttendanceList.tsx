import { createClient } from '@/lib/supabase/server'

interface Props {
  weekendDate: string
}

export default async function AttendanceList({ weekendDate }: Props) {
  const supabase = await createClient()
  
  const { data: plans } = await supabase
    .from('weekend_plans')
    .select(`
      status,
      profiles (
        full_name,
        avatar_url,
        email
      )
    `)
    .eq('weekend_date', weekendDate)

  const going = plans?.filter((p) => p.status === 'going') || []
  const notGoing = plans?.filter((p) => p.status === 'not_going') || []
  const pending = plans?.filter((p) => p.status === 'pending') || []

  return (
    <div className="w-full max-w-md space-y-8">
      <Section title="SÍ" users={going} color="text-green-500" />
      <Section title="NO" users={notGoing} color="text-red-500" />
      <Section title="POTSER" users={pending} color="text-zinc-500" />
    </div>
  )
}

function Section({ title, users, color }: { title: string; users: any[]; color: string }) {
  if (users.length === 0) return null

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <h3 className={`text-sm font-bold uppercase tracking-wider ${color}`}>
        {title} ({users.length})
      </h3>
      <div className="grid gap-2">
        {users.map((plan, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm"
          >
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-100 dark:border-zinc-700">
              {plan.profiles.avatar_url ? (
                <img src={plan.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-zinc-500 font-bold uppercase">
                  {plan.profiles.full_name?.[0] || plan.profiles.email[0]}
                </span>
              )}
            </div>
            <span className="font-semibold text-sm">
              {plan.profiles.full_name || plan.profiles.email.split('@')[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}