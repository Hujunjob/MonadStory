import React, { useEffect, useRef } from 'react'
import * as Phaser from 'phaser'
import { MainScene } from '../scenes/MainScene'
import { PreloadScene } from '../scenes/PreloadScene'
import { UIScene } from '../scenes/UIScene'
import { useGame } from './GameProvider'

export const GameComponent: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null)
  const { gameState, dispatch } = useGame()

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: 'game-container',
      backgroundColor: '#1a1a2e',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 800 },
          debug: false
        }
      },
      scene: [PreloadScene, MainScene, UIScene],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      input: {
        keyboard: true,
        mouse: true,
        touch: true
      }
    }

    gameRef.current = new Phaser.Game(config)

    // Pass game state and dispatch to scenes through registry
    gameRef.current.registry.set('gameState', gameState)
    gameRef.current.registry.set('dispatch', dispatch)

    console.log('Single-player game initialized')

    // Handle window resize
    const handleResize = () => {
      if (gameRef.current) {
        gameRef.current.scale.resize(window.innerWidth, window.innerHeight)
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
      // Single-player game cleanup
    }
  }, [])

  // Update game registry when game state changes
  useEffect(() => {
    if (gameRef.current) {
      gameRef.current.registry.set('gameState', gameState)
    }
  }, [gameState])

  return (
    <div 
      id="game-container" 
      className="game-container"
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'relative'
      }}
    />
  )
}

export default GameComponent