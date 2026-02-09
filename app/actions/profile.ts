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
