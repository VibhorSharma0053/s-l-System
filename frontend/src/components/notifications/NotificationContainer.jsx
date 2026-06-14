import { AnimatePresence, motion } from 'framer-motion'
import { useNotifications } from '../../context/NotificationContext'
import { NOTIFICATION_COLORS } from '../../utils/constants'

export default function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications()

  return (
    <div className="fixed top-20 right-4 z-[90] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => {
          const color = NOTIFICATION_COLORS[notif.type] || '#00a8ff'
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="pointer-events-auto sl-panel p-4 rounded cursor-pointer"
              style={{
                borderColor: `${color}55`,
                boxShadow: `0 0 20px ${color}22, inset 0 0 20px ${color}08`,
              }}
              onClick={() => removeNotification(notif.id)}
            >
              <div className="flex items-start gap-3">
                {/* Glow dot */}
                <div
                  className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                  style={{
                    backgroundColor: color,
                    boxShadow: `0 0 8px ${color}`,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-bold tracking-wider uppercase"
                    style={{ color }}
                  >
                    {notif.type.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs text-sl-text/80 mt-0.5 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
