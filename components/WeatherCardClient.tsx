'use client'

import { useState } from 'react'
import { Thermometer } from 'lucide-react'
import { getWeatherIcon, getWeatherDescription } from '@/lib/utils'
import WeatherModal from './WeatherModal'

interface WeatherDay {
  date: string
  maxTemp: number
  minTemp: number
  code: number
}

interface WeatherData {
  summary: WeatherDay | null | undefined
  details: (WeatherDay | null)[]
}

export default function WeatherCardClient({ weatherData }: { weatherData: WeatherData }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const weather = weatherData.summary

  if (!weather) return null

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="w-full text-left bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 rounded-[2rem] shadow-sm flex items-center justify-between hover:scale-[1.02] active:scale-[0.98] transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
            {getWeatherIcon(weather.code)}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest">El temps del cap de setmana</p>
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
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter whitespace-nowrap">
            Mínima de {weather.minTemp}°
          </p>
        </div>
      </button>

      {isModalOpen && (
        <WeatherModal 
          forecast={weatherData.details} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  )
}
