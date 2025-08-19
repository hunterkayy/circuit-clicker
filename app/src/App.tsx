import React, { useEffect } from 'react';
import { useGameStore } from './store/useGameStore';
import { GameEngine } from './lib/engine';
import { startAutosave } from './lib/storage';
import Home from './pages/Home';

function App() {
  const { tick, loadGame, saveGame, applyOfflineProgress } = useGameStore();

  useEffect(() => {
    // Load game data
    loadGame();
    
    // Apply offline progress
    applyOfflineProgress();
    
    // Start game engine
    const engine = new GameEngine(tick);
    engine.start();
    
    // Start autosave
    const stopAutosave = startAutosave(saveGame);
    
    // Cleanup
    return () => {
      engine.stop();
      stopAutosave();
    };
  }, [tick, loadGame, saveGame, applyOfflineProgress]);

  return (
    <div className="app">
      <Home />
    </div>
  );
}

export default App;
