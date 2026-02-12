import { createClient } from "@/lib/supabase/server";
import ActivityCard from "./ActivityCard";
import NewActivityForm from "./NewActivityForm";
import { Activity } from "@/types";

export default async function ActivityBoard({
  weekendDate,
  currentUserId,
}: {
  weekendDate: string;
  currentUserId: string;
}) {
  const supabase = await createClient();

  // Ordenem per una lògica personalitzada de dies i després per hora
  const { data: activities } = await supabase
    .from("activities")
    .select(
      `
      *,
      activity_participants (
        user_id,
        additional_participants,
        profiles (
          full_name,
          avatar_url,
          email
        )
      )
    `,
    )
    .eq("weekend_date", weekendDate);

  // Ordenació manual per dies de la setmana i hora
  const dayOrder: { [key: string]: number } = {
    divendres: 1,
    dissabte: 2,
    diumenge: 3,
  };
  const sortedActivities = (activities as unknown as Activity[])?.sort(
    (a, b) => {
      if (dayOrder[a.day_of_week] !== dayOrder[b.day_of_week]) {
        return dayOrder[a.day_of_week] - dayOrder[b.day_of_week];
      }
      return (a.start_time || "").localeCompare(b.start_time || "");
    },
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        {sortedActivities?.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            currentUserId={currentUserId}
          />
        ))}
      </div>

      <NewActivityForm weekendDate={weekendDate} />
    </div>
  );
}
