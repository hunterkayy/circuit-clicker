# Circuit Clicker

A modern idle/clicker web game built with React, TypeScript, and Vite. Generate circuits, buy generators, upgrade your production, and perform quantum reboots to gain permanent bonuses!

## 🚀 Quick Start

```bash
# Navigate to the app directory
cd circuit-clicker/app

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎮 How to Play

1. **Tap to Generate**: Click the large blue button to generate circuits manually
2. **Buy Generators**: Purchase automated generators to produce circuits per second
3. **Purchase Upgrades**: Buy upgrades to boost your tap power and generator efficiency  
4. **Unlock Milestones**: Reach generator ownership milestones for permanent bonuses
5. **Quantum Reboot**: When you've earned enough lifetime circuits, perform a reboot to gain Quantum Chips for permanent global multipliers

## 🔧 Game Features

- **Progressive Generators**: 8 different generator types with increasing power and cost
- **Smart Bulk Buying**: Buy generators in bulk (x1, x10, x25, x100, Max) with optimized pricing
- **Prestige System**: Quantum reboot mechanic that provides permanent progression
- **Offline Progress**: Earn circuits while away from the game (capped and with efficiency)
- **Autosave**: Game automatically saves every 10 seconds
- **Export/Import**: Manual save data management
- **Responsive UI**: Works on desktop and mobile devices
- **Number Formatting**: Clean display of large numbers (K, M, B, T+)

## ⚙️ Economy Tuning

Game balance can be adjusted in `/src/data/settings.json`:

```json
{
  "prestige": {
    "A": 1,           // Prestige multiplier
    "B": 1000000,     // Prestige threshold (lifetime circuits needed)
    "qBonus": 0.05    // Quantum chip bonus per chip (5% each)
  },
  "offline": {
    "capHours": 8,     // Maximum offline hours
    "efficiency": 0.25 // Offline efficiency (25% of online rate)
  }
}
```

### Generator Balance

Modify `/src/data/generators.json` to adjust:
- `baseCps`: Base circuits per second
- `baseCost`: Starting cost
- `growth`: Cost multiplier per purchase (1.15 = 15% increase)

### Upgrade Balance

Edit `/src/data/upgrades.json` to change:
- `cost`: Purchase price
- `value`: Effect strength
- `type`: Effect type (tap_flat, gen_mult, global_mult)

## 🏗️ Technical Architecture

- **State Management**: Zustand for reactive game state
- **Big Numbers**: decimal.js-light for precise large number arithmetic
- **Data Validation**: Zod schemas for static game data
- **Game Loop**: RequestAnimationFrame-based tick system
- **Storage**: LocalStorage with automatic save/load

## 📱 Capacitor Preparation

The game is structured to easily wrap with Capacitor for mobile deployment:

### Before Mobile Build:
1. Add app icons and splash screens to `/src/assets/`
2. Configure Capacitor in a new `capacitor.config.ts`
3. Add PWA manifest for web app capabilities
4. Test touch interactions and mobile UX

### Recommended Mobile Optimizations:
- Haptic feedback for taps (if supported)
- Offline-first caching strategy
- App store metadata and screenshots
- Performance testing on low-end devices

## 🐛 Known Issues & TODOs

- [ ] Add sound effects and music
- [ ] Implement additional achievement categories
- [ ] Add more visual feedback for purchases
- [ ] Optimize performance for very large numbers
- [ ] Add settings panel for number format, sound toggle, etc.

## 📂 Project Structure

```
/circuit-clicker/app/
├── src/
│   ├── components/     # React UI components
│   ├── data/          # Static game data (JSON)
│   ├── lib/           # Utility libraries
│   ├── pages/         # Page components
│   ├── store/         # Zustand state management
│   └── styles/        # CSS styles
├── package.json       # Dependencies and scripts
├── vite.config.ts     # Vite configuration
└── tsconfig.json      # TypeScript configuration
```

## 🛠️ Development

```bash
# Run with type checking
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📊 Game Balance Notes

**First Prestige Target**: ~8-12 minutes of active play
**Automation vs Manual**: By 10 minutes, automation should provide ~80-90% of income
**Number Growth**: Exponential scaling with manageable early game progression

The economy is tuned so that:
- Early game progression feels rewarding
- Manual tapping remains relevant for several minutes
- First prestige is achievable in a reasonable timeframe
- Long-term progression through quantum chips

Enjoy building your circuit empire! ⚡
