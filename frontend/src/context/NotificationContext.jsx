import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { NOTIFICATION_TYPES } from '../utils/constants'

const NotificationContext = createContext(null)

let notifId = 0

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const timeoutsRef = useRef({})

  const addNotification = useCallback((type, message, duration = 5000) => {
    const id = ++notifId
    const notification = {
      id,
      type,
      message,
      createdAt: Date.now(),
    }

    setNotifications((prev) => [...prev, notification])

    // Auto-remove after duration
    const timeout = setTimeout(() => {
      removeNotification(id)
    }, duration)

    timeoutsRef.current[id] = timeout

    // Play sound for certain types
    playNotificationSound(type)

    // Browser notification for warnings
    if (type === NOTIFICATION_TYPES.TIMER_WARNING || type === NOTIFICATION_TYPES.PENALTY) {
      sendBrowserNotification(message)
    }

    return id
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    if (timeoutsRef.current[id]) {
      clearTimeout(timeoutsRef.current[id])
      delete timeoutsRef.current[id]
    }
  }, [])

  const clearAll = useCallback(() => {
    Object.values(timeoutsRef.current).forEach(clearTimeout)
    timeoutsRef.current = {}
    setNotifications([])
  }, [])

  // Notification sound (Web Audio API)
  const playNotificationSound = (type) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)

      // Different tones for different types
      const frequencies = {
        [NOTIFICATION_TYPES.LEVEL_UP]: [523, 659, 784],      // C5-E5-G5 chord
        [NOTIFICATION_TYPES.QUEST_COMPLETE]: [440, 554],      // A4-C#5
        [NOTIFICATION_TYPES.PENALTY]: [220, 185],              // A3-F#3 (ominous)
        [NOTIFICATION_TYPES.HIDDEN_QUEST]: [659, 784, 988],   // E5-G5-B5
        default: [440],                                        // A4
      }

      const freqs = frequencies[type] || frequencies.default

      freqs.forEach((freq, i) => {
        const osc = audioCtx.createOscillator()
        const gain = audioCtx.createGain()
        osc.connect(gain)
        gain.connect(audioCtx.destination)
        osc.frequency.value = freq
        osc.type = type === NOTIFICATION_TYPES.PENALTY ? 'sawtooth' : 'sine'
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime + i * 0.15)
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.15 + 0.5)
        osc.start(audioCtx.currentTime + i * 0.15)
        osc.stop(audioCtx.currentTime + i * 0.15 + 0.5)
      })
    } catch (e) {
      // Audio not available
    }
  }

  const sendBrowserNotification = (message) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Solo Leveling System', {
        body: message,
        icon: '/vite.svg',
      })
    }
  }

  // Request browser notification permission
  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }, [])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearAll,
        requestPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) throw new Error('useNotifications must be used within NotificationProvider')
  return context
}
