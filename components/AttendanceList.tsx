import { createClient } from '@/lib/supabase/server'
import UserAttendanceCard from './UserAttendanceCard'

interface Props {
  weekendDate: string
}

export default async function AttendanceList({ weekendDate }: Props) {
  const supabase = await createClient()
  
  const [plansResponse, profilesResponse] = await Promise.all([
    supabase
      .from('weekend_plans')
      .select(`
        user_id,
        status,
        profiles (
          id,
          full_name,
          avatar_url,
          email
        )
      `)
      .eq('weekend_date', weekendDate),
    supabase.from('profiles').select('*')
  ])

  const plans = plansResponse.data || []
  const allProfiles = profilesResponse.data || []

  const going = plans.filter((p) => p.status === 'going')
  const notGoing = plans.filter((p) => p.status === 'not_going')
  const pending = plans.filter((p) => p.status === 'pending')

  const answeredUserIds = new Set(plans.map(p => p.user_id))
  const unanswered = allProfiles
    .filter(profile => !answeredUserIds.has(profile.id))
    .map(profile => ({
      profiles: profile,
      status: 'unanswered'
    }))

  return (
    <div className="w-full max-w-md space-y-8">
      <Section title="SÍ" users={going} color="text-green-500" />
      <Section title="NO" users={notGoing} color="text-red-500" />
      <Section title="POTSER" users={pending} color="text-zinc-500" />
      <Section title="PENDENT" users={unanswered} color="text-zinc-400" opacity="opacity-60" />
    </div>
  )
}

function Section({ title, users, color, opacity }: { title: string; users: any[]; color: string; opacity?: string }) {
  if (users.length === 0) return null

  return (
    <div className={`space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500 ${opacity || ''}`}>
      <h3 className={`text-sm font-bold uppercase tracking-wider ${color}`}>
        {title} ({users.length})
      </h3>
      <div className="grid gap-2">
        {users.map((plan, i) => (
          <UserAttendanceCard key={i} profile={plan.profiles} />
        ))}
      </div>
    </div>
  )
}