import Decimal from 'decimal.js-light';

export function calculateQuantumChips(lifetimeCircuits: Decimal, A: number = 1, B: number = 1000000): Decimal {
  if (lifetimeCircuits.lt(B)) return new Decimal(0);
  
  const ratio = lifetimeCircuits.div(B);
  const sqrt = ratio.sqrt();
  return sqrt.mul(A).floor();
}

export function getGlobalMultiplier(quantumChips: Decimal, qBonus: number = 0.05): Decimal {
  return new Decimal(1).add(quantumChips.mul(qBonus));
}

export function getPrestigePreview(lifetimeCircuits: Decimal, settings: { A: number; B: number; qBonus: number }) {
  const qEarned = calculateQuantumChips(lifetimeCircuits, settings.A, settings.B);
  const newMult = getGlobalMultiplier(qEarned, settings.qBonus);
  
  return { qEarned, newMult };
}
