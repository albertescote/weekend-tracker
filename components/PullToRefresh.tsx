'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function PullToRefresh() {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [startY, setStartY] = useState(0)

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        setStartY(e.touches[0].pageY)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (window.scrollY === 0 && !isRefreshing) {
        const currentY = e.touches[0].pageY
        const distance = currentY - startY
        if (distance > 0) {
          setPullDistance(Math.min(distance * 0.4, 80))
          if (distance > 50) {
            // Prevent bounce on iOS
            if (e.cancelable) e.preventDefault()
          }
        }
      }
    }

    const handleTouchEnd = async () => {
      if (pullDistance > 60) {
        setIsRefreshing(true)
        setPullDistance(40)
        router.refresh()
        // Artificial delay for better UX
        setTimeout(() => {
          setIsRefreshing(false)
          setPullDistance(0)
        }, 1000)
      } else {
        setPullDistance(0)
      }
    }

    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [startY, pullDistance, isRefreshing, router])

  if (pullDistance <= 0 && !isRefreshing) return null

  return (
    <div 
      className="fixed top-0 left-0 w-full flex justify-center z-[100] pointer-events-none"
      style={{ transform: `translateY(${pullDistance}px)` }}
    >
      <div className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 p-2 rounded-full shadow-xl">
        <Loader2 size={20} className={isRefreshing ? 'animate-spin' : ''} style={{ transform: `rotate(${pullDistance * 5}deg)` }} />
      </div>
    </div>
  )
}
