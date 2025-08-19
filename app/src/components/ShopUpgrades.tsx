import React from 'react';
import { useGameStore, getUpgradeData } from '../store/useGameStore';
import { formatNumber } from '../lib/number';

function ShopUpgrades() {
  const { circuits, upgrades, numberFormat, buyUpgrade } = useGameStore();
  const upgradeData = getUpgradeData();

  const getUpgradeDescription = (upgrade: any) => {
    switch (upgrade.type) {
      case 'tap_flat':
        return `+${upgrade.value} tap power`;
      case 'gen_mult':
        return `+${(upgrade.value * 100).toFixed(0)}% ${upgrade.target} production`;
      case 'global_mult':
        return `+${(upgrade.value * 100).toFixed(0)}% global production`;
      default:
        return 'Unknown upgrade';
    }
  };

  const availableUpgrades = upgradeData.filter(upgrade => !upgrades[upgrade.id]);

  if (availableUpgrades.length === 0) {
    return (
      <div className="shop-section">
        <h2 className="shop-title">Upgrades</h2>
        <div className="text-center text-muted">
          All upgrades purchased!
        </div>
      </div>
    );
  }

  return (
    <div className="shop-section">
      <h2 className="shop-title">Upgrades</h2>
      
      {availableUpgrades.map((upgrade) => {
        const canAfford = circuits.gte(upgrade.cost);
        
        return (
          <div key={upgrade.id} className="shop-item">
            <div className="shop-item-info">
              <div className="shop-item-name">
                {upgrade.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
              <div className="shop-item-details">
                <div>{getUpgradeDescription(upgrade)}</div>
                <div className="text-warning">
                  Cost: {formatNumber(upgrade.cost, numberFormat)}
                </div>
              </div>
            </div>
            
            <div className="shop-item-actions">
              <button
                className="btn btn-success"
                onClick={() => buyUpgrade(upgrade.id)}
                disabled={!canAfford}
              >
                Buy
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ShopUpgrades;
