'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { ActionResponse } from '@/types'

const UpdateProfileSchema = z.object({
  full_name: z.string().min(1, 'El nom és obligatori'),
  avatar_url: z.string().url().optional().or(z.literal('')),
})

export async function updateProfile(formData: FormData): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Sessió no iniciada' }

    const rawData = {
      full_name: formData.get('full_name'),
      avatar_url: formData.get('avatar_url'),
    }

    const validatedData = UpdateProfileSchema.safeParse(rawData)
    if (!validatedData.success) {
      return { success: false, error: validatedData.error.issues[0].message }
    }

    const { full_name, avatar_url } = validatedData.data

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name,
        avatar_url: avatar_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) throw error
    revalidatePath('/')
    return { success: true }
  } catch (e) {
    console.error('Error updating profile:', e)
    return { success: false, error: 'No s\'ha pogut actualitzar el perfil' }
  }
}

export async function getUserStats(userId: string) {
  try {
    const supabase = await createClient()

    // Count total 'going'
    const { count, error: countError } = await supabase
      .from('weekend_plans')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'going')

    if (countError) throw countError

    // Get next 5 weekends
    const { data: upcomingPlans, error: upcomingError } = await supabase
      .from('weekend_plans')
      .select('weekend_date, status')
      .eq('user_id', userId)
      .gte('weekend_date', new Date().toISOString().split('T')[0])
      .order('weekend_date', { ascending: true })
      .limit(5)

    if (upcomingError) throw upcomingError

    return {
      success: true,
      data: {
        totalVisits: count || 0,
        upcomingPlans: upcomingPlans || []
      }
    }
  } catch (e) {
    console.error('Error fetching user stats:', e)
    return { success: false, error: 'No s\'han pogut carregar les estadístiques' }
  }
}
