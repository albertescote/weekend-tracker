import { createClient } from '@/lib/supabase/server'
import { getUpcomingFriday, formatDbDate, ca } from '@/lib/utils'
import VotingSection from '@/components/VotingSection'
import AttendanceList from '@/components/AttendanceList'
import WeekendSelector from '@/components/WeekendSelector'
import WeatherCard from '@/components/WeatherCard'
import HallOfFame from '@/components/HallOfFame'
import ThemeToggle from '@/components/ThemeToggle'
import ActivityBoard from '@/components/ActivityBoard'
import ProfileButton from '@/components/ProfileButton'
import PullToRefresh from '@/components/PullToRefresh'
import { format, parseISO, addDays } from 'date-fns'
import { Suspense } from 'react'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const params = await searchParams
  const selectedDateStr = (params.date as string) || formatDbDate(getUpcomingFriday())

  const anchorDate = parseISO(selectedDateStr)
  const sat = addDays(anchorDate, 1)
  const sun = addDays(anchorDate, 2)
  const displayDate = `${format(sat, "d 'de' MMM", { locale: ca })} - ${format(sun, "d 'de' MMM", { locale: ca })}`

  const [profileResponse, userPlanResponse] = user ? await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('weekend_plans').select('status').eq('user_id', user.id).eq('weekend_date', selectedDateStr).single()
  ]) : [{ data: null }, { data: null }]

  const profile = profileResponse.data
  const userPlan = userPlanResponse.data
  const userStatus: 'going' | 'not_going' | 'pending' = (userPlan?.status as any) || 'pending'

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center transition-colors duration-300 overflow-x-hidden">
      <PullToRefresh />

      {/* 1. TOP BAR (Sticky) */}
      <div className="w-full bg-background sticky top-0 z-40 px-6 pt-8 pb-6 border-b border-zinc-100 dark:border-zinc-800 text-zinc-950 dark:text-white">
        <header className="flex items-start justify-between w-full max-w-md mx-auto text-zinc-950 dark:text-white">
          <div className="flex flex-col">
            <h1 className="text-3xl font-black tracking-tighter leading-[0.85] text-zinc-950 dark:text-white flex flex-col">
              <span>KONNECTA</span>
            </h1>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-3">{displayDate}</p>
          </div>

          <div className="flex items-center gap-2 mt-1 text-zinc-950 dark:text-white">
            <ThemeToggle />
            {user && <ProfileButton user={user} profile={profile} />}
          </div>
        </header>
      </div>

      <div className="w-full max-w-md px-4 flex flex-col gap-6 pb-12 mt-10">

        {!user ? (
          <div className="flex flex-col items-center gap-4 text-center py-24">
            <p className="text-lg font-medium opacity-60">Connecta amb els amics.</p>
            <a
              href="/login"
              className="px-10 py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl font-black shadow-xl"
            >
              INICIA SESSIÓ
            </a>
          </div>
        ) : (
          <>
            {/* 2. DATE SELECTOR - Només es mostra si hi ha usuari */}
            <section>
              <WeekendSelector />
            </section>

            {/* 3. CONTEXTUAL WEATHER & VOTE */}
            <div className="flex flex-col gap-6">
              <Suspense fallback={<div className="h-24 w-full bg-background border border-zinc-100 dark:border-zinc-800 animate-pulse rounded-[2rem]" />}>
                <WeatherCard date={selectedDateStr} />
              </Suspense>

              <VotingSection
                key={selectedDateStr}
                userId={user.id}
                weekendDate={selectedDateStr}
                initialStatus={userStatus}
                displayDate={displayDate}
              />
            </div>

            {/* 4. ATTENDANCE */}
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400 px-2">Qui ve?</h3>
              <Suspense fallback={
                <div className="space-y-3">
                  <div className="h-16 w-full bg-background border border-zinc-100 dark:border-zinc-800 animate-pulse rounded-2xl" />
                  <div className="h-16 w-full bg-background border border-zinc-100 dark:border-zinc-800 animate-pulse rounded-2xl opacity-50" />
                </div>
              }>
                <AttendanceList weekendDate={selectedDateStr} />
              </Suspense>
            </div>

            <hr className="border-zinc-200 dark:border-zinc-800 mx-4" />

            {/* 5. ACTIVITIES */}
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400 px-2">Plans</h3>
              <Suspense fallback={<div className="h-24 w-full bg-background border border-zinc-100 dark:border-zinc-800 animate-pulse rounded-3xl" />}>
                <ActivityBoard weekendDate={selectedDateStr} currentUserId={user.id} />
              </Suspense>
            </div>

            <hr className="border-zinc-200 dark:border-zinc-800 mx-4" />

            {/* 6. GAMIFICATION */}
            <div className="pb-8">
              <Suspense fallback={<div className="h-40 w-full bg-background border border-zinc-100 dark:border-zinc-800 animate-pulse rounded-3xl" />}>
                <HallOfFame />
              </Suspense>
            </div>
          </>
        )}
      </div>

      <footer className="mt-auto py-12 text-zinc-400 text-[10px] font-bold uppercase tracking-widest text-center">
        KONNECTA v1.0
      </footer>
    </main>
  )
}
