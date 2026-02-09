import { createClient } from '@/lib/supabase/server'
import ActivityCard from './ActivityCard'
import NewActivityForm from './NewActivityForm'

export default async function ActivityBoard({ weekendDate, currentUserId }: { weekendDate: string, currentUserId: string }) {
  const supabase = await createClient()

  const { data: activities } = await supabase
    .from('activities')
    .select(`
      *,
      activity_participants (
        user_id,
        profiles (
          full_name,
          avatar_url,
          email
        )
      )
    `)
    .eq('weekend_date', weekendDate)
    .order('created_at', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        {activities?.map((activity) => (
          <ActivityCard 
            key={activity.id} 
            activity={activity as any} 
            currentUserId={currentUserId} 
          />
        ))}
      </div>

      <NewActivityForm weekendDate={weekendDate} />
    </div>
  )
}
