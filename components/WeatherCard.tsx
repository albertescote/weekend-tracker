import { getWeekendWeather, getWeatherIcon, getWeatherDescription } from '@/lib/utils'
import { CloudOff, Thermometer } from 'lucide-react'

export default async function WeatherCard({ date }: { date: string }) {
  const weather = await getWeekendWeather(date)

  if (!weather) {
    return (
      <div className="bg-zinc-100 dark:bg-zinc-900/50 p-4 rounded-[2rem] border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-3 text-zinc-400">
        <CloudOff size={16} />
        <span className="text-[10px] font-black uppercase tracking-widest">Massa aviat per predir el temps</span>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 rounded-[2rem] shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-3xl">
          {getWeatherIcon(weather.code)}
        </div>
        <div>
          <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest">El temps a casa</p>
          <p className="text-xl font-black text-zinc-950 dark:text-white leading-tight">
            {getWeatherDescription(weather.code)}
          </p>
        </div>
      </div>
      <div className="text-right">
        <div className="flex items-center gap-1 justify-end text-zinc-950 dark:text-white">
          <Thermometer size={14} className="text-red-500" />
          <span className="text-2xl font-black">{weather.maxTemp}°</span>
        </div>
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Mínima de {weather.minTemp}°</p>
      </div>
    </div>
  )
}
