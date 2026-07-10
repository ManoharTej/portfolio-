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
            
            {/* Persistent Ask Questions Button (Only shows when returning to the bench) */}
            {isSittingAtTable && hasTeleported && !isContactFormOpen && (
              <button
                onClick={() => setIsAskQuestionModalOpen(true)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '30px',
                  transform: 'translateY(-50%)',
                  background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(56, 189, 248, 0.1))',
                  border: '1px solid rgba(56, 189, 248, 0.5)',
                  borderLeft: '4px solid #38bdf8',
                  color: 'white',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '800',
                  fontSize: '1.1rem',
                  letterSpacing: '1px',
                  boxShadow: '0 8px 32px rgba(14, 165, 233, 0.3), inset 0 0 20px rgba(56, 189, 248, 0.1)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  pointerEvents: 'auto',
                  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                  textTransform: 'uppercase'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(14, 165, 233, 0.4), rgba(56, 189, 248, 0.2))';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(14, 165, 233, 0.5), inset 0 0 30px rgba(56, 189, 248, 0.2)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(56, 189, 248, 0.1))';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(14, 165, 233, 0.3), inset 0 0 20px rgba(56, 189, 248, 0.1)';
                }}
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
