import { nextFriday, isFriday, startOfDay, addWeeks, format, addDays } from 'date-fns';
import { ca } from 'date-fns/locale';

export const HOMETOWN_COORDINATES = { lat: 41.2856, lng: 1.2504 };

export function getUpcomingFriday() {
  const now = new Date();
  if (isFriday(now)) return startOfDay(now);
  return nextFriday(now);
}

export function getNextWeekends(count = 10) {
  const firstFriday = getUpcomingFriday();
  return Array.from({ length: count }).map((_, i) => addWeeks(firstFriday, i));
}

export function formatDbDate(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

export async function getWeekendWeather(fridayDateStr: string) {
  const lat = HOMETOWN_COORDINATES.lat;
  const lng = HOMETOWN_COORDINATES.lng;

  const saturdayDateStr = format(addDays(new Date(fridayDateStr), 1), 'yyyy-MM-dd');

  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    const dayIndex = data.daily.time.indexOf(saturdayDateStr);

    if (dayIndex === -1) return null;

    return {
      maxTemp: Math.round(data.daily.temperature_2m_max[dayIndex]),
      minTemp: Math.round(data.daily.temperature_2m_min[dayIndex]),
      code: data.daily.weather_code[dayIndex]
    };
  } catch (e) {
    return null;
  }
}

export function getWeatherIcon(code: number) {
  if (code === 0 || code === 1) return '☀️';
  if (code === 2) return '⛅';
  if (code === 3) return '☁️';
  if (code <= 48) return '🌫️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌦️';
  return '⛈️';
}

export function getWeatherDescription(code: number) {
  if (code === 0) return 'Sol radiant';
  if (code === 1 || code === 2) return 'Cel clar';
  if (code === 3) return 'Nuvolat';
  if (code === 45 || code === 48) return 'Hi haurà boira';
  if (code >= 51 && code <= 55) return 'Plugim suau';
  if (code >= 61 && code <= 67) return 'Pluja';
  if (code >= 71 && code <= 77) return 'Neu';
  if (code >= 80 && code <= 82) return 'Possibles ruixats';
  if (code >= 95) return 'Risc de tempesta';
  return 'Temps variable';
}

export { ca };
