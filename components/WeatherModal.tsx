"use client";

import { X, Calendar } from "lucide-react";
import Portal from "./Portal";
import { getWeatherIcon, getWeatherDescription, ca } from "@/lib/utils";
import { format, parseISO } from "date-fns";

interface WeatherDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  code: number;
}

interface Props {
  forecast: (WeatherDay | null)[];
  onClose: () => void;
}

export default function WeatherModal({ forecast, onClose }: Props) {
  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
        <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 animate-in zoom-in-95 duration-200 my-auto flex flex-col">
          {/* Header */}
          <div className="p-6 flex items-center justify-between border-b border-zinc-50 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-blue-500" />
              <h3 className="font-black text-xl tracking-tight text-zinc-950 dark:text-white">
                Previsió detallada
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-600"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {forecast.map((day) => {
              if (!day) return null;

              const dateObj = parseISO(day.date);
              const dayName = format(dateObj, "EEEE", { locale: ca });
              const dayNum = format(dateObj, "d MMM", { locale: ca });

              return (
                <div
                  key={day.date}
                  className="bg-zinc-50 dark:bg-zinc-800/50 p-5 rounded-3xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{getWeatherIcon(day.code)}</div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest leading-none mb-1">
                        {dayName}
                      </p>
                      <p className="text-sm font-bold text-zinc-950 dark:text-white capitalize">
                        {dayNum}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        {getWeatherDescription(day.code)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end text-zinc-950 dark:text-white font-black text-lg">
                      <span>{day.maxTemp}°</span>
                    </div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                      {day.minTemp}°
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-6 pt-0 invisible h-0" />
        </div>
      </div>
    </Portal>
  );
}
