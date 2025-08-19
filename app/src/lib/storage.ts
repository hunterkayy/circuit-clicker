import Decimal from 'decimal.js-light';
import dayjs from 'dayjs';

export interface SaveData {
  circuits: string;
  lifetimeCircuits: string;
  quantumChips: string;
  tapBase: number;
  generators: Record<string, number>;
  upgrades: Record<string, boolean>;
  lastSavedAt: number;
  achievements: Record<string, boolean>;
  milestones: Record<string, number>;
  settings: {
    numberFormat: 'short' | 'scientific';
    reduceMotion: boolean;
    highContrast: boolean;
  };
}

const SAVE_KEY = 'circuit-clicker-save';
const AUTOSAVE_INTERVAL = 10000; // 10 seconds

export function save(data: Partial<SaveData>): void {
  try {
    const existingData = load();
    const saveData: SaveData = {
      ...existingData,
      ...data,
      lastSavedAt: Date.now(),
    };
    
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  } catch (error) {
    console.error('Failed to save game:', error);
  }
}

export function load(): SaveData {
  try {
    const data = localStorage.getItem(SAVE_KEY);
    if (!data) return getDefaultSave();
    
    const parsed = JSON.parse(data);
    return {
      ...getDefaultSave(),
      ...parsed,
    };
  } catch (error) {
    console.error('Failed to load game:', error);
    return getDefaultSave();
  }
}

export function getDefaultSave(): SaveData {
  return {
    circuits: '0',
    lifetimeCircuits: '0',
    quantumChips: '0',
    tapBase: 1,
    generators: {},
    upgrades: {},
    lastSavedAt: Date.now(),
    achievements: {},
    milestones: {},
    settings: {
      numberFormat: 'short',
      reduceMotion: false,
      highContrast: false,
    },
  };
}

export function exportSave(): string {
  const data = load();
  return JSON.stringify(data, null, 2);
}

export function importSave(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    
    // Basic validation
    if (typeof data !== 'object' || !data.circuits) {
      throw new Error('Invalid save data format');
    }
    
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to import save:', error);
    return false;
  }
}

export function resetSave(): void {
  localStorage.removeItem(SAVE_KEY);
}

export function startAutosave(saveCallback: () => void): () => void {
  const interval = setInterval(saveCallback, AUTOSAVE_INTERVAL);
  return () => clearInterval(interval);
}

export function getOfflineGain(lastSavedAt: number, cps: Decimal, capHours: number, efficiency: number): { circuits: Decimal; duration: number } {
  const now = Date.now();
  const offlineSeconds = Math.max(0, (now - lastSavedAt) / 1000);
  const cappedSeconds = Math.min(offlineSeconds, capHours * 3600);
  
  const circuits = cps.mul(cappedSeconds).mul(efficiency);
  
  return { circuits, duration: cappedSeconds };
}
