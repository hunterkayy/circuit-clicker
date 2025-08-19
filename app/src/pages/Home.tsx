import React, { useState } from 'react';
import TopBar from '../components/TopBar';
import TapPad from '../components/TapPad';
import ShopGenerators from '../components/ShopGenerators';
import ShopUpgrades from '../components/ShopUpgrades';
import PrestigeModal from '../components/PrestigeModal';
import MilestonesPanel from '../components/MilestonesPanel';

function Home() {
  const [showPrestige, setShowPrestige] = useState(false);

  return (
    <>
      <TopBar onPrestigeClick={() => setShowPrestige(true)} />
      
      <div className="main-content">
        <div className="left-panel">
          <TapPad />
          <MilestonesPanel />
        </div>
        
        <div className="right-panel">
          <ShopGenerators />
          <ShopUpgrades />
        </div>
      </div>
      
      {showPrestige && (
        <PrestigeModal onClose={() => setShowPrestige(false)} />
      )}
    </>
  );
}

export default Home;
