export interface Player {
  id: string
  username: string
  level: number
  experience: number
  health: number
  maxHealth: number
  mana: number
  maxMana: number
  x: number
  y: number
  velocityX: number
  velocityY: number
  direction: 'left' | 'right'
  state: PlayerState
  characterClass: CharacterClass
  equipment: Equipment
  inventory: InventoryItem[]
}

export interface Equipment {
  weapon?: WeaponItem
  armor?: ArmorItem
  accessories: AccessoryItem[]
}

export interface InventoryItem {
  id: string
  type: ItemType
  name: string
  quantity: number
  rarity: ItemRarity
  stats?: ItemStats
}

export interface WeaponItem extends InventoryItem {
  damage: number
  attackSpeed: number
  range: number
}

export interface ArmorItem extends InventoryItem {
  defense: number
  durability: number
}

export interface AccessoryItem extends InventoryItem {
  effect: string
}

export interface ItemStats {
  strength?: number
  dexterity?: number
  intelligence?: number
  vitality?: number
}

export type ItemType = 'weapon' | 'armor' | 'accessory' | 'consumable' | 'quest' | 'misc'
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type PlayerState = 'idle' | 'walking' | 'running' | 'jumping' | 'falling' | 'attacking' | 'casting' | 'dead'

export type CharacterClass = 'warrior' | 'mage' | 'archer' | 'thief'

export interface Monster {
  id: string
  type: MonsterType
  level: number
  health: number
  maxHealth: number
  x: number
  y: number
  state: MonsterState
  targetPlayerId?: string
}

export type MonsterType = 'slime' | 'goblin' | 'skeleton' | 'orc' | 'dragon'
export type MonsterState = 'idle' | 'patrolling' | 'chasing' | 'attacking' | 'dead'

// Remove GameRoom interface - not needed for single player

export interface GameMap {
  id: string
  name: string
  width: number
  height: number
  backgroundMusic: string
  platforms: Platform[]
  spawnPoints: SpawnPoint[]
  monsters: MonsterSpawn[]
  items: ItemSpawn[]
  portals: Portal[]
}

export interface Platform {
  x: number
  y: number
  width: number
  height: number
  type: 'solid' | 'jumpthrough' | 'moving'
  texture: string
}

export interface SpawnPoint {
  x: number
  y: number
  type: 'player' | 'monster'
}

export interface MonsterSpawn {
  x: number
  y: number
  monsterType: MonsterType
  level: number
  respawnTime: number
}

export interface ItemSpawn {
  x: number
  y: number
  itemId: string
  respawnTime: number
}

export interface Portal {
  x: number
  y: number
  width: number
  height: number
  targetMapId: string
  targetX: number
  targetY: number
}

export interface GameMessage {
  id: string
  message: string
  type: 'system' | 'combat'
}

export interface GameState {
  players: Record<string, Player>
  monsters: Record<string, Monster>
  currentMap: GameMap
  gameMessages: GameMessage[]
}

export interface InputState {
  left: boolean
  right: boolean
  up: boolean
  down: boolean
  jump: boolean
  attack: boolean
  skill1: boolean
  skill2: boolean
  skill3: boolean
  inventory: boolean
}

export interface CameraState {
  x: number
  y: number
  zoom: number
  followTarget?: string
}