import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HolographicPanel from '../components/shared/HolographicPanel'
import GlowingButton from '../components/shared/GlowingButton'
import { useSystem } from '../context/SystemContext'
import { useNotifications } from '../context/NotificationContext'
import { NOTIFICATION_TYPES } from '../utils/constants'

const RARITY_COLORS = {
  E: '#9ca3af', D: '#22c55e', C: '#3b82f6', B: '#a855f7', A: '#f59e0b', S: '#ef4444',
}

export default function InventoryPage() {
  const { playerData, toggleEquip, useItem } = useSystem()
  const { addNotification } = useNotifications()
  
  const items = playerData.inventory || []
  const [selectedItem, setSelectedItem] = useState(null)

  const handleEquipToggle = async (item) => {
    const success = await toggleEquip(item.id, !item.equipped)
    if (success) {
      setSelectedItem((prev) => ({ ...prev, equipped: !prev.equipped }))
      addNotification(
        NOTIFICATION_TYPES.SYSTEM, 
        `${item.name} ${item.equipped ? 'unequipped' : 'equipped'}.`
      )
    }
  }

  const handleUseItem = async (item) => {
    const success = await useItem(item.id)
    if (success) {
      addNotification(NOTIFICATION_TYPES.SYSTEM, `Used ${item.name}.`)
      // Deselect if qty reached 0 and it was removed
      const remainingItem = items.find(i => i.id === item.id)
      if (!remainingItem || remainingItem.qty <= 1) {
        setSelectedItem(null)
      } else {
        setSelectedItem((prev) => ({ ...prev, qty: prev.qty - 1 }))
      }
    }
  }

  return (
    <div className="py-4 grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Inventory Grid */}
      <div className="lg:col-span-2">
        <HolographicPanel title="Inventory" icon="◰">
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {items.map((item) => (
              <motion.div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`relative aspect-square rounded border cursor-pointer flex flex-col items-center justify-center p-1 transition-all ${
                  selectedItem?.id === item.id
                    ? 'border-sl-blue/70 bg-sl-blue/10'
                    : 'border-sl-panel-border bg-sl-darker-blue/50 hover:border-sl-blue/40'
                } ${item.equipped ? 'ring-1 ring-sl-green/40' : ''}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-[9px] text-sl-text-dim text-center mt-0.5 leading-tight truncate w-full">
                  {item.name}
                </span>
                {item.qty && (
                  <span className="absolute top-0.5 right-1 text-[9px] text-sl-text font-bold">x{item.qty}</span>
                )}
                {/* Rarity indicator */}
                <div
                  className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: RARITY_COLORS[item.rarity] }}
                />
                {item.equipped && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] text-sl-green font-bold tracking-wider">
                    EQ
                  </div>
                )}
              </motion.div>
            ))}
            {/* Empty slots */}
            {Array.from({ length: Math.max(0, 24 - items.length) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="aspect-square rounded border border-sl-panel-border/30 bg-sl-darker-blue/20"
              />
            ))}
          </div>
        </HolographicPanel>
      </div>

      {/* Item Detail */}
      <div>
        <HolographicPanel title="Item Info" icon="◇">
          <AnimatePresence mode="wait">
            {selectedItem ? (
              <motion.div
                key={selectedItem.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <span className="text-5xl block mb-3">{selectedItem.icon}</span>
                <h3
                  className="text-lg font-bold tracking-wider"
                  style={{ color: RARITY_COLORS[selectedItem.rarity] }}
                >
                  {selectedItem.name}
                </h3>
                <span
                  className="text-xs font-bold tracking-widest"
                  style={{ color: RARITY_COLORS[selectedItem.rarity] }}
                >
                  {selectedItem.rarity}-RANK
                </span>
                <div className="mt-3 p-2 rounded bg-sl-darker-blue/50 border border-sl-panel-border">
                  <span className="text-xs text-sl-text-dim">Type: </span>
                  <span className="text-xs text-sl-text uppercase">{selectedItem.type}</span>
                </div>
                <div className="mt-2 p-2 rounded bg-sl-blue/5 border border-sl-blue/20">
                  <span className="text-xs text-sl-cyan font-bold">{selectedItem.stats}</span>
                </div>
                {selectedItem.type !== 'consumable' && (
                  <GlowingButton
                    variant={selectedItem.equipped ? 'danger' : 'primary'}
                    onClick={() => handleEquipToggle(selectedItem)}
                    className="mt-4"
                    fullWidth
                  >
                    {selectedItem.equipped ? 'UNEQUIP' : 'EQUIP'}
                  </GlowingButton>
                )}
                {selectedItem.type === 'consumable' && (
                  <GlowingButton onClick={() => handleUseItem(selectedItem)} variant="success" className="mt-4" fullWidth>
                    USE
                  </GlowingButton>
                )}
              </motion.div>
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-sl-text-dim text-center py-8"
              >
                Select an item to view details
              </motion.p>
            )}
          </AnimatePresence>
        </HolographicPanel>
      </div>
    </div>
  )
}
