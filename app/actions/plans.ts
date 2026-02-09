'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendPushNotification } from '@/lib/onesignal'
import { format, parseISO, addDays, isSameDay } from 'date-fns'
import { ca, getUpcomingFriday } from '@/lib/utils'

export async function updateStatus(
  userId: string,
  weekendDate: string,
  status: 'going' | 'not_going' | 'pending'
) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', userId)
    .single()

  const { error } = await supabase
    .from('weekend_plans')
    .upsert(
      { user_id: userId, weekend_date: weekendDate, status, updated_at: new Date().toISOString() },
      { onConflict: 'user_id, weekend_date' }
    )

  if (error) throw new Error('Failed to update status')

  const name = profile?.full_name || profile?.email.split('@')[0] || 'Algú'
  const upcomingFriday = getUpcomingFriday()
  const isUpcoming = isSameDay(parseISO(weekendDate), upcomingFriday)

  let dateText = ''
  if (isUpcoming) {
    dateText = 'aquest cap de setmana'
  } else {
    const anchorDate = parseISO(weekendDate)
    const sat = addDays(anchorDate, 1)
    const sun = addDays(anchorDate, 2)
    dateText = `el ${format(sat, 'd')}-${format(sun, 'd')} de ${format(anchorDate, 'MMMM', { locale: ca })}`
  }

  let statusAction = ''
  let funHeading = ''

  if (status === 'going') {
    statusAction = `anirà a Valls`
    funHeading = 'Un més al sac! 🍻'
  } else if (status === 'not_going') {
    statusAction = `NO anirà a Valls`
    funHeading = 'T\'enyorarem... 😢'
  } else {
    statusAction = `no sap si anirà a Valls`
    funHeading = 'Massa dubtes 🤔'
  }

  sendPushNotification({
    headings: funHeading,
    contents: `${name} ha dit que ${statusAction} ${dateText}!`,
    date: weekendDate,
    excludedUserId: userId
  })

  revalidatePath('/')
}
