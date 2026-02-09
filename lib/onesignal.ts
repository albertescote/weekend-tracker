import { createClient } from '@supabase/supabase-js'

export async function sendPushNotification({ 
  headings, 
  contents, 
  excludedUserId 
}: { 
  headings: string, 
  contents: string, 
  excludedUserId?: string 
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Agafem tots els usuaris que tenen OneSignal ID, opcionalment excloent qui fa l'acció
  let query = supabase
    .from('profiles')
    .select('onesignal_id')
    .not('onesignal_id', 'is', null)

  if (excludedUserId) {
    query = query.not('id', 'eq', excludedUserId)
  }

  const { data: profiles } = await query

  if (!profiles || profiles.length === 0) return

  const playerIds = profiles.map(p => p.onesignal_id)

  // 2. Enviem a OneSignal
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
        headings: { en: headings, ca: headings },
        contents: { en: contents, ca: contents },
        url: "https://weekend-tracker-five.vercel.app"
      })
    })
  } catch (e) {
    console.error('Error enviant notificació:', e)
  }
}
