'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendPushNotification } from '@/lib/onesignal'
import { format, parseISO, addDays, isSameDay } from 'date-fns'
import { ca, getUpcomingFriday } from '@/lib/utils'
import { z } from 'zod'
import { ActionResponse } from '@/types'

const UpdateStatusSchema = z.object({
  userId: z.string().uuid(),
  weekendDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['going', 'not_going', 'pending']),
  comment: z.string().max(280).optional().nullable(),
})

export async function updateStatus(
  userId: string,
  weekendDate: string,
  status: 'going' | 'not_going' | 'pending',
  comment?: string | null
): Promise<ActionResponse> {
  try {
    const validatedData = UpdateStatusSchema.safeParse({ userId, weekendDate, status, comment })
    if (!validatedData.success) {
      return { success: false, error: 'Dades invàlides' }
    }

    const supabase = await createClient()

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', userId)
      .single()

    const { error } = await supabase
      .from('weekend_plans')
      .upsert(
        { 
          user_id: userId, 
          weekend_date: weekendDate, 
          status, 
          comment,
          updated_at: new Date().toISOString() 
        },
        { onConflict: 'user_id, weekend_date' }
      )

    if (error) throw error

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
      dateText = `el ${format(sat, 'd', { locale: ca })}-${format(sun, 'd', { locale: ca })} de ${format(anchorDate, 'MMMM', { locale: ca })}`
    }

    let statusAction = ''
    let heading = ''

    if (status === 'going') {
      statusAction = `anirà a Valls`
      heading = 'Fitxatge confirmat! ✅'
    } else if (status === 'not_going') {
      statusAction = `NO anirà a Valls`
      heading = 'Baixa d\'última hora ❌'
    } else {
      statusAction = `no sap si anirà a Valls`
      heading = 'Cal pressió de grup! 📢'
    }

    sendPushNotification({
      headings: heading,
      contents: `${name} ha dit que ${statusAction} ${dateText}!`,
      date: weekendDate,
      excludedUserId: userId
    })

    revalidatePath('/')
    return { success: true }
  } catch (e) {
    console.error('Error updating status:', e)
    return { success: false, error: 'No s\'ha pogut actualitzar l\'estat' }
  }
}
