import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { formatNumber, formatCPS } from '../lib/number';

interface TopBarProps {
  onPrestigeClick: () => void;
}

function TopBar({ onPrestigeClick }: TopBarProps) {
  const { 
    circuits, 
    lifetimeCircuits, 
    quantumChips, 
    cps, 
    numberFormat,
    prestigePreview 
  } = useGameStore();

  const preview = prestigePreview();
  const canPrestige = preview.qEarned.gt(0);

  return (
    <div className="top-bar">
      <div className="top-bar-item">
        <div className="top-bar-label">Circuits</div>
        <div className="top-bar-value">
          {formatNumber(circuits, numberFormat)}
        </div>
      </div>
      
      <div className="top-bar-item">
        <div className="top-bar-label">Per Second</div>
        <div className="top-bar-value">
          {formatCPS(cps)}
        </div>
      </div>
      
      <div className="top-bar-item">
        <div className="top-bar-label">Lifetime</div>
        <div className="top-bar-value">
          {formatNumber(lifetimeCircuits, numberFormat)}
        </div>
      </div>
      
      <div className="top-bar-item">
        <div className="top-bar-label">Quantum Chips</div>
        <div className="top-bar-value text-success">
          {formatNumber(quantumChips, numberFormat)}
        </div>
      </div>
      
      <button 
        className={`btn ${canPrestige ? 'btn-success' : ''}`}
        onClick={onPrestigeClick}
        disabled={!canPrestige}
        title={canPrestige ? `Gain ${formatNumber(preview.qEarned)} Quantum Chips` : 'Not ready for prestige'}
      >
        {canPrestige ? 'Reboot Ready!' : 'Reboot'}
      </button>
    </div>
  );
}

export default TopBar;
