import React, { useState, useEffect } from 'react'
import { useGame } from './GameProvider'
import { Player } from '../types/game'

export const UIOverlay: React.FC = () => {
  const { gameState } = useGame()
  const [player, setPlayer] = useState<Player | null>(null)
  const [showInventory, setShowInventory] = useState(false)

  useEffect(() => {
    // Get player (should only be one in single player)
    const players = Object.values(gameState.players)
    if (players.length > 0) {
      setPlayer(players[0])
    }
  }, [gameState.players])

  // Remove chat functionality for single player

  const toggleInventory = () => {
    setShowInventory(!showInventory)
  }

  if (!player) {
    return (
      <div className="ui-overlay">
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="ui-overlay">
      {/* Health Bar */}
      <div className="health-bar">
        <div 
          className="health-fill" 
          style={{ width: `${(player.health / player.maxHealth) * 100}%` }}
        />
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          fontSize: '12px',
          fontWeight: 'bold',
          color: 'white',
          textShadow: '1px 1px 2px black'
        }}>
          {player.health}/{player.maxHealth}
        </div>
      </div>

      {/* Mana Bar */}
      <div className="mana-bar">
        <div 
          className="mana-fill" 
          style={{ width: `${(player.mana / player.maxMana) * 100}%` }}
        />
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          fontSize: '10px',
          fontWeight: 'bold',
          color: 'white',
          textShadow: '1px 1px 2px black'
        }}>
          {player.mana}/{player.maxMana}
        </div>
      </div>

      {/* Player Info */}
      <div className="player-info">
        <div>{player.username}</div>
        <div>Level {player.level}</div>
        <div>EXP: {player.experience}</div>
        <div>Class: {player.characterClass}</div>
      </div>

      {/* Game Messages */}
      <div className="message-box">
        <div style={{ maxHeight: '120px', overflowY: 'auto', marginBottom: '10px' }}>
          {gameState.gameMessages.map((msg) => (
            <div key={msg.id} className={`game-message ${msg.type}`}>
              {msg.type === 'system' ? (
                <span style={{ color: '#00ff00' }}>{msg.message}</span>
              ) : (
                <span style={{ color: '#ffaa00' }}>{msg.message}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Inventory Panel */}
      <div className={`inventory-panel ${showInventory ? 'open' : ''}`}>
        <h3 style={{ color: 'white', margin: '0 0 10px 0', fontSize: '14px' }}>Inventory</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2px' }}>
          {Array.from({ length: 20 }, (_, slotIndex) => (
            <div key={slotIndex} className="inventory-slot">
              {player.inventory[slotIndex] && (
                <div style={{ 
                  width: '100%', 
                  height: '100%',
                  background: '#444',
                  borderRadius: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  color: 'white'
                }}>
                  {player.inventory[slotIndex].name.substring(0, 2)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Controls Help */}
      <div className="controls-help">
        <div><strong>Controls:</strong></div>
        <div>WASD / Arrow Keys: Move</div>
        <div>Space: Jump</div>
        <div>Z: Attack</div>
        <div>X: Skill</div>
        <div>I: Inventory</div>
      </div>

      {/* Inventory Toggle Button */}
      <button
        onClick={toggleInventory}
        style={{
          position: 'absolute',
          top: '100px',
          right: '20px',
          padding: '10px',
          background: 'rgba(0,0,0,0.7)',
          border: '1px solid #555',
          color: 'white',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        {showInventory ? 'Close' : 'Inventory'}
      </button>
    </div>
  )
}

export default UIOverlay