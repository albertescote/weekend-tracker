"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendPushNotification } from "@/lib/onesignal";
import { getFormattedDayText, isUpcomingWeekend } from "@/lib/utils";
import { z } from "zod";
import { ActionResponse } from "@/types";

const CreateActivitySchema = z.object({
  title: z.string().min(1, "El títol és obligatori"),
  start_time: z.string().optional(),
  day_of_week: z.enum(["divendres", "dissabte", "diumenge"]),
  weekend_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().optional(),
});

export async function createActivity(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Sessió no iniciada" };

    const rawData = {
      title: formData.get("title"),
      start_time: formData.get("start_time"),
      day_of_week: formData.get("day_of_week"),
      weekend_date: formData.get("weekend_date"),
      description: formData.get("description"),
    };

    const validatedData = CreateActivitySchema.safeParse(rawData);
    if (!validatedData.success) {
      return { success: false, error: validatedData.error.issues[0].message };
    }

    const { title, start_time, day_of_week, weekend_date, description } =
      validatedData.data;

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    const { error } = await supabase.from("activities").insert({
      title,
      weekend_date,
      creator_id: user.id,
      start_time,
      day_of_week,
      description,
    });

    if (error) throw error;

    const name = profile?.full_name || profile?.email.split("@")[0] || "Algú";
    const dayText = getFormattedDayText(weekend_date, day_of_week);
    const isUpcoming = isUpcomingWeekend(weekend_date);

    sendPushNotification({
      headings: "Nou pla proposat! 📝",
      contents: `${name} ha proposat: ${title} ${isUpcoming ? "" : "pel"} ${dayText}. T'apuntes?`,
      date: weekend_date,
      excludedUserId: user.id,
    });

    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.error("Error creating activity:", e);
    return { success: false, error: "No s'ha pogut crear el pla" };
  }
}

const UpdateActivitySchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "El títol és obligatori"),
  start_time: z.string().optional().nullable(),
  day_of_week: z.enum(["divendres", "dissabte", "diumenge"]),
  description: z.string().optional().nullable(),
});

export async function updateActivity(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Sessió no iniciada" };

    const rawData = {
      id: formData.get("id"),
      title: formData.get("title"),
      start_time: formData.get("start_time"),
      day_of_week: formData.get("day_of_week"),
      description: formData.get("description"),
    };

    const validatedData = UpdateActivitySchema.safeParse(rawData);
    if (!validatedData.success) {
      return { success: false, error: validatedData.error.issues[0].message };
    }

    const { id, title, start_time, day_of_week, description } =
      validatedData.data;

    console.log("Updating activity:", { id, userId: user.id });

    const { data, error, status } = await supabase
      .from("activities")
      .update({
        title,
        start_time,
        day_of_week,
        description,
      })
      .eq("id", id)
      .eq("creator_id", user.id)
      .select();

    if (error) {
      console.error("Supabase update error:", error);
      return { success: false, error: error.message };
    }

    console.log("Supabase update response:", { status, data });

    if (!data || data.length === 0) {
      console.warn("No rows updated. Check if the activity ID and creator ID match.");
      return { success: false, error: "No s'ha trobat el pla o no en ets el creador" };
    }

    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.error("Error updating activity:", e);
    return { success: false, error: "No s'ha pogut actualitzar el pla" };
  }
}

export async function deleteActivity(
  activityId: string,
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Sessió no iniciada" };

    const { error } = await supabase
      .from("activities")
      .delete()
      .eq("id", activityId)
      .eq("creator_id", user.id);
    if (error) throw error;

    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.error("Error deleting activity:", e);
    return { success: false, error: "No s'ha pogut esborrar el pla" };
  }
}

export async function updateActivityParticipation(
  activityId: string,
  isJoining: boolean,
  additionalParticipants: number = 0,
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Sessió no iniciada" };

    if (isJoining) {
      const { error } = await supabase.from("activity_participants").upsert(
        {
          activity_id: activityId,
          user_id: user.id,
          additional_participants: additionalParticipants,
        },
        { onConflict: "activity_id, user_id" },
      );

      if (error) throw error;

      const [activityRes, profileRes] = await Promise.all([
        supabase
          .from("activities")
          .select("title, day_of_week, weekend_date")
          .eq("id", activityId)
          .single(),
        supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", user.id)
          .single(),
      ]);

      if (activityRes.data && profileRes.data) {
        const name =
          profileRes.data.full_name ||
          profileRes.data.email.split("@")[0] ||
          "Algú";
        const { title, day_of_week, weekend_date } = activityRes.data;
        const dayText = getFormattedDayText(weekend_date, day_of_week);
        const isUpcoming = isUpcomingWeekend(weekend_date);

        const guestText =
          additionalParticipants > 0 ? ` (+${additionalParticipants})` : "";

        sendPushNotification({
          headings: "Això s'anima!🚀",
          contents: `${name}${guestText} s'ha apuntat al pla "${title}" ${isUpcoming ? "per" : "pel"} ${dayText}.`,
          date: weekend_date,
          excludedUserId: user.id,
        });
      }
    } else {
      const { error } = await supabase
        .from("activity_participants")
        .delete()
        .eq("activity_id", activityId)
        .eq("user_id", user.id);
      if (error) throw error;
    }

    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.error("Error updating participation:", e);
    return {
      success: false,
      error: "No s'ha pogut actualitzar la participació",
    };
  }
}
