import { createContext, useContext, useState, useCallback } from 'react'
import { DEFAULT_USER, LEVEL_XP_FORMULA } from '../utils/constants'
import api from '../utils/api'

const SystemContext = createContext(null)

export function SystemProvider({ children }) {
  const [playerData, setPlayerData] = useState(DEFAULT_USER)
  const [dailyQuests, setDailyQuests] = useState([])
  const [penaltyActive, setPenaltyActive] = useState(false)
  const [timerEnd, setTimerEnd] = useState(null)

  const syncPlayerData = useCallback(async () => {
    try {
      const { data } = await api.get('/v1/user/profile')
      setPlayerData(data)
      setPenaltyActive(data.penalty_active || false)
    } catch (err) {
      console.error('Sync error:', err)
    }
  }, [])

  const processPenalty = useCallback(async (amount) => {
    try {
      const { data } = await api.post('/v1/quests/penalty', { amount })
      setPlayerData((prev) => ({
        ...prev,
        penalty_progress: data.progress
      }))
      
      if (data.cleared) {
        setPenaltyActive(false)
        await syncPlayerData() // Re-fetch to get restored stats
      }
      return data
    } catch (err) {
      console.error('Penalty error:', err)
      return null
    }
  }, [syncPlayerData])

  const allocateStat = useCallback(async (statName) => {
    if (playerData.remainingPoints <= 0) return false
    try {
      const { data } = await api.post('/v1/user/stats/allocate', { stat: statName })
      setPlayerData(data)
      return true
    } catch (err) {
      console.error('Allocate stat error:', err)
      return false
    }
  }, [playerData.remainingPoints])

  const toggleEquip = useCallback(async (itemId, equipState) => {
    try {
      const { data } = await api.post('/v1/inventory/equip', { item_id: itemId, equip: equipState })
      setPlayerData((prev) => ({ ...prev, inventory: data }))
      return true
    } catch (err) {
      console.error('Equip error:', err)
      return false
    }
  }, [])

  const useItem = useCallback(async (itemId) => {
    try {
      const { data } = await api.post(`/v1/inventory/use?item_id=${itemId}`)
      setPlayerData((prev) => ({ 
        ...prev, 
        inventory: data.inventory,
        hp: data.hp,
        mp: data.mp
      }))
      return true
    } catch (err) {
      console.error('Use item error:', err)
      return false
    }
  }, [])

  const purchaseItem = useCallback(async (itemId, quantity = 1) => {
    try {
      const { data } = await api.post('/v1/shop/purchase', { item_id: itemId, quantity })
      setPlayerData((prev) => ({
        ...prev,
        inventory: data.inventory,
        quest_points: data.quest_points
      }))
      return true
    } catch (err) {
      console.error('Purchase error:', err)
      throw err 
    }
  }, [])

  const selectJob = useCallback(async (jobId) => {
    try {
      const { data } = await api.post('/v1/jobs/select', { job_id: jobId })
      setPlayerData((prev) => ({ ...prev, job: data.new_job }))
      return data
    } catch (err) {
      console.error('Job select error:', err)
      throw err
    }
  }, [])

  const addXp = useCallback((amount) => {
    setPlayerData((prev) => {
      let newXp = prev.xp + amount
      let newLevel = prev.level
      let newPoints = prev.remainingPoints
      let newHp = prev.maxHp
      let newMp = prev.maxMp
      let leveledUp = false

      while (newXp >= LEVEL_XP_FORMULA(newLevel)) {
        newXp -= LEVEL_XP_FORMULA(newLevel)
        newLevel += 1
        newPoints += 5
        newHp += 20
        newMp += 10
        leveledUp = true
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        remainingPoints: newPoints,
        maxHp: newHp,
        maxMp: newMp,
        hp: leveledUp ? newHp : prev.hp,
        mp: leveledUp ? newMp : prev.mp,
        _leveledUp: leveledUp,
      }
    })
  }, [])

  const fetchDailyQuests = useCallback(async () => {
    try {
      const { data } = await api.get('/v1/quests/daily')
      setDailyQuests(data)
    } catch (err) {
      console.error('Fetch quests error:', err)
    }
  }, [])

  return (
    <SystemContext.Provider
      value={{
        playerData,
        setPlayerData,
        dailyQuests,
        setDailyQuests,
        penaltyActive,
        setPenaltyActive,
        timerEnd,
        setTimerEnd,
        syncPlayerData,
        allocateStat,
        addXp,
        fetchDailyQuests,
        processPenalty,
        toggleEquip,
        useItem,
        purchaseItem,
        selectJob,
      }}
    >
      {children}
    </SystemContext.Provider>
  )
}

export function useSystem() {
  const context = useContext(SystemContext)
  if (!context) throw new Error('useSystem must be used within SystemProvider')
  return context
}
