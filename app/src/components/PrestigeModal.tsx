import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { formatNumber } from '../lib/number';

interface PrestigeModalProps {
  onClose: () => void;
}

function PrestigeModal({ onClose }: PrestigeModalProps) {
  const { 
    prestigePreview, 
    doPrestige, 
    quantumChips, 
    numberFormat 
  } = useGameStore();
  
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  
  const preview = prestigePreview();
  const canPrestige = preview.qEarned.gt(0);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isHolding && canPrestige) {
      interval = setInterval(() => {
        setHoldProgress(prev => {
          const next = prev + 2; // 2% per 100ms = 5 seconds total
          if (next >= 100) {
            handlePrestige();
            return 0;
          }
          return next;
        });
      }, 100);
    } else {
      setHoldProgress(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHolding, canPrestige]);
  
  const handlePrestige = () => {
    doPrestige();
    onClose();
  };
  
  const handleMouseDown = () => {
    if (canPrestige) {
      setIsHolding(true);
    }
  };
  
  const handleMouseUp = () => {
    setIsHolding(false);
    setHoldProgress(0);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">System Reboot</h2>
        
        <div className="modal-content">
          {canPrestige ? (
            <>
              <div className="mb-2">
                <h3>Quantum Chips Earned</h3>
                <div className="text-success" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                  +{formatNumber(preview.qEarned, numberFormat)}
                </div>
              </div>
              
              <div className="mb-2">
                <h3>New Global Multiplier</h3>
                <div className="text-warning">
                  {formatNumber(preview.newMult, numberFormat)}x
                  {quantumChips.gt(0) && (
                    <span className="text-muted">
                      {' '}(was {formatNumber(quantumChips.mul(0.05).add(1), numberFormat)}x)
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mb-2">
                <h3>What resets:</h3>
                <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                  <li>All circuits</li>
                  <li>All generators</li>
                  <li>All upgrades</li>
                  <li>All milestones</li>
                </ul>
              </div>
              
              <div className="mb-2">
                <h3>What persists:</h3>
                <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                  <li>Quantum Chips</li>
                  <li>Achievements</li>
                  <li>Settings</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="text-center">
              <p className="text-muted mb-2">
                You need at least 1,000,000 lifetime circuits to perform a reboot.
              </p>
              <p>
                Keep playing to reach the prestige threshold!
              </p>
            </div>
          )}
        </div>
        
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          
          {canPrestige && (
            <button
              className="btn btn-danger hold-button"
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchEnd={handleMouseUp}
              style={{ minWidth: '150px', position: 'relative' }}
            >
              <div 
                className="hold-progress"
                style={{ width: `${holdProgress}%` }}
              />
              <span className="hold-button-text">
                {holdProgress > 0 ? `Rebooting... ${holdProgress.toFixed(0)}%` : 'Hold to Reboot'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PrestigeModal;
