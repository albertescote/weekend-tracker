'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateStatus(
  userId: string,
  weekendDate: string,
  status: 'going' | 'not_going' | 'pending'
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('weekend_plans')
    .upsert(
      { user_id: userId, weekend_date: weekendDate, status, updated_at: new Date().toISOString() },
      { onConflict: 'user_id, weekend_date' }
    )

  if (error) {
    console.error('Error updating status:', error)
    throw new Error('Failed to update status')
  }

  revalidatePath('/')
}
