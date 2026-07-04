import { useAppStore } from '../../store/useAppStore';
import { GameLogo } from './GameLogo';
import { MiniMap } from './MiniMap';
import { AudioControls } from './AudioControls';
import { QuestTracker } from './QuestTracker';
import { IslandNavbar } from './IslandUI';

export function GameHUD() {
  const introStage = useAppStore(state => state.introStage);
  const isCameraDropComplete = useAppStore(state => state.isCameraDropComplete);
  const hasTeleported = useAppStore(state => state.hasTeleported);
  const isSpeaking = useAppStore(state => state.isSpeaking);

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
          </div>
          
          {!isSpeaking && <QuestTracker />}
        </>
      )}
    </div>
  );
}
