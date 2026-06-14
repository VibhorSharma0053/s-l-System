import QuestPanel from '../components/quests/QuestPanel'
import TimerDisplay from '../components/quests/TimerDisplay'
import HolographicPanel from '../components/shared/HolographicPanel'
import { motion } from 'framer-motion'

const HIDDEN_QUESTS = [
  { name: 'Shadow Extraction', trigger: '7-day streak', reward: 'Unlock Shadow Army', status: 'locked' },
  { name: 'Unyielding Will', trigger: 'Complete all quests 3 days in a row', reward: '+10 All Stats', status: 'locked' },
  { name: 'Iron Body', trigger: 'Allocate 50 points to Stamina', reward: 'Passive: Iron Skin', status: 'locked' },
]

export default function QuestsPage() {
  return (
    <div className="py-4 space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <QuestPanel />
        </div>
        <div>
          <TimerDisplay />
        </div>
      </div>

      {/* Hidden Quests Section */}
      <HolographicPanel title="Hidden Quests" icon="❓">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {HIDDEN_QUESTS.map((quest, i) => (
            <motion.div
              key={quest.name}
              className="p-3 rounded border border-sl-purple/20 bg-sl-purple/5 relative overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.15 }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-sl-purple/5 to-transparent" />
              <div className="relative z-10">
                <h4 className="text-sm font-bold text-sl-purple tracking-wider">???</h4>
                <p className="text-xs text-sl-text-dim mt-1">Trigger: {quest.trigger}</p>
                <p className="text-xs text-sl-gold mt-1">Reward: {quest.reward}</p>
                <span className="text-[10px] text-sl-text-dim/50 tracking-widest uppercase mt-2 block">
                  🔒 LOCKED
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </HolographicPanel>
    </div>
  )
}
