import { create } from 'zustand';
import Decimal from 'decimal.js-light';
import { z } from 'zod';
import { getGlobalMultiplier, getPrestigePreview } from '../lib/prestige';
import { getBulkCost, getMaxAffordable } from '../lib/pricing';
import { save, load, SaveData, getOfflineGain } from '../lib/storage';
import generatorsData from '../data/generators.json';
import upgradesData from '../data/upgrades.json';
import settingsData from '../data/settings.json';

// Zod schemas for validation
const GeneratorSchema = z.object({
  id: z.string(),
  name: z.string(),
  baseCps: z.number(),
  baseCost: z.number(),
  growth: z.number(),
});

const UpgradeSchema = z.object({
  id: z.string(),
  type: z.enum(['tap_flat', 'gen_mult', 'global_mult']),
  value: z.number(),
  cost: z.number(),
  target: z.string().optional(),
});

const SettingsSchema = z.object({
  prestige: z.object({
    A: z.number(),
    B: z.number(),
    qBonus: z.number(),
  }),
  offline: z.object({
    capHours: z.number(),
    efficiency: z.number(),
  }),
});

// Validate static data
const generators = z.array(GeneratorSchema).parse(generatorsData);
const upgrades = z.array(UpgradeSchema).parse(upgradesData);
const gameSettings = SettingsSchema.parse(settingsData);

interface GameState {
  // Core resources
  circuits: Decimal;
  lifetimeCircuits: Decimal;
  quantumChips: Decimal;
  cps: Decimal;
  tapGain: Decimal;
  tapBase: number;
  
  // Generators and upgrades
  generators: Record<string, number>;
  upgrades: Record<string, boolean>;
  
  // Achievements and milestones
  achievements: Record<string, boolean>;
  milestones: Record<string, number>;
  
  // Game state
  lastSavedAt: number | null;
  numberFormat: 'short' | 'scientific';
  
  // Actions
  tick: (deltaTime: number) => void;
  tap: () => void;
  buyGenerator: (id: string, quantity?: number) => boolean;
  buyUpgrade: (id: string) => boolean;
  recalc: () => void;
  prestigePreview: () => { qEarned: Decimal; newMult: Decimal };
  doPrestige: () => void;
  saveGame: () => void;
  loadGame: () => void;
  resetGame: () => void;
  applyOfflineProgress: () => void;
  setNumberFormat: (format: 'short' | 'scientific') => void;
  checkAchievements: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  circuits: new Decimal(0),
  lifetimeCircuits: new Decimal(0),
  quantumChips: new Decimal(0),
  cps: new Decimal(0),
  tapGain: new Decimal(1),
  tapBase: 1,
  generators: {},
  upgrades: {},
  achievements: {},
  milestones: {},
  lastSavedAt: null,
  numberFormat: 'short',

  // Actions
  tick: (deltaTime: number) => {
    const state = get();
    const gain = state.cps.mul(deltaTime);
    
    set({
      circuits: state.circuits.add(gain),
      lifetimeCircuits: state.lifetimeCircuits.add(gain),
    });
    
    // Check achievements
    get().checkAchievements();
  },

  tap: () => {
    const state = get();
    set({
      circuits: state.circuits.add(state.tapGain),
      lifetimeCircuits: state.lifetimeCircuits.add(state.tapGain),
    });
    
    // Check achievements
    get().checkAchievements();
  },

  buyGenerator: (id: string, quantity = 1) => {
    const state = get();
    const generator = generators.find(g => g.id === id);
    if (!generator) return false;

    const owned = state.generators[id] || 0;
    const cost = getBulkCost(generator.baseCost, generator.growth, owned, quantity);
    
    if (state.circuits.lt(cost)) return false;

    set({
      circuits: state.circuits.sub(cost),
      generators: {
        ...state.generators,
        [id]: owned + quantity,
      },
    });

    get().recalc();
    return true;
  },

  buyUpgrade: (id: string) => {
    const state = get();
    const upgrade = upgrades.find(u => u.id === id);
    if (!upgrade || state.upgrades[id]) return false;

    if (state.circuits.lt(upgrade.cost)) return false;

    set({
      circuits: state.circuits.sub(upgrade.cost),
      upgrades: {
        ...state.upgrades,
        [id]: true,
      },
    });

    get().recalc();
    return true;
  },

  recalc: () => {
    const state = get();
    const globalMult = getGlobalMultiplier(state.quantumChips, gameSettings.prestige.qBonus);
    
    // Calculate tap gain
    let tapGain = new Decimal(state.tapBase);
    
    // Apply tap upgrades
    for (const upgrade of upgrades) {
      if (state.upgrades[upgrade.id] && upgrade.type === 'tap_flat') {
        tapGain = tapGain.add(upgrade.value);
      }
    }
    
    // Apply global multiplier
    tapGain = tapGain.mul(globalMult);
    
    // Calculate CPS
    let totalCps = new Decimal(0);
    
    for (const generator of generators) {
      const owned = state.generators[generator.id] || 0;
      if (owned === 0) continue;
      
      let genCps = new Decimal(generator.baseCps).mul(owned);
      
      // Apply generator-specific multipliers
      for (const upgrade of upgrades) {
        if (state.upgrades[upgrade.id] && 
            upgrade.type === 'gen_mult' && 
            upgrade.target === generator.id) {
          genCps = genCps.mul(1 + upgrade.value);
        }
      }
      
      // Apply milestone bonuses
      const milestoneLevel = state.milestones[generator.id] || 0;
      if (milestoneLevel > 0) {
        genCps = genCps.mul(1 + milestoneLevel * 0.1); // 10% per milestone
      }
      
      totalCps = totalCps.add(genCps);
    }
    
    // Apply global multipliers from upgrades
    for (const upgrade of upgrades) {
      if (state.upgrades[upgrade.id] && upgrade.type === 'global_mult') {
        totalCps = totalCps.mul(1 + upgrade.value);
        tapGain = tapGain.mul(1 + upgrade.value);
      }
    }
    
    // Apply achievement bonuses (1% per achievement)
    const achievementCount = Object.values(state.achievements).filter(Boolean).length;
    const achievementBonus = 1 + (achievementCount * 0.01);
    totalCps = totalCps.mul(achievementBonus);
    tapGain = tapGain.mul(achievementBonus);
    
    totalCps = totalCps.mul(globalMult);
    
    set({
      cps: totalCps,
      tapGain,
    });
  },

