"use client";

import { useOptimistic, useTransition, useState } from "react";
import {
  updateActivityParticipation,
} from "@/app/actions/activities";
import { Users, Clock, UserPlus } from "lucide-react";
import { Activity } from "@/types";
import ActivityDetailsModal from "./ActivityDetailsModal";

export default function ActivityCard({
  activity,
  currentUserId,
}: {
  activity: Activity;
  currentUserId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const participants = activity.activity_participants || [];
  const userParticipation = participants.find(
    (p) => p.user_id === currentUserId,
  );
  const isJoined = !!userParticipation;

  const [optimisticParticipants, setOptimisticParticipants] = useOptimistic(
    participants,
    (
      state,
      action:
        | { type: "toggle"; isJoining: boolean }
        | { type: "plus_one"; count: number },
    ) => {
      if (action.type === "toggle") {
        if (action.isJoining) {
          return [
            ...state,
            {
              user_id: currentUserId,
              activity_id: activity.id,
              additional_participants: 0,
              profiles: {
                full_name: "Tu",
                avatar_url: null,
                email: "",
                id: currentUserId,
                updated_at: new Date().toISOString(),
              },
            },
          ];
        }
        return state.filter((p) => p.user_id !== currentUserId);
      }
      if (action.type === "plus_one") {
        return state.map((p) =>
          p.user_id === currentUserId
            ? { ...p, additional_participants: action.count }
            : p,
        );
      }
      return state;
    },
  );

  const hasPlusOne =
    optimisticParticipants.find((p) => p.user_id === currentUserId)
      ?.additional_participants === 1;

  const handleToggle = async () => {
    const nextJoining = !isJoined;
    startTransition(async () => {
      setOptimisticParticipants({ type: "toggle", isJoining: nextJoining });
      await updateActivityParticipation(activity.id, nextJoining);
    });
  };

  const handleTogglePlusOne = async () => {
    const nextPlusOne = hasPlusOne ? 0 : 1;
    startTransition(async () => {
      setOptimisticParticipants({ type: "plus_one", count: nextPlusOne });
      await updateActivityParticipation(activity.id, true, nextPlusOne);
    });
  };

  const totalAttendance = optimisticParticipants.reduce(
    (acc, p) => acc + 1 + (p.additional_participants || 0),
    0,
  );

  const dayLabels: { [key: string]: string } = {
    divendres: "Div",
    dissabte: "Dis",
    diumenge: "Diu",
  };

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 rounded-3xl shadow-sm space-y-4 relative cursor-pointer hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
      >
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">
                {dayLabels[activity.day_of_week]}
              </span>
              <h4 className="font-bold text-lg leading-tight text-zinc-950 dark:text-white">
                {activity.title}
              </h4>
            </div>
            {activity.description && (
              <p className="text-sm text-zinc-500 leading-relaxed">
                {activity.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
            disabled={isPending}
            className={`flex-1 py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all ${
              isJoined
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md active:scale-95"
            }`}
          >
            {isJoined ? "SURT" : "APUNTA'T"}
          </button>
          {isJoined && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleTogglePlusOne();
              }}
              disabled={isPending}
              className={`flex-shrink-0 px-4 flex items-center justify-center rounded-2xl transition-all ${
                hasPlusOne
                  ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              }`}
              title={hasPlusOne ? "Treure +1" : "Afegir +1"}
            >
              <UserPlus size={18} />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-zinc-50 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {optimisticParticipants.map((p, i) => (
                <div key={i} className="relative">
                  <div
                    className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 border-2 border-white dark:border-zinc-900 flex items-center justify-center overflow-hidden"
                    title={p.profiles?.full_name || p.profiles?.email}
                  >
                    {p.profiles?.avatar_url ? (
                      <img
                        src={p.profiles.avatar_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] font-bold uppercase">
                        {p.profiles?.full_name?.[0] ||
                          p.profiles?.email?.[0] ||
                          "?"}
                      </span>
                    )}
                  </div>
                  {p.additional_participants > 0 && (
                    <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white dark:border-zinc-900">
                      +{p.additional_participants}
                    </div>
                  )}
                </div>
              ))}
              {optimisticParticipants.length === 0 && (
                <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1 uppercase tracking-widest">
                  <Users size={12} /> Ningú encara
                </span>
              )}
            </div>
            {totalAttendance > 0 && (
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800/50 px-2 py-0.5 rounded-md">
                {totalAttendance}{" "}
                {totalAttendance === 1 ? "Persona" : "Persones"}
              </span>
            )}
          </div>

          {activity.start_time && (
            <div className="flex items-center gap-1 text-zinc-400">
              <Clock size={12} />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {activity.start_time}
              </span>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <ActivityDetailsModal
          activity={activity}
          participants={optimisticParticipants}
          onClose={() => setIsModalOpen(false)}
          onToggleParticipation={handleToggle}
          onTogglePlusOne={handleTogglePlusOne}
          isJoined={isJoined}
          hasPlusOne={hasPlusOne}
          isPending={isPending}
          totalAttendance={totalAttendance}
          currentUserId={currentUserId}
        />
      )}
    </>
  );
}
