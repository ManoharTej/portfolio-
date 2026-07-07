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

  const isAskQuestionPromptVisible = useAppStore(state => state.isAskQuestionPromptVisible);
  const setIsAskQuestionPromptVisible = useAppStore(state => state.setIsAskQuestionPromptVisible);
  const isAskQuestionButtonVisible = useAppStore(state => state.isAskQuestionButtonVisible);
  const setIsAskQuestionButtonVisible = useAppStore(state => state.setIsAskQuestionButtonVisible);
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
            
            {/* Ask Questions Prompt */}
            {isAskQuestionPromptVisible && (
              <div style={{
                position: 'absolute',
                top: '50%',
                right: '20px',
                transform: 'translateY(-50%)',
                background: 'rgba(15, 23, 42, 0.9)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #38bdf8',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 15px rgba(56,189,248,0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                alignItems: 'center',
                pointerEvents: 'auto'
              }}>
                <p style={{ margin: 0, color: 'white', fontWeight: 'bold', fontSize: '18px' }}>Ask Questions?</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => {
                      setIsAskQuestionPromptVisible(false);
                      setIsAskQuestionButtonVisible(true);
                      setIsAskQuestionModalOpen(true);
                    }}
                    style={{
                      background: '#16a34a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
                    }}
                  >
                    Yes
                  </button>
                  <button 
                    onClick={() => {
                      setIsAskQuestionPromptVisible(false);
                      setIsAskQuestionButtonVisible(false);
                    }}
                    style={{
                      background: '#dc2626', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
                    }}
                  >
                    No
                  </button>
                </div>
              </div>
            )}
            
            {/* Persistent Ask Questions Button */}
            {isAskQuestionButtonVisible && !isContactFormOpen && (
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
