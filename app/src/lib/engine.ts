import Decimal from 'decimal.js-light';

export class GameEngine {
  private lastTick = 0;
  private animationFrame: number | null = null;
  private isRunning = false;

  constructor(private tickCallback: (deltaTime: number) => void) {}

  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTick = performance.now();
    this.tick();
  }

  stop(): void {
    this.isRunning = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  private tick = (): void => {
    if (!this.isRunning) return;

    const now = performance.now();
    const deltaMs = now - this.lastTick;
    const deltaSeconds = Math.min(deltaMs / 1000, 0.25); // Cap at 0.25s to prevent large jumps

    if (deltaSeconds > 0) {
      this.tickCallback(deltaSeconds);
    }

    this.lastTick = now;
    this.animationFrame = requestAnimationFrame(this.tick);
  };
}

export function applyOfflineGain(
  lastSavedAt: number,
  currentCps: Decimal,
  capHours: number,
  efficiency: number
): { circuits: Decimal; duration: number } {
  const now = Date.now();
  const offlineMs = Math.max(0, now - lastSavedAt);
  const offlineSeconds = offlineMs / 1000;
  
  // Cap offline time
  const cappedSeconds = Math.min(offlineSeconds, capHours * 3600);
  
  // Calculate gain with efficiency
  const offlineCircuits = currentCps.mul(cappedSeconds).mul(efficiency);
  
  return {
    circuits: offlineCircuits,
    duration: cappedSeconds,
  };
}
