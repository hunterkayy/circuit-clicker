import Decimal from 'decimal.js-light';

export type NumberFormat = 'short' | 'scientific';

const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];

export function formatNumber(value: Decimal | number, format: NumberFormat = 'short'): string {
  const decimal = new Decimal(value);
  
  if (decimal.isZero()) return '0';
  if (decimal.lt(1000)) return decimal.toFixed(0);
  
  if (format === 'scientific') {
    return decimal.toExponential(2);
  }
  
  // Short format
  let magnitude = 0;
  let num = decimal;
  
  while (num.gte(1000) && magnitude < suffixes.length - 1) {
    num = num.div(1000);
    magnitude++;
  }
  
  if (magnitude >= suffixes.length) {
    return decimal.toExponential(2);
  }
  
  const decimals = num.lt(10) ? 2 : num.lt(100) ? 1 : 0;
  return num.toFixed(decimals) + suffixes[magnitude];
}

export function formatCPS(cps: Decimal | number): string {
  return formatNumber(cps) + '/s';
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(0)}s`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)}h`;
  return `${(seconds / 86400).toFixed(1)}d`;
}
