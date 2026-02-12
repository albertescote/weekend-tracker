import { getWeekendWeather } from "@/lib/utils";
import { CloudOff } from "lucide-react";
import WeatherCardClient from "./WeatherCardClient";

export default async function WeatherCard({ date }: { date: string }) {
  const weatherData = await getWeekendWeather(date);

  if (!weatherData) {
    return (
      <div className="bg-zinc-100 dark:bg-zinc-900/50 p-4 rounded-[2rem] border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-3 text-zinc-400">
        <CloudOff size={16} />
        <span className="text-[10px] font-black uppercase tracking-widest">
          Massa aviat per predir el temps
        </span>
      </div>
    );
  }

  return <WeatherCardClient weatherData={weatherData} />;
}
