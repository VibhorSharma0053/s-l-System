import { useEffect } from 'react'
import { motion } from 'framer-motion'
import StatusPanel from '../components/status/StatusPanel'
import QuestPanel from '../components/quests/QuestPanel'
import PenaltyPanel from '../components/quests/PenaltyPanel'
import TimerDisplay from '../components/quests/TimerDisplay'
import { useSystem } from '../context/SystemContext'
import { useNotifications } from '../context/NotificationContext'

export default function Dashboard() {
  const { penaltyActive } = useSystem()
  const { requestPermission } = useNotifications()

  useEffect(() => {
    requestPermission()
  }, [requestPermission])

  return (
    <div className="py-4">
      {/* Penalty Overlay */}
      {penaltyActive && (
        <motion.div
          className="fixed inset-0 z-40 pointer-events-none sl-red-flash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column - Status */}
        <div className="lg:col-span-4 space-y-5">
          <StatusPanel />
          <TimerDisplay />
        </div>

        {/* Right Column - Quests */}
        <div className="lg:col-span-8">
          {penaltyActive ? <PenaltyPanel /> : <QuestPanel />}
        </div>
      </div>
    </div>
  )
}
