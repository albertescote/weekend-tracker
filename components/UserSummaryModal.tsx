"use client";

import { useState, useEffect } from "react";
import { getUserStats } from "@/app/actions/profile";
import { X, Calendar, Loader2 } from "lucide-react";
import Portal from "./Portal";
import { Profile } from "@/types";
import { getNextWeekends, formatDbDate, ca } from "@/lib/utils";
import { format, parseISO } from "date-fns";

interface Props {
  profile: Profile;
  onClose: () => void;
}

export default function UserSummaryModal({ profile, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalVisits: number;
    upcomingPlans: { weekend_date: string; status: string }[];
  } | null>(null);
  const nextWeekends = getNextWeekends(5);

  useEffect(() => {
    async function loadStats() {
      const res = await getUserStats(profile.id);
      if (res.success && res.data) {
        setStats(res.data);
      }
      setLoading(false);
    }
    loadStats();
  }, [profile.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "going":
        return "bg-green-500";
      case "not_going":
        return "bg-red-500";
      case "pending":
        return "bg-zinc-500";
      default:
        return "bg-zinc-200 dark:bg-zinc-800";
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
          <div className="flex justify-end p-4">
            <button
              onClick={onClose}
              className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-8 pb-8 pt-2">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-zinc-200 dark:bg-zinc-700 border-4 border-white dark:border-zinc-900 shadow-xl overflow-hidden mb-6">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-black text-zinc-400 dark:text-zinc-500">
                    {(profile.full_name || profile.email)[0].toUpperCase()}
                  </div>
                )}
              </div>

              <h3 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white text-center leading-none">
                {profile.full_name || profile.email.split("@")[0]}
              </h3>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-3xl text-center border border-zinc-100 dark:border-zinc-800">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">
                  Visites totals
                </p>
                {loading ? (
                  <Loader2
                    size={16}
                    className="animate-spin mx-auto text-zinc-300"
                  />
                ) : (
                  <p className="text-2xl font-black text-zinc-950 dark:text-white">
                    {stats?.totalVisits || 0}
                  </p>
                )}
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-3xl text-center border border-zinc-100 dark:border-zinc-800">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">
                  Pròxima visita
                </p>
                {loading ? (
                  <Loader2
                    size={16}
                    className="animate-spin mx-auto text-zinc-300"
                  />
                ) : (
                  <p className="text-sm font-black text-zinc-950 dark:text-white">
                    {(() => {
                      const nextGoingPlan = stats?.upcomingPlans.find(
                        (p) => p.status === "going",
                      );
                      return nextGoingPlan
                        ? format(
                            parseISO(nextGoingPlan.weekend_date),
                            "d MMM",
                            {
                              locale: ca,
                            },
                          )
                        : "N/D";
                    })()}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                <Calendar size={12} /> Disponibilitat propers findes
              </h4>
              <div className="flex justify-between items-center gap-2 px-1">
                {nextWeekends.map((date, i) => {
                  const dateStr = formatDbDate(date);
                  const plan = stats?.upcomingPlans.find(
                    (p) => p.weekend_date === dateStr,
                  );
                  const status = plan?.status || "none";

                  return (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${getStatusColor(status)}`}
                      >
                        {status === "going" && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        )}
                      </div>
                      <span className="text-[9px] font-bold text-zinc-400 uppercase">
                        {format(date, "d/M")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
