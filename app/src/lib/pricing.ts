import Decimal from 'decimal.js-light';

export function getGeneratorCost(baseCost: number, growth: number, owned: number): Decimal {
  return new Decimal(baseCost).mul(new Decimal(growth).pow(owned));
}

export function getBulkCost(baseCost: number, growth: number, owned: number, quantity: number): Decimal {
  if (quantity <= 0) return new Decimal(0);
  
  const base = new Decimal(baseCost);
  const r = new Decimal(growth);
  const n = new Decimal(owned);
  
  if (r.eq(1)) {
    // Linear case: cost = baseCost * quantity
    return base.mul(quantity);
  }
  
  // Geometric series: baseCost * r^n * (r^quantity - 1) / (r - 1)
  const firstTerm = base.mul(r.pow(n));
  const geometricSum = r.pow(quantity).sub(1).div(r.sub(1));
  
  return firstTerm.mul(geometricSum);
}

export function getMaxAffordable(baseCost: number, growth: number, owned: number, budget: Decimal): number {
  if (budget.lte(0)) return 0;
  
  const base = new Decimal(baseCost);
  const r = new Decimal(growth);
  const n = new Decimal(owned);
  
  if (r.eq(1)) {
    // Linear case
    return Math.floor(budget.div(base).toNumber());
  }
  
  // Binary search for max affordable
  let low = 0;
  let high = 1000; // Start with reasonable upper bound
  
  // Expand upper bound if needed
  while (getBulkCost(baseCost, growth, owned, high).lte(budget)) {
    high *= 2;
  }
  
  while (low < high) {
    const mid = Math.floor((low + high + 1) / 2);
    const cost = getBulkCost(baseCost, growth, owned, mid);
    
    if (cost.lte(budget)) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }
  
  return low;
}
