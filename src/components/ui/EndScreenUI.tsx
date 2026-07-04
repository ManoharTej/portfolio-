import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

export const EndScreenUI = () => {
  const isCameraFlyAway = useAppStore(state => state.isCameraFlyAway);
  const setIsCameraFlyAway = useAppStore(state => state.setIsCameraFlyAway);
  const setHasTeleported = useAppStore(state => state.setHasTeleported);
  const setSittingAtTable = useAppStore(state => state.setSittingAtTable);
  const setCurrentQuestId = useAppStore(state => state.setCurrentQuestId);

  const [opacity, setOpacity] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isCameraFlyAway) {
      // Slow fade to black over 6 seconds as camera flies away
      let startTime = performance.now();
      let frameId: number;
      
      const animateFade = (time: number) => {
        const elapsed = time - startTime;
        const duration = 6000; // 6 seconds
        const progress = Math.min(elapsed / duration, 1);
        
        // Wait 2 seconds before fading
        if (elapsed > 2000) {
            setOpacity(Math.min((elapsed - 2000) / 4000, 1));
        }

        if (progress < 1) {
          frameId = requestAnimationFrame(animateFade);
        } else {
          setShowContent(true);
        }
      };
      
      frameId = requestAnimationFrame(animateFade);
      return () => cancelAnimationFrame(frameId);
    } else {
      setOpacity(0);
      setShowContent(false);
    }
  }, [isCameraFlyAway]);

  if (!isCameraFlyAway) return null;

  const handleExplore = () => {
    // Hide black screen
    setIsCameraFlyAway(false);
    // Unmount DB and start free roam on the island
    setHasTeleported(true);
    setSittingAtTable(false);
    setCurrentQuestId(null);
  };

  const handleRestart = () => {
    window.location.reload();
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: `rgba(0, 0, 0, ${opacity})`,
      transition: 'background-color 0.1s linear',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999999,
      pointerEvents: showContent ? 'auto' : 'none'
    }}>
      
      {showContent && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '40px',
          animation: 'fadeIn 2s ease-in-out'
        }}>
          <h1 style={{ 
            color: 'white', 
            fontFamily: '"Outfit", sans-serif', 
            fontSize: '48px', 
            fontWeight: 800,
            textShadow: '0 0 20px rgba(56, 189, 248, 0.8)'
          }}>
            Thank You For Exploring
          </h1>
          
          <div style={{ display: 'flex', gap: '30px' }}>
            <button 
              onClick={handleExplore}
              style={{
                padding: '16px 32px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.5)',
                color: 'white',
                borderRadius: '30px',
                fontSize: '18px',
                fontFamily: '"Outfit", sans-serif',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.2)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(56, 189, 248, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Explore World By Yourself
            </button>
            
            <button 
              onClick={handleRestart}
              style={{
                padding: '16px 32px',
                backgroundColor: '#38bdf8',
                border: 'none',
                color: '#0f172a',
                borderRadius: '30px',
                fontSize: '18px',
                fontFamily: '"Outfit", sans-serif',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7dd3fc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#38bdf8'}
            >
              Restart Journey
            </button>
          </div>
        </div>
      )}
      
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};
