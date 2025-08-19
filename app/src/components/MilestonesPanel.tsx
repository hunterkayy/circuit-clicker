import React from 'react';
import { useGameStore, getGeneratorData } from '../store/useGameStore';
import { formatNumber } from '../lib/number';

function MilestonesPanel() {
  const { generators, milestones, achievements, numberFormat } = useGameStore();
  const generatorData = getGeneratorData();

  // Calculate milestone progress
  const milestoneThresholds = [25, 50, 100];
  
  const getMilestoneLevel = (generatorId: string) => {
    const owned = generators[generatorId] || 0;
    let level = 0;
    for (const threshold of milestoneThresholds) {
      if (owned >= threshold) level++;
    }
    return level;
  };

  const getNextMilestone = (generatorId: string) => {
    const owned = generators[generatorId] || 0;
    for (const threshold of milestoneThresholds) {
      if (owned < threshold) return threshold;
    }
    return null;
  };

  // Basic achievements
  const basicAchievements = [
    { id: 'first_tap', name: 'First Click', desc: 'Make your first tap', check: () => true },
    { id: 'first_generator', name: 'Automation', desc: 'Buy your first generator', check: () => Object.values(generators).some(count => count > 0) },
    { id: 'hundred_generators', name: 'Mass Production', desc: 'Own 100 total generators', check: () => Object.values(generators).reduce((sum, count) => sum + count, 0) >= 100 },
    { id: 'first_prestige', name: 'Quantum Leap', desc: 'Perform your first reboot', check: () => achievements['first_prestige'] || false },
  ];

  const completedAchievements = basicAchievements.filter(ach => achievements[ach.id] || ach.check());
  const globalBonus = completedAchievements.length * 0.01; // 1% per achievement

  return (
    <div className="shop-section">
      <h2 className="shop-title">Progress</h2>
      
      {/* Generator Milestones */}
      <div className="mb-2">
        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--accent-color)' }}>
          Generator Milestones
        </h3>
        
        {generatorData.slice(0, 4).map((generator) => {
          const owned = generators[generator.id] || 0;
          const level = getMilestoneLevel(generator.id);
          const nextMilestone = getNextMilestone(generator.id);
          const bonus = level * 10; // 10% per milestone level
          
          return (
            <div key={generator.id} style={{ 
              background: 'var(--tertiary-bg)', 
              padding: '0.5rem', 
              marginBottom: '0.5rem',
              borderRadius: '0.25rem',
              fontSize: '0.875rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{generator.name}</span>
                <span className="text-muted">{owned}</span>
              </div>
              
              {level > 0 && (
                <div className="text-success">
                  +{bonus}% production bonus
                </div>
              )}
              
              {nextMilestone && (
                <div className="text-warning">
                  Next: {nextMilestone} (+10% bonus)
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Achievements */}
      <div>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--accent-color)' }}>
          Achievements
        </h3>
        
        <div style={{ 
          background: 'var(--tertiary-bg)', 
          padding: '0.5rem', 
          marginBottom: '0.5rem',
          borderRadius: '0.25rem',
          fontSize: '0.875rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Global Bonus</span>
            <span className="text-success">+{(globalBonus * 100).toFixed(0)}%</span>
          </div>
          <div className="text-muted">
            {completedAchievements.length}/{basicAchievements.length} achievements
          </div>
        </div>
        
        {basicAchievements.map((achievement) => {
          const isCompleted = achievements[achievement.id] || achievement.check();
          
          return (
            <div key={achievement.id} style={{ 
              background: 'var(--tertiary-bg)', 
              padding: '0.5rem', 
              marginBottom: '0.5rem',
              borderRadius: '0.25rem',
              fontSize: '0.875rem',
              opacity: isCompleted ? 1 : 0.6
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{achievement.name}</span>
                {isCompleted && <span className="text-success">✓</span>}
              </div>
              <div className="text-muted">
                {achievement.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MilestonesPanel;
