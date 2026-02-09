'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createActivity(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const start_time = formData.get('start_time') as string
  const weekend_date = formData.get('weekend_date') as string

  const { error } = await supabase
    .from('activities')
    .insert({
      title,
      description,
      start_time,
      weekend_date,
      creator_id: user.id
    })

  if (error) throw error
  revalidatePath('/')
}

export async function deleteActivity(activityId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id', activityId)
    .eq('creator_id', user.id) // Double security check

  if (error) throw error
  revalidatePath('/')
}

export async function toggleActivityParticipation(activityId: string, isJoining: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  if (isJoining) {
    const { error } = await supabase
      .from('activity_participants')
      .insert({ activity_id: activityId, user_id: user.id })
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('activity_participants')
      .delete()
      .eq('activity_id', activityId)
      .eq('user_id', user.id)
    if (error) throw error
  }

  revalidatePath('/')
}
