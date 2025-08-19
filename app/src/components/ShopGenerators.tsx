import React from 'react';
import { useGameStore, getGeneratorData } from '../store/useGameStore';
import { formatNumber } from '../lib/number';
import { getBulkCost, getMaxAffordable } from '../lib/pricing';
import Decimal from 'decimal.js-light';

function ShopGenerators() {
  const { circuits, generators, numberFormat, buyGenerator } = useGameStore();
  const generatorData = getGeneratorData();

  const buyQuantities = [1, 10, 25, 100];

  const handleBuy = (generatorId: string, quantity: number) => {
    buyGenerator(generatorId, quantity);
  };

  const getMaxBuyable = (generator: any) => {
    const owned = generators[generator.id] || 0;
    return getMaxAffordable(generator.baseCost, generator.growth, owned, circuits);
  };

  return (
    <div className="shop-section">
      <h2 className="shop-title">Generators</h2>
      
      {generatorData.map((generator) => {
        const owned = generators[generator.id] || 0;
        const maxBuyable = getMaxBuyable(generator);
        
        // Calculate CPS contribution
        const cpsContribution = owned > 0 ? new Decimal(generator.baseCps).mul(owned) : new Decimal(0);
        
        return (
          <div key={generator.id} className="shop-item">
            <div className="shop-item-info">
              <div className="shop-item-name">{generator.name}</div>
              <div className="shop-item-details">
                <div>Owned: {owned}</div>
                <div>Base CPS: {formatNumber(generator.baseCps, numberFormat)}</div>
                <div>Total CPS: {formatNumber(cpsContribution, numberFormat)}</div>
              </div>
            </div>
            
            <div className="shop-item-actions">
              {buyQuantities.map((qty) => {
                const cost = getBulkCost(generator.baseCost, generator.growth, owned, qty);
                const canAfford = circuits.gte(cost);
                const actualQty = Math.min(qty, maxBuyable);
                
                if (actualQty === 0) return null;
                
                return (
                  <button
                    key={qty}
                    className="btn"
                    onClick={() => handleBuy(generator.id, actualQty)}
                    disabled={!canAfford}
                    title={`Cost: ${formatNumber(cost, numberFormat)}`}
                  >
                    x{actualQty === qty ? qty : actualQty}
                    <br />
                    <small>{formatNumber(cost, numberFormat)}</small>
                  </button>
                );
              })}
              
              {maxBuyable > 100 && (
                <button
                  className="btn btn-primary"
                  onClick={() => handleBuy(generator.id, maxBuyable)}
                  title={`Buy maximum (${maxBuyable})`}
                >
                  Max
                  <br />
                  <small>x{maxBuyable}</small>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ShopGenerators;
