import { createClient } from '@/lib/supabase/server'
import { getUpcomingFriday, formatDbDate } from '@/lib/utils'
import VotingSection from '@/components/VotingSection'
import AttendanceList from '@/components/AttendanceList'
import { format } from 'date-fns'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const upcomingFriday = getUpcomingFriday()
  const formattedDate = formatDbDate(upcomingFriday)
  const displayDate = format(upcomingFriday, 'EEEE, MMMM do')

  // Fetch all plans for this weekend
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
    .eq('weekend_date', formattedDate)

  // Fetch current user's status
  let userStatus: 'going' | 'not_going' | 'pending' = 'pending'
  if (user) {
    const { data: userPlan } = await supabase
      .from('weekend_plans')
      .select('status')
      .eq('user_id', user.id)
      .eq('weekend_date', formattedDate)
      .single()
    
    if (userPlan) {
      userStatus = userPlan.status as any
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 p-6 flex flex-col items-center gap-12">
      <header className="text-center space-y-2 mt-8">
        <h1 className="text-4xl font-black tracking-tight">Weekend Tracker</h1>
        <p className="text-zinc-500 font-medium">{displayDate}</p>
      </header>

      {!user ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-lg">Please sign in to track your weekend.</p>
          <a
            href="/login"
            className="px-8 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full font-bold transition-transform hover:scale-105"
          >
            Sign In
          </a>
        </div>
      ) : (
        <>
          <VotingSection 
            userId={user.id} 
            weekendDate={formattedDate} 
            initialStatus={userStatus} 
          />
          
          <AttendanceList plans={plans || []} />
        </>
      )}

      <footer className="mt-auto py-8 text-zinc-400 text-sm">
        Built for the weekend squad.
      </footer>
    </main>
  )
}
