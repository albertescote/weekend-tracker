import { Activity } from "@/types";
import { addDays, addHours, format, parseISO } from "date-fns";

export function getEventDates(activity: Activity) {
  const anchorDate = parseISO(activity.weekend_date);
  let eventDate = anchorDate;

  if (activity.day_of_week === "dissabte") eventDate = addDays(anchorDate, 1);
  if (activity.day_of_week === "diumenge") eventDate = addDays(anchorDate, 2);

  const startTime = activity.start_time || "10:00";
  const [hours, minutes] = startTime.split(":").map(Number);

  const startDate = new Date(eventDate);
  startDate.setHours(hours, minutes, 0, 0);

  const endDate = addHours(startDate, 2);

  return { startDate, endDate };
}

export function formatIcsDate(date: Date) {
  return date.toISOString().replace(/-|:|\.\d+/g, "");
}

export function generateGoogleCalendarUrl(activity: Activity) {
  const { startDate, endDate } = getEventDates(activity);

  const fmt = (d: Date) => format(d, "yyyyMMdd'T'HHmmss");
  const dates = `${fmt(startDate)}/${fmt(endDate)}`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: activity.title + " [Komando]",
    details: activity.description || "",
    location: "Valls",
    dates: dates, // Local time
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function generateIcsFile(activity: Activity) {
  const { startDate, endDate } = getEventDates(activity);

  const title = activity.title.replace(/[\\,;]/g, (m) => `\\${m}`);
  const description = (activity.description || "").replace(
    /[\\,;]/g,
    (m) => `\\${m}`,
  );

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Konnecta//NONSGML Event//EN",
    "BEGIN:VEVENT",
    `UID:${activity.id}@konnecta.app`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(startDate)}`,
    `DTEND:${formatIcsDate(endDate)}`,
    `SUMMARY:${title} [Komando]`,
    `DESCRIPTION:${description}`,
    "LOCATION:Valls",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return icsLines.join("\r\n");
}
