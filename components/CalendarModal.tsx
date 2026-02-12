"use client";

import { useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isFriday,
  isBefore,
  startOfToday,
} from "date-fns";
import { ca } from "date-fns/locale";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface Props {
  onSelect: (date: Date) => void;
  onClose: () => void;
  selectedDate: Date;
}

export default function CalendarModal({
  onSelect,
  onClose,
  selectedDate,
}: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = startOfToday();

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);

  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ["DL", "DT", "DC", "DJ", "DV", "DS", "DG"];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-[360px] rounded-[2.5rem] shadow-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 flex flex-col">
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-zinc-50 dark:border-zinc-800">
          <h3 className="font-black text-xl tracking-tight text-zinc-950 dark:text-white">
            Tria un cap de setmana
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Month Selector */}
        <div className="px-6 py-4 flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="font-bold text-sm uppercase tracking-widest text-zinc-500">
            {format(currentMonth, "MMMM yyyy", { locale: ca })}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Calendar Grid Container */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-7 w-full mb-4">
            {weekDays.map((d, i) => (
              <span
                key={i}
                className="text-[10px] font-black text-zinc-300 dark:text-zinc-600 text-center"
              >
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 w-full">
            {calendarDays.map((day, idx) => {
              const selectable = isFriday(day) && !isBefore(day, today);
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, monthStart);

              return (
                <div
                  key={idx}
                  className="aspect-square flex items-center justify-center"
                >
                  {isCurrentMonth ? (
                    <button
                      disabled={!selectable}
                      onClick={() => onSelect(day)}
                      className={`
                        w-full h-full rounded-xl flex items-center justify-center text-sm transition-all
                        ${
                          selectable
                            ? "font-bold text-zinc-900 dark:text-zinc-100 hover:bg-blue-50 dark:hover:bg-blue-900/20 ring-1 ring-inset ring-blue-500/10"
                            : "text-zinc-300 dark:text-zinc-700 cursor-not-allowed opacity-40"
                        }
                        ${isSelected ? "bg-blue-500 text-white shadow-lg scale-110 ring-0 !text-white" : ""}
                      `}
                    >
                      {format(day, "d")}
                    </button>
                  ) : (
                    <div className="w-full h-full" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 text-[9px] text-zinc-400 font-bold uppercase tracking-[0.2em] text-center border-t border-zinc-100 dark:border-zinc-800">
          El divendres marca l&apos;inici del cap de setmana
        </div>
      </div>
    </div>
  );
}
