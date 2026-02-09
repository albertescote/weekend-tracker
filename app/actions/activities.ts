'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendPushNotification } from '@/lib/onesignal'

export async function createActivity(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('full_name, email').eq('id', user.id).single()

  const title = formData.get('title') as string
  const start_time = formData.get('start_time') as string
  const day_of_week = formData.get('day_of_week') as string
  const weekend_date = formData.get('weekend_date') as string
  const description = formData.get('description') as string

  const { error } = await supabase
    .from('activities')
    .insert({ title, weekend_date, creator_id: user.id, start_time, day_of_week, description })

  if (error) throw error

  const name = profile?.full_name || profile?.email.split('@')[0] || 'Algú'

  sendPushNotification({
    headings: 'Nou pla proposat! 📝',
    contents: `${name} ha proposat: ${title} ${day_of_week}${start_time ? ` a les ${start_time}` : ''}. T'apuntes?`,
    date: weekend_date,
    excludedUserId: user.id
  })

  revalidatePath('/')
}

export async function deleteActivity(activityId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  await supabase.from('activities').delete().eq('id', activityId).eq('creator_id', user.id)
  revalidatePath('/')
}

export async function toggleActivityParticipation(activityId: string, isJoining: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  if (isJoining) await supabase.from('activity_participants').insert({ activity_id: activityId, user_id: user.id })
  else await supabase.from('activity_participants').delete().eq('activity_id', activityId).eq('user_id', user.id)

  revalidatePath('/')
}