  prestigePreview: () => {
    const state = get();
    return getPrestigePreview(state.lifetimeCircuits, gameSettings.prestige);
  },

  doPrestige: () => {
    const state = get();
    const preview = state.prestigePreview();
    
    if (preview.qEarned.eq(0)) return;
    
    // Mark first prestige achievement
    const newAchievements = { ...state.achievements };
    if (!newAchievements['first_prestige']) {
      newAchievements['first_prestige'] = true;
    }
    
    // Reset everything except quantum chips and achievements
    set({
      circuits: new Decimal(0),
      lifetimeCircuits: new Decimal(0),
      quantumChips: state.quantumChips.add(preview.qEarned),
      tapBase: 1,
      generators: {},
      upgrades: {},
      milestones: {},
      achievements: newAchievements,
    });
    
    get().recalc();
  },

  saveGame: () => {
    const state = get();
    const saveData: Partial<SaveData> = {
      circuits: state.circuits.toString(),
      lifetimeCircuits: state.lifetimeCircuits.toString(),
      quantumChips: state.quantumChips.toString(),
      tapBase: state.tapBase,
      generators: state.generators,
      upgrades: state.upgrades,
      achievements: state.achievements,
      milestones: state.milestones,
      settings: {
        numberFormat: state.numberFormat,
        reduceMotion: false,
        highContrast: false,
      },
    };
    
    save(saveData);
    set({ lastSavedAt: Date.now() });
  },

  loadGame: () => {
    const saveData = load();
    
    set({
      circuits: new Decimal(saveData.circuits || '0'),
      lifetimeCircuits: new Decimal(saveData.lifetimeCircuits || '0'),
      quantumChips: new Decimal(saveData.quantumChips || '0'),
      tapBase: saveData.tapBase || 1,
      generators: saveData.generators || {},
      upgrades: saveData.upgrades || {},
      achievements: saveData.achievements || {},
      milestones: saveData.milestones || {},
      lastSavedAt: saveData.lastSavedAt || Date.now(),
      numberFormat: saveData.settings?.numberFormat || 'short',
    });
    
    get().recalc();
  },

  resetGame: () => {
    set({
      circuits: new Decimal(0),
      lifetimeCircuits: new Decimal(0),
      quantumChips: new Decimal(0),
      cps: new Decimal(0),
      tapGain: new Decimal(1),
      tapBase: 1,
      generators: {},
      upgrades: {},
      achievements: {},
      milestones: {},
      lastSavedAt: Date.now(),
      numberFormat: 'short',
    });
    
    get().recalc();
  },

  applyOfflineProgress: () => {
    const state = get();
    if (!state.lastSavedAt) return;
    
    const offlineGain = getOfflineGain(
      state.lastSavedAt,
      state.cps,
      gameSettings.offline.capHours,
      gameSettings.offline.efficiency
    );
    
    if (offlineGain.circuits.gt(0)) {
      set({
        circuits: state.circuits.add(offlineGain.circuits),
        lifetimeCircuits: state.lifetimeCircuits.add(offlineGain.circuits),
      });
    }
  },

  setNumberFormat: (format: 'short' | 'scientific') => {
    set({ numberFormat: format });
  },

  checkAchievements: () => {
    const state = get();
    const newAchievements = { ...state.achievements };
    let hasNewAchievement = false;

    // First tap achievement
    if (!newAchievements['first_tap']) {
      newAchievements['first_tap'] = true;
      hasNewAchievement = true;
    }

    // First generator achievement
    if (!newAchievements['first_generator'] && Object.values(state.generators).some(count => count > 0)) {
      newAchievements['first_generator'] = true;
      hasNewAchievement = true;
    }

    // Hundred generators achievement
    const totalGenerators = Object.values(state.generators).reduce((sum, count) => sum + count, 0);
    if (!newAchievements['hundred_generators'] && totalGenerators >= 100) {
      newAchievements['hundred_generators'] = true;
      hasNewAchievement = true;
    }

    // Update milestones
    const newMilestones = { ...state.milestones };
    let hasMilestoneUpdate = false;
    
    for (const generator of generators) {
      const owned = state.generators[generator.id] || 0;
      const currentLevel = newMilestones[generator.id] || 0;
      let newLevel = 0;
      
      if (owned >= 100) newLevel = 3;
      else if (owned >= 50) newLevel = 2;
      else if (owned >= 25) newLevel = 1;
      
      if (newLevel > currentLevel) {
        newMilestones[generator.id] = newLevel;
        hasMilestoneUpdate = true;
      }
    }

    if (hasNewAchievement || hasMilestoneUpdate) {
      set({ 
        achievements: newAchievements,
        milestones: newMilestones 
      });
      
      if (hasMilestoneUpdate) {
        get().recalc(); // Recalculate CPS with new milestone bonuses
      }
    }
  },
}));

// Helper functions for components
export const getGeneratorData = () => generators;
export const getUpgradeData = () => upgrades;
export const getGameSettings = () => gameSettings;
