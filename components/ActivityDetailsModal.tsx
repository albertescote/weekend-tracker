"use client";

import { Clock, UserPlus, Users, X } from "lucide-react";
import Portal from "./Portal";
import { Activity, ActivityParticipant } from "@/types";

interface Props {
  activity: Activity;
  participants: ActivityParticipant[];
  onClose: () => void;
  onToggleParticipation: () => void;
  onTogglePlusOne: () => void;
  isJoined: boolean;
  hasPlusOne: boolean;
  isPending: boolean;
  totalAttendance: number;
}

export default function ActivityDetailsModal({
  activity,
  participants,
  onClose,
  onToggleParticipation,
  onTogglePlusOne,
  isJoined,
  hasPlusOne,
  isPending,
  totalAttendance,
}: Props) {
  const dayLabels: { [key: string]: string } = {
    divendres: "Divendres",
    dissabte: "Dissabte",
    diumenge: "Diumenge",
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
        <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 animate-in zoom-in-95 duration-200 my-auto flex flex-col">
          {/* Header */}
          <div className="relative py-10 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-zinc-900 dark:text-white rounded-full transition-colors z-10"
            >
              <X size={20} />
            </button>
            <div className="flex flex-col items-center gap-6 text-center">
              <span className="inline-block bg-blue-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                {dayLabels[activity.day_of_week]}
              </span>
              <h3 className="text-2xl font-black text-zinc-950 dark:text-white px-6 leading-tight">
                {activity.title}
              </h3>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Description & Info */}
            <div className="space-y-4">
              {activity.description ? (
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                  {activity.description}
                </p>
              ) : (
                <p className="text-zinc-400 dark:text-zinc-600 italic font-medium">
                  Sense descripció addicional.
                </p>
              )}

              <div className="flex flex-wrap gap-4 pt-2">
                {activity.start_time && (
                  <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <Clock size={16} className="text-zinc-400" />
                    <span className="text-xs font-black text-zinc-950 dark:text-white uppercase tracking-wider">
                      {activity.start_time}h
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <Users size={16} className="text-zinc-400" />
                  <span className="text-xs font-black text-zinc-950 dark:text-white uppercase tracking-wider">
                    {totalAttendance}{" "}
                    {totalAttendance === 1 ? "Persona" : "Persones"}
                  </span>
                </div>
              </div>
            </div>

            {/* Participants List */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] px-1">
                Qui s&apos;ha apuntat?
              </h4>{" "}
              <div className="grid grid-cols-1 gap-3">
                {participants.length > 0 ? (
                  participants.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 border-2 border-white dark:border-zinc-900 flex items-center justify-center overflow-hidden shrink-0">
                          {p.profiles?.avatar_url ? (
                            <img
                              src={p.profiles.avatar_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-bold uppercase">
                              {p.profiles?.full_name?.[0] ||
                                p.profiles?.email?.[0] ||
                                "?"}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-zinc-950 dark:text-white">
                            {p.profiles?.full_name ||
                              p.profiles?.email.split("@")[0]}
                          </span>
                          {p.additional_participants > 0 && (
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">
                              + {p.additional_participants}{" "}
                              {p.additional_participants === 1
                                ? "acompanyant"
                                : "acompanyants"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                      Encara ningú
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              {isJoined && (
                <button
                  onClick={onTogglePlusOne}
                  disabled={isPending}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[10px] tracking-widest transition-all ${
                    hasPlusOne
                      ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-transparent"
                  }`}
                >
                  <UserPlus size={16} />
                  {hasPlusOne ? "TREURE +1" : "AFEGIR +1"}
                </button>
              )}
              <button
                onClick={onToggleParticipation}
                disabled={isPending}
                className={`flex-[1.5] py-4 rounded-2xl font-black text-[10px] tracking-widest transition-all shadow-lg active:scale-95 ${
                  isJoined
                    ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40"
                    : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                }`}
              >
                {isJoined ? "SORTIR DEL PLA" : "APUNTA'T AL PLA"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
