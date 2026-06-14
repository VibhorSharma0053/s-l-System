import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HolographicPanel from '../components/shared/HolographicPanel'
import GlowingButton from '../components/shared/GlowingButton'
import { useSystem } from '../context/SystemContext'
import { useNotifications } from '../context/NotificationContext'
import { NOTIFICATION_TYPES } from '../utils/constants'

import api from '../utils/api'

export default function ShopPage() {
  const { playerData, purchaseItem } = useSystem()
  const { addNotification } = useNotifications()
  const [filter, setFilter] = useState('all')
  const [purchaseAnim, setPurchaseAnim] = useState(null)
  const [shopItems, setShopItems] = useState([])
  const [loading, setLoading] = useState(false)

  const gold = playerData.quest_points || 0

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const { data } = await api.get('/v1/shop')
        setShopItems(data)
      } catch (err) {
        console.error('Fetch shop error:', err)
      }
    }
    fetchShop()
  }, [])

  const categories = ['all', 'consumable', 'weapon', 'armor', 'book', 'scroll']
  const filtered = filter === 'all'
    ? shopItems
    : shopItems.filter((i) => i.type === filter)

  const handlePurchase = async (item) => {
    if (gold < item.price) {
      addNotification(NOTIFICATION_TYPES.SYSTEM, 'Not enough Quest Points!')
      return
    }
    if (playerData.level < item.level_req) {
      addNotification(NOTIFICATION_TYPES.SYSTEM, `Requires Level ${item.level_req}!`)
      return
    }
    
    setLoading(true)
    try {
      await purchaseItem(item.id, 1)
      setPurchaseAnim(item.id)
      setTimeout(() => setPurchaseAnim(null), 1000)
      addNotification(NOTIFICATION_TYPES.SYSTEM, `Purchased ${item.name}!`)
    } catch (err) {
      addNotification(NOTIFICATION_TYPES.SYSTEM, err.response?.data?.detail || 'Purchase failed')
    }
    setLoading(false)
  }

  return (
    <div className="py-4">
      <HolographicPanel title="System Shop" icon="◇">
        {/* Gold Display */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1 text-xs font-bold tracking-wider uppercase rounded border transition-all ${
                  filter === cat
                    ? 'border-sl-blue/50 bg-sl-blue/10 text-sl-blue'
                    : 'border-sl-panel-border text-sl-text-dim hover:text-sl-text'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-sl-darker-blue/80 border border-sl-blue/40 rounded shadow-[0_0_15px_rgba(0,168,255,0.2)]">
            <span className="text-sl-text-dim text-xs tracking-wider">BALANCE:</span>
            <span className="text-sl-yellow font-[Orbitron] tracking-widest text-lg">
              {gold} QP
            </span>
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence>
            {filtered.map((item, i) => {
              const canAfford = gold >= item.price
              const meetsLevel = playerData.level >= item.level_req

              return (
                <motion.div
                  key={item.id}
                  className={`p-4 rounded border transition-all ${
                    purchaseAnim === item.id
                      ? 'border-sl-gold/60 bg-sl-gold/10 sl-level-up'
                      : 'border-sl-panel-border bg-sl-darker-blue/50 hover:border-sl-blue/40'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{item.icon}</span>
                    <div>
                      <h4 className="text-sm font-bold tracking-wider text-sl-text">{item.name}</h4>
                      <span className="text-[10px] text-sl-text-dim uppercase">{item.type}</span>
                    </div>
                  </div>
                  <p className="text-xs text-sl-text-dim mb-3">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className={`text-sm font-bold ${canAfford ? 'text-sl-yellow' : 'text-sl-red'}`}>
                        {item.price} QP
                      </span>
                    </div>
                    <GlowingButton
                      size="sm"
                      variant={canAfford && meetsLevel ? 'primary' : 'danger'}
                      disabled={!canAfford || !meetsLevel || loading}
                      onClick={() => handlePurchase(item)}
                    >
                      {!meetsLevel ? `Lv.${item.level_req}` : canAfford ? 'BUY' : 'NO QP'}
                    </GlowingButton>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </HolographicPanel>
    </div>
  )
}
