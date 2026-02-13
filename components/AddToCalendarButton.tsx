"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronDown, Download, ExternalLink } from "lucide-react";
import { Activity } from "@/types";
import {
  generateGoogleCalendarUrl,
  generateIcsFile,
} from "@/lib/calendar-utils";

interface AddToCalendarButtonProps {
  activity: Activity;
}

export default function AddToCalendarButton({
  activity,
}: AddToCalendarButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGoogleCalendar = () => {
    window.open(
      generateGoogleCalendarUrl(activity),
      "_blank",
      "noopener,noreferrer",
    );
    setIsOpen(false);
  };

  const handleIcsDownload = () => {
    const icsContent = generateIcsFile(activity);
    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${activity.title.replace(/\s+/g, "_")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 px-4 py-2 rounded-xl text-xs font-bold transition-colors border border-zinc-200 dark:border-zinc-700"
      >
        <Calendar size={14} />
        <span>Afegir al Calendari</span>
        <ChevronDown
          size={14}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 rounded-2xl bg-white dark:bg-zinc-900 shadow-xl border border-zinc-100 dark:border-zinc-800 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleGoogleCalendar();
            }}
            className="w-full flex items-center justify-between px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors border-b border-zinc-50 dark:border-zinc-800"
          >
            <div className="flex items-center gap-3">
              <span className="text-blue-500">G</span>
              <span>Google Calendar</span>
            </div>
            <ExternalLink size={14} className="text-zinc-400" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleIcsDownload();
            }}
            className="w-full flex items-center justify-between px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Download size={16} className="text-zinc-500" />
              <span>Apple / Outlook / iOS</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
