import { useAppStore } from '../../store/useAppStore';
import { GameLogo } from './GameLogo';
import { MiniMap } from './MiniMap';
import { AudioControls } from './AudioControls';
import { QuestTracker } from './QuestTracker';
import { IslandNavbar } from './IslandUI';

export function GameHUD() {
  const introStage = useAppStore(state => state.introStage);
  const isCameraDropComplete = useAppStore(state => state.isCameraDropComplete);
  const isSpeaking = useAppStore(state => state.isSpeaking);
  const isSittingAtTable = useAppStore(state => state.isSittingAtTable);

  const setIsAskQuestionModalOpen = useAppStore(state => state.setIsAskQuestionModalOpen);
  const isContactFormOpen = useAppStore(state => state.isContactFormOpen);

  // We only show the HUD after the cinematic welcome screen finishes and camera finishes dropping
  if (introStage !== 'complete') return null;

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 50 // Above canvas, below modals
    }}>
      <GameLogo />
      <IslandNavbar />
      
      {isCameraDropComplete && (
        <>
          {/* Enable pointer events on the interactive HUD elements */}
          <div style={{ pointerEvents: 'auto' }}>
            {!isSpeaking && <MiniMap />}
            <AudioControls />
            
            {/* Persistent Ask Questions Button */}
            {isSittingAtTable && !isContactFormOpen && (
              <button
                onClick={() => setIsAskQuestionModalOpen(true)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '20px',
                  transform: 'translateY(-50%)',
                  background: 'rgba(56, 189, 248, 0.2)',
                  border: '1px solid #38bdf8',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 0 15px rgba(56,189,248,0.3)',
                  backdropFilter: 'blur(4px)',
                  pointerEvents: 'auto',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.4)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.2)'}
              >
                ASK A QUESTION
              </button>
            )}
          </div>
          
          {!isSpeaking && <QuestTracker />}
        </>
      )}
    </div>
  );
}
