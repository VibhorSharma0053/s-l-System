import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HolographicPanel from '../components/shared/HolographicPanel'
import GlowingButton from '../components/shared/GlowingButton'
import { useSystem } from '../context/SystemContext'
import { useNotifications } from '../context/NotificationContext'
import { NOTIFICATION_TYPES } from '../utils/constants'
import api from '../utils/api'

export default function JobChangePage() {
  const { selectJob } = useSystem()
  const { addNotification } = useNotifications()
  
  const [jobData, setJobData] = useState({ is_unlocked: false, current_job: 'None', jobs: [] })
  const [selectedJob, setSelectedJob] = useState(null)
  const [loading, setLoading] = useState(false)
  const [advancementAnim, setAdvancementAnim] = useState(false)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await api.get('/v1/jobs')
        setJobData(data)
      } catch (err) {
        console.error('Fetch jobs error:', err)
      }
    }
    fetchJobs()
  }, [])

  const handleSelectJob = async () => {
    if (!selectedJob) return
    setLoading(true)
    try {
      const data = await selectJob(selectedJob.id)
      
      // Trigger dramatic full-screen flash animation
      setAdvancementAnim(true)
      setTimeout(() => setAdvancementAnim(false), 2000)
      
      addNotification(NOTIFICATION_TYPES.SYSTEM, data.message)
      setJobData(prev => ({ ...prev, current_job: data.new_job }))
    } catch (err) {
      addNotification(
        NOTIFICATION_TYPES.PENALTY, 
        err.response?.data?.detail || 'Advancement failed.'
      )
    }
    setLoading(false)
  }

  if (!jobData.is_unlocked) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <motion.div 
          className="text-6xl mb-6 opacity-50"
          animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          🔒
        </motion.div>
        <h2 className="text-2xl font-[Orbitron] text-sl-red sl-glow-text-red tracking-widest mb-4">
          JOB CHANGE QUEST LOCKED
        </h2>
        <p className="text-sl-text-dim max-w-md">
          You have not reached the required level to undertake the Job Change Quest.
          Reach Level 10 to unlock this feature.
        </p>
      </div>
    )
  }

  return (
    <div className="py-4 relative">
      {/* Full screen flash effect upon advancement */}
      <AnimatePresence>
        {advancementAnim && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center bg-black/80"
          >
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [1, 1.5], opacity: [1, 0] }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at center, ${selectedJob?.color || '#00a8ff'} 0%, transparent 70%)`
              }}
            />
            <h1 className="text-6xl md:text-8xl font-[Orbitron] tracking-widest text-white sl-text-glow z-10"
                style={{ textShadow: `0 0 30px ${selectedJob?.color || '#fff'}, 0 0 60px ${selectedJob?.color || '#fff'}` }}>
              ADVANCEMENT SUCCESS
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      <HolographicPanel title="Class Advancement" icon="👑">
        <div className="text-center mb-8">
          <p className="text-sm text-sl-text-dim uppercase tracking-widest mb-2">Current Class</p>
          <h2 className="text-3xl font-[Orbitron] text-sl-cyan sl-text-glow tracking-widest">
            {jobData.current_job.toUpperCase()}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {jobData.jobs.map((job) => {
            const isSelected = selectedJob?.id === job.id
            const isCurrent = jobData.current_job === job.name
            const isLocked = job.locked_reason !== null
            
            return (
              <motion.div
                key={job.id}
                onClick={() => !isCurrent && !isLocked && setSelectedJob(job)}
                className={`relative p-6 rounded border cursor-pointer flex flex-col items-center text-center transition-all overflow-hidden ${
                  isSelected
                    ? 'scale-105 shadow-2xl z-10'
                    : 'bg-sl-darker-blue/50 hover:bg-sl-blue/10'
                } ${isCurrent ? 'opacity-50 cursor-not-allowed border-sl-green/50' : ''} 
                  ${isLocked ? 'opacity-40 cursor-not-allowed border-sl-red/30' : ''}`}
                style={{
                  borderColor: isSelected ? job.color : (isCurrent ? '#22c55e' : (isLocked ? '#ef4444' : '#1e3a8a')),
                  boxShadow: isSelected ? `0 0 20px ${job.color}40, inset 0 0 20px ${job.color}10` : 'none'
                }}
              >
                {/* Background glow tint */}
                {isSelected && (
                  <div className="absolute inset-0 opacity-10" style={{ backgroundColor: job.color }} />
                )}

                {job.recommended && !isCurrent && (
                  <div className="absolute top-0 right-0 bg-sl-yellow text-black text-[10px] font-bold px-2 py-1 rounded-bl tracking-wider">
                    RECOMMENDED
                  </div>
                )}
                
                {isCurrent && (
                  <div className="absolute top-0 right-0 bg-sl-green text-black text-[10px] font-bold px-2 py-1 rounded-bl tracking-wider">
                    ACTIVE
                  </div>
                )}

                <div 
                  className="text-5xl mb-4 p-4 rounded-full border bg-sl-bg-dark relative z-10"
                  style={{ 
                    borderColor: `${job.color}50`, 
                    boxShadow: isSelected ? `0 0 15px ${job.color}` : 'none' 
                  }}
                >
                  {job.icon}
                </div>
                
                <h3 className="text-xl font-bold tracking-wider mb-2 relative z-10" style={{ color: job.color }}>
                  {job.name}
                </h3>
                
                <p className="text-xs text-sl-text-dim mb-4 min-h-[48px] relative z-10">
                  {job.description}
                </p>

                {isLocked ? (
                  <div className="text-[10px] text-sl-red bg-sl-red/10 px-2 py-1 rounded border border-sl-red/20 w-full relative z-10">
                    🔒 {job.locked_reason}
                  </div>
                ) : (
                  <div className="w-full text-left space-y-2 relative z-10">
                    <div className="text-[10px] text-sl-text-dim tracking-widest uppercase border-b border-sl-panel-border/50 pb-1">
                      Granted Abilities
                    </div>
                    <ul className="text-xs text-sl-cyan space-y-1">
                      {job.abilities.map(ab => (
                        <li key={ab} className="flex items-center gap-1">
                          <span style={{ color: job.color }}>▸</span> {ab}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        <div className="flex justify-center">
          <AnimatePresence>
            {selectedJob && jobData.current_job !== selectedJob.name && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-md"
              >
                <GlowingButton 
                  fullWidth 
                  onClick={handleSelectJob}
                  disabled={loading}
                  style={{
                    borderColor: selectedJob.color,
                    color: selectedJob.color,
                    boxShadow: `0 0 15px ${selectedJob.color}40, inset 0 0 10px ${selectedJob.color}20`
                  }}
                >
                  {loading ? 'ADVANCING...' : `ADVANCE TO ${selectedJob.name.toUpperCase()}`}
                </GlowingButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </HolographicPanel>
    </div>
  )
}
