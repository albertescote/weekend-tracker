interface Profile {
  full_name: string | null
  avatar_url: string | null
  email: string
}

interface Plan {
  status: string
  profiles: Profile
}

interface Props {
  plans: any[] // Using any for now, should use generated types
}

export default function AttendanceList({ plans }: Props) {
  const going = plans.filter((p) => p.status === 'going')
  const notGoing = plans.filter((p) => p.status === 'not_going')
  const pending = plans.filter((p) => p.status === 'pending')

  return (
    <div className="w-full max-w-md space-y-8">
      <Section title="Going" users={going} color="text-green-500" />
      <Section title="Not Going" users={notGoing} color="text-red-500" />
      <Section title="Maybe" users={pending} color="text-zinc-500" />
    </div>
  )
}

function Section({ title, users, color }: { title: string; users: any[]; color: string }) {
  if (users.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className={`text-sm font-bold uppercase tracking-wider ${color}`}>
        {title} ({users.length})
      </h3>
      <div className="grid gap-2">
        {users.map((plan, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800"
          >
            <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center overflow-hidden">
              {plan.profiles.avatar_url ? (
                <img src={plan.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-zinc-500 font-bold">
                  {plan.profiles.full_name?.[0] || plan.profiles.email[0]}
                </span>
              )}
            </div>
            <span className="font-medium">
              {plan.profiles.full_name || plan.profiles.email.split('@')[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
