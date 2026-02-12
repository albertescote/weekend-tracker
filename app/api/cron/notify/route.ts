import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUpcomingFriday, formatDbDate } from "@/lib/utils";

// This would be called by a Vercel Cron Job
// https://vercel.com/docs/cron-jobs
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const upcomingFriday = getUpcomingFriday();
  const dateStr = formatDbDate(upcomingFriday);

  // 1. Get all profiles with onesignal_id
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, onesignal_id")
    .not("onesignal_id", "is", null);

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ message: "No users to notify" });
  }

  // 2. Get plans for the upcoming weekend to filter out confirmed users
  const { data: plans } = await supabase
    .from("weekend_plans")
    .select("user_id, status")
    .eq("weekend_date", dateStr);

  // Create a map for quick lookup
  const planMap = new Map(plans?.map((p) => [p.user_id, p.status]));

  // 3. Filter player IDs: only include those who haven't voted or are 'pending'
  const playerIds = profiles
    .filter((p) => {
      const status = planMap.get(p.id);
      return !status || status === "pending";
    })
    .map((p) => p.onesignal_id);

  if (playerIds.length === 0) {
    return NextResponse.json({ message: "Everyone has already confirmed" });
  }

  // 4. Send OneSignal Notification
  const response = await fetch("https://onesignal.com/api/v1/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
    },
    body: JSON.stringify({
      app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
      include_player_ids: playerIds,
      contents: {
        en: "Vens a Valls aquest cap de setmana? Actualitza el teu estat ara!",
        ca: "Vens a Valls aquest cap de setmana? Actualitza el teu estat ara!",
      },
      headings: {
        en: "KONNECTA 🏡",
        ca: "KONNECTA 🏡",
      },
      url: `https://weekend-tracker-five.vercel.app?date=${dateStr}`,
    }),
  });

  const result = await response.json();

  return NextResponse.json({ result, notifiedCount: playerIds.length });
}
