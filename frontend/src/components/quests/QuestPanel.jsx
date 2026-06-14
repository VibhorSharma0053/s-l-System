import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import HolographicPanel from '../shared/HolographicPanel'
import GlowingButton from '../shared/GlowingButton'
import { useSystem } from '../../context/SystemContext'
import { useNotifications } from '../../context/NotificationContext'
import { NOTIFICATION_TYPES, QUEST_DIFFICULTY } from '../../utils/constants'
import api from '../../utils/api'

export default function QuestPanel() {
  const { playerData, syncPlayerData } = useSystem()
  const { addNotification } = useNotifications()
  const [loadingIndex, setLoadingIndex] = useState(null)

  useEffect(() => {
    // Ping backend to trigger daily reset logic if needed
    api.get('/v1/quests/daily').then(() => syncPlayerData()).catch(console.error)
  }, [syncPlayerData])

  const dailyQuests = playerData.daily_quests || []

  const handleProgress = async (index, amount = 1) => {
    setLoadingIndex(index)
    try {
      const { data } = await api.post('/v1/quests/complete', { index, amount })
      
      // The backend returns updated quest info, and whether we leveled up
      if (data.quest.completed) {
        addNotification(
          NOTIFICATION_TYPES.QUEST_COMPLETE,
          `${data.quest.name} completed! +${data.added_xp} XP, +${data.added_qp || 10} QP`
        )
      } else {
        addNotification(NOTIFICATION_TYPES.SYSTEM, `${data.quest.name} progress updated.`)
      }
      
      if (data.leveled_up) {
        addNotification(NOTIFICATION_TYPES.LEVEL_UP, 'LEVEL UP!')
      }

      // Re-sync all data from the backend to guarantee absolute state consistency
      await syncPlayerData()

    } catch (err) {
      addNotification(NOTIFICATION_TYPES.PENALTY, err.response?.data?.detail || 'Failed to update quest')
    }
    setLoadingIndex(null)
  }

  // Fallback demo quests if none loaded from API yet (prevents empty crash)
  const quests = dailyQuests.length > 0 ? dailyQuests : [
    { name: 'Loading...', progress: 0, total: 100, difficulty: 'E', xpReward: 50, completed: false },
  ]

  return (
    <HolographicPanel title="Daily Quests" icon="⚔">
      <div className="space-y-4">
        {quests.map((quest, i) => {
          if (!quest) return null // Safety check for undefined elements
          
          const percent = (quest.progress / quest.total) * 100
          const diff = QUEST_DIFFICULTY[quest.difficulty] || QUEST_DIFFICULTY.E
          const isLoading = loadingIndex === i

          return (
            <motion.div
              key={i}
              className={`p-3 rounded border transition-all duration-300 ${
                quest.completed
                  ? 'border-sl-green/30 bg-sl-green/5'
                  : 'border-sl-panel-border bg-sl-darker-blue/50'
              }`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded border"
                    style={{
                      color: diff.color,
                      borderColor: `${diff.color}44`,
                      backgroundColor: `${diff.color}11`,
                    }}
                  >
                    {diff.label}
                  </span>
                  <span className={`text-sm font-semibold tracking-wider ${
                    quest.completed ? 'text-sl-green line-through' : 'text-sl-text'
                  }`}>
                    {quest.name}
                  </span>
                </div>
                <span className="text-xs text-sl-gold font-bold">+{quest.xpReward} XP</span>
              </div>

              {/* Progress bar */}
              <div className="sl-progress mb-2">
                <motion.div
                  className="sl-progress-fill"
                  style={{
                    width: `${percent}%`,
                    background: quest.completed
                      ? 'linear-gradient(90deg, rgba(0,255,136,0.6), rgba(0,255,136,0.8))'
                      : undefined,
                  }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-sl-text-dim tabular-nums">
                  {quest.progress} / {quest.total} {quest.unit || ''}
                </span>
                {!quest.completed && quest.name !== 'Loading...' && (
                  <div className="flex gap-2">
                    <GlowingButton size="sm" disabled={isLoading} onClick={() => handleProgress(i, 1)}>
                      +1
                    </GlowingButton>
                    <GlowingButton size="sm" disabled={isLoading} onClick={() => handleProgress(i, 10)}>
                      +10
                    </GlowingButton>
                    <GlowingButton
                      size="sm"
                      variant="success"
                      disabled={isLoading}
                      onClick={() => handleProgress(i, quest.total)}
                    >
                      DONE
                    </GlowingButton>
                  </div>
                )}
                {quest.completed && (
                  <span className="text-xs text-sl-green font-bold tracking-wider sl-glow-text" style={{ textShadow: '0 0 7px rgba(0,255,136,0.8)' }}>
                    ✓ COMPLETE
                  </span>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </HolographicPanel>
  )
}
