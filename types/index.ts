export type ActionResponse = {
  success: boolean
  error?: string
}

export type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  email: string
  updated_at: string
}

export type Activity = {
  id: string
  created_at: string
  title: string
  description: string | null
  weekend_date: string
  day_of_week: 'divendres' | 'dissabte' | 'diumenge'
  start_time: string | null
  creator_id: string
  activity_participants?: ActivityParticipant[]
}

export type ActivityParticipant = {
  activity_id: string
  user_id: string
  profiles: Profile
}

export type WeekendPlan = {
  user_id: string
  weekend_date: string
  status: 'going' | 'not_going' | 'pending'
  comment?: string | null
  updated_at: string
}