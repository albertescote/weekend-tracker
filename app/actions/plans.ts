'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendPushNotification } from '@/lib/onesignal'

export async function updateStatus(
  userId: string,
  weekendDate: string,
  status: 'going' | 'not_going' | 'pending'
) {
  const supabase = await createClient()

  // Agafem el nom de l'usuari per la notificació
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

  if (error) {
    console.error('Error updating status:', error)
    throw new Error('Failed to update status')
  }

  // Enviem la notificació a la resta
  const name = profile?.full_name || profile?.email.split('@')[0] || 'Algu'
  const statusText = status === 'going' ? 've!' : status === 'not_going' ? 'no vindrà.' : 'no ho sap segur...'
  
  // No esperem a que s'enviï per no bloquejar la UI
  sendPushNotification({
    headings: 'Novetats al Weekend!',
    contents: `${name} ha dit que ${statusText}`,
    excludedUserId: userId
  })

  revalidatePath('/')
}