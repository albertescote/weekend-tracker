import { createClient } from '@supabase/supabase-js'

export async function sendPushNotification({ 
  templateData,
  excludedUserId 
}: { 
  templateData: { name: string, answer: string, weekend: string }, 
  excludedUserId?: string 
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: profiles } = await supabase
    .from('profiles')
    .select('onesignal_id')
    .not('onesignal_id', 'is', null)
    .not('id', 'eq', excludedUserId || '')

  if (!profiles || profiles.length === 0) return

  const playerIds = profiles.map(p => p.onesignal_id)

  try {
    await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`
      },
      body: JSON.stringify({
        app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        include_player_ids: playerIds,
        template_id: process.env.ONESIGNAL_TEMPLATE_ID, // ID de la plantilla de OneSignal
        data: templateData, // Passem les variables per si les vols usar en filtres
        contents: { 
          // OneSignal permet usar {{variable}} en la plantilla que es mapegen des d'aquí
          en: `${templateData.name} ${templateData.answer} ${templateData.weekend}`,
          ca: `${templateData.name} ${templateData.answer} ${templateData.weekend}`
        }
      })
    })
  } catch (e) {
    console.error('Error enviant notificació:', e)
  }
}