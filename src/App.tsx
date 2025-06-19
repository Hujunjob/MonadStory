import React, { useEffect, useState } from 'react'
import { GameComponent } from './components/GameComponent'
import { UIOverlay } from './components/UIOverlay'
import { GameProvider } from './components/GameProvider'
import './App.css'

const App: React.FC = () => {
  const [isGameReady, setIsGameReady] = useState(false)

  useEffect(() => {
    // Initialize game when component mounts
    const timer = setTimeout(() => {
      setIsGameReady(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <GameProvider>
      <div className="app">
        {isGameReady && (
          <>
            <GameComponent />
            <UIOverlay />
          </>
        )}
      </div>
    </GameProvider>
  )
}

export default App