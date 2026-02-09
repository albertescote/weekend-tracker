import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This would be called by a Vercel Cron Job
// https://vercel.com/docs/cron-jobs
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Get all profiles with onesignal_id
  const { data: profiles } = await supabase
    .from('profiles')
    .select('onesignal_id')
    .not('onesignal_id', 'is', null)

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ message: 'No users to notify' })
  }

  const playerIds = profiles.map(p => p.onesignal_id)

  // 2. Send OneSignal Notification
  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`
    },
    body: JSON.stringify({
      app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
      include_player_ids: playerIds,
      contents: { 
        en: "Vens a Valls aquest cap de setmana? 🏡 Actualitza el teu estat ara!",
        ca: "Vens a Valls aquest cap de setmana? 🏡 Actualitza el teu estat ara!" 
      },
      headings: { 
        en: "WEEKEND 🏡",
        ca: "WEEKEND 🏡"
      },
      url: "https://weekend-tracker-five.vercel.app"
    })
  })

  const result = await response.json()

  return NextResponse.json({ result })
}