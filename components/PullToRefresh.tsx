'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function PullToRefresh() {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const startY = useRef(0)
  const isPulling = useRef(false)

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Only start pulling if we are at the absolute top
      if (window.scrollY <= 0) {
        startY.current = e.touches[0].pageY
        isPulling.current = true
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current || isRefreshing) return

      const currentY = e.touches[0].pageY
      const diff = currentY - startY.current

      if (diff > 0 && window.scrollY <= 0) {
        // Apply resistance (logarithmic-like feel)
        const distance = Math.pow(diff, 0.85)
        setPullDistance(Math.min(distance, 100))
        
        // Prevent browser's native bounce/refresh
        if (e.cancelable) e.preventDefault()
      } else {
        isPulling.current = false
        setPullDistance(0)
      }
    }

    const handleTouchEnd = () => {
      if (!isPulling.current) return
      isPulling.current = false

      if (pullDistance > 70) {
        triggerRefresh()
      } else {
        setPullDistance(0)
      }
    }

    const triggerRefresh = () => {
      setIsRefreshing(true)
      setPullDistance(60) // Stay at "loading" position
      
      router.refresh()
      
      // Keep visible for at least 1s for better feedback
      setTimeout(() => {
        setIsRefreshing(false)
        setPullDistance(0)
      }, 1000)
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [pullDistance, isRefreshing, router])

  if (pullDistance <= 0 && !isRefreshing) return null

  return (
    <div 
      className="fixed top-0 left-0 w-full flex justify-center z-[9999] pointer-events-none"
      style={{ 
        transform: `translateY(${pullDistance - 50}px)`,
        opacity: Math.min(pullDistance / 60, 1),
        transition: isPulling.current ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0, 0, 1), opacity 0.2s'
      }}
    >
      <div className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 p-2.5 rounded-full shadow-2xl border border-white/10 dark:border-black/10">
        <Loader2 
          size={22} 
          className={isRefreshing ? 'animate-spin' : ''} 
          style={{ 
            transform: isRefreshing ? undefined : `rotate(${pullDistance * 4}deg)` 
          }} 
        />
      </div>
    </div>
  )
}