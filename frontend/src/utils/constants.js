// ===== GAME CONSTANTS =====

export const STATS = ['strength', 'agility', 'stamina', 'intelligence', 'perception']

export const STAT_ICONS = {
  strength: '⚔️',
  agility: '💨',
  stamina: '🛡️',
  intelligence: '🧠',
  perception: '👁️',
}

export const STAT_COLORS = {
  strength: '#ff4444',
  agility: '#00e5ff',
  stamina: '#22c55e',
  intelligence: '#a855f7',
  perception: '#fbbf24',
}

export const QUEST_DIFFICULTY = {
  E: { label: 'E-Rank', color: '#9ca3af' },
  D: { label: 'D-Rank', color: '#22c55e' },
  C: { label: 'C-Rank', color: '#3b82f6' },
  B: { label: 'B-Rank', color: '#a855f7' },
  A: { label: 'A-Rank', color: '#f59e0b' },
  S: { label: 'S-Rank', color: '#ef4444' },
}

export const JOBS = [
  { name: 'None', minLevel: 0, description: 'No job selected.' },
  { name: 'Fighter', minLevel: 10, description: 'A melee-focused warrior.' },
  { name: 'Assassin', minLevel: 10, description: 'A speed-focused rogue.' },
  { name: 'Mage', minLevel: 10, description: 'An intelligence-focused caster.' },
  { name: 'Necromancer', minLevel: 20, description: 'Commands the shadow army.' },
  { name: 'Shadow Monarch', minLevel: 50, description: 'The supreme ruler of shadows.' },
]

export const LEVEL_XP_FORMULA = (level) => level * 100

export const NOTIFICATION_TYPES = {
  LEVEL_UP: 'level_up',
  QUEST_COMPLETE: 'quest_complete',
  TIMER_WARNING: 'timer_warning',
  PENALTY: 'penalty',
  HIDDEN_QUEST: 'hidden_quest',
  PURCHASE: 'purchase',
  SKILL_UNLOCK: 'skill_unlock',
  INFO: 'info',
  SYSTEM: 'system',
}

export const NOTIFICATION_COLORS = {
  level_up: '#ffd700',
  quest_complete: '#00ff88',
  timer_warning: '#fbbf24',
  penalty: '#ff3333',
  hidden_quest: '#a855f7',
  purchase: '#00e5ff',
  skill_unlock: '#00a8ff',
  info: '#00a8ff',
  system: '#00e5ff',
}

export const DEFAULT_USER = {
  username: 'Hunter',
  level: 1,
  job: 'None',
  title: 'E-Rank Hunter',
  hp: 100,
  maxHp: 100,
  mp: 50,
  maxMp: 50,
  xp: 0,
  stats: {
    strength: 10,
    agility: 10,
    stamina: 10,
    intelligence: 10,
    perception: 10,
  },
  remainingPoints: 0,
  gold: 0,
  inventory: [],
  skills: [],
  penaltyActive: false,
}
