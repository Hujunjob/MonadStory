import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { GameState, Player, Monster } from '../types/game'

interface GameContextType {
  gameState: GameState
  dispatch: React.Dispatch<GameAction>
}

type GameAction = 
  | { type: 'UPDATE_PLAYER'; payload: { playerId: string; player: Partial<Player> } }
  | { type: 'ADD_PLAYER'; payload: Player }
  | { type: 'REMOVE_PLAYER'; payload: string }
  | { type: 'UPDATE_MONSTER'; payload: { monsterId: string; monster: Partial<Monster> } }
  | { type: 'ADD_MONSTER'; payload: Monster }
  | { type: 'REMOVE_MONSTER'; payload: string }
  | { type: 'ADD_GAME_MESSAGE'; payload: { id: string; message: string; type: 'system' | 'combat' } }
  | { type: 'CLEAR_MESSAGES'; payload: void }
  | { type: 'RESET_GAME_STATE'; payload: void }

const initialGameState: GameState = {
  players: {},
  monsters: {},
  currentMap: {
    id: 'map1',
    name: 'Beginners Field',
    width: 2000,
    height: 800,
    backgroundMusic: 'bgm_field',
    platforms: [
      { x: 0, y: 700, width: 2000, height: 100, type: 'solid', texture: 'ground' },
      { x: 300, y: 600, width: 200, height: 20, type: 'jumpthrough', texture: 'platform' },
      { x: 700, y: 500, width: 200, height: 20, type: 'jumpthrough', texture: 'platform' },
      { x: 1100, y: 400, width: 200, height: 20, type: 'jumpthrough', texture: 'platform' },
      { x: 1500, y: 300, width: 300, height: 20, type: 'jumpthrough', texture: 'platform' },
    ],
    spawnPoints: [
      { x: 100, y: 600, type: 'player' },
    ],
    monsters: [
      { x: 500, y: 650, monsterType: 'slime', level: 1, respawnTime: 30000 },
      { x: 900, y: 650, monsterType: 'goblin', level: 2, respawnTime: 45000 },
      { x: 1300, y: 650, monsterType: 'skeleton', level: 3, respawnTime: 60000 },
    ],
    items: [],
    portals: [
      { x: 1800, y: 600, width: 100, height: 100, targetMapId: 'map2', targetX: 100, targetY: 600 }
    ]
  },
  gameMessages: []
}

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'UPDATE_PLAYER':
      return {
        ...state,
        players: {
          ...state.players,
          [action.payload.playerId]: {
            ...state.players[action.payload.playerId],
            ...action.payload.player
          }
        }
      }
    
    case 'ADD_PLAYER':
      return {
        ...state,
        players: {
          ...state.players,
          [action.payload.id]: action.payload
        }
      }
    
    case 'REMOVE_PLAYER':
      const { [action.payload]: removed, ...remainingPlayers } = state.players
      return {
        ...state,
        players: remainingPlayers
      }
    
    case 'UPDATE_MONSTER':
      return {
        ...state,
        monsters: {
          ...state.monsters,
          [action.payload.monsterId]: {
            ...state.monsters[action.payload.monsterId],
            ...action.payload.monster
          }
        }
      }
    
    case 'ADD_MONSTER':
      return {
        ...state,
        monsters: {
          ...state.monsters,
          [action.payload.id]: action.payload
        }
      }
    
    case 'REMOVE_MONSTER':
      const { [action.payload]: removedMonster, ...remainingMonsters } = state.monsters
      return {
        ...state,
        monsters: remainingMonsters
      }
    
    case 'ADD_GAME_MESSAGE':
      return {
        ...state,
        gameMessages: [...state.gameMessages.slice(-49), action.payload] // Keep last 50 messages
      }
    
    case 'CLEAR_MESSAGES':
      return {
        ...state,
        gameMessages: []
      }
    
    case 'RESET_GAME_STATE':
      return {
        ...initialGameState,
        gameMessages: [] // Clear game messages on reset
      }
    
    default:
      return state
  }
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState)

  return (
    <GameContext.Provider value={{ gameState, dispatch }}>
      {children}
    </GameContext.Provider>
  )
}

export const useGame = (): GameContextType => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}