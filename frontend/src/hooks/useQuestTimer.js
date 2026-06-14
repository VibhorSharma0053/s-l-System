import { useState, useEffect, useRef } from 'react'
import { useNotifications } from '../context/NotificationContext'
import { NOTIFICATION_TYPES } from '../utils/constants'

export function useQuestTimer(durationHours = 24) {
  const { addNotification } = useNotifications()
  
  // Track warnings to prevent spam
  const warningsTracked = useRef({
    hour: false,
    halfHour: false,
    fiveMin: false
  })

  const calculateTimeLeft = () => {
    const now = new Date()
    const target = new Date()
    target.setHours(durationHours, 0, 0, 0) // Typically resets at midnight
    
    // If it's already past the target time, calculate for the next day
    if (now > target) {
      target.setDate(target.getDate() + 1)
    }
    
    const diff = target - now
    return {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      total: diff,
    }
  }

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  useEffect(() => {
    const interval = setInterval(() => {
      const current = calculateTimeLeft()
      setTimeLeft(current)

      // 1 Hour Warning
      if (current.total <= 3600000 && current.total > 3599000 && !warningsTracked.current.hour) {
        addNotification(NOTIFICATION_TYPES.TIMER_WARNING, 'WARNING: 1 Hour remaining for Daily Quests!', 10000)
        warningsTracked.current.hour = true
      }
      // 30 Minute Warning
      else if (current.total <= 1800000 && current.total > 1799000 && !warningsTracked.current.halfHour) {
        addNotification(NOTIFICATION_TYPES.TIMER_WARNING, 'WARNING: 30 Minutes remaining! Hurry!', 10000)
        warningsTracked.current.halfHour = true
      }
      // 5 Minute Warning
      else if (current.total <= 300000 && current.total > 299000 && !warningsTracked.current.fiveMin) {
        addNotification(NOTIFICATION_TYPES.PENALTY, 'CRITICAL: 5 Minutes remaining! Penalty Zone imminent!', 20000)
        warningsTracked.current.fiveMin = true
      }
      
      // Reset tracking when timer resets (e.g., after midnight)
      if (current.total > 86000000) {
        warningsTracked.current = { hour: false, halfHour: false, fiveMin: false }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [addNotification, durationHours])

  return {
    timeLeft,
    isUrgent: timeLeft.total < 3600000,
    isCritical: timeLeft.total < 300000
  }
}
