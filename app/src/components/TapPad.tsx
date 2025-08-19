import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { formatNumber } from '../lib/number';

function TapPad() {
  const { tap, tapGain, numberFormat } = useGameStore();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleTap = () => {
    tap();
    setIsAnimating(true);
    
    // Reset animation after a short delay
    setTimeout(() => setIsAnimating(false), 150);
  };

  return (
    <div className="tap-pad">
      <h2>Circuit Generator</h2>
      
      <button 
        className={`tap-button ${isAnimating ? 'animate' : ''}`}
        onClick={handleTap}
        style={{
          transform: isAnimating ? 'scale(0.95)' : 'scale(1)',
          transition: 'transform 0.15s ease'
        }}
      >
        <div>TAP</div>
        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
          +{formatNumber(tapGain, numberFormat)}
        </div>
      </button>
      
      <div className="tap-gain">
        Tap for <span className="text-success">{formatNumber(tapGain, numberFormat)}</span> circuits
      </div>
    </div>
  );
}

export default TapPad;
