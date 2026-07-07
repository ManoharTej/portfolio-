import { useAppStore } from '../../store/useAppStore';

export function AudioControls() {
  const isMusicMuted = useAppStore(state => state.isMusicMuted);
  const setIsMusicMuted = useAppStore(state => state.setIsMusicMuted);
  const isSfxMuted = useAppStore(state => state.isSfxMuted);
  const setIsSfxMuted = useAppStore(state => state.setIsSfxMuted);
  const isOceanMuted = useAppStore(state => state.isOceanMuted);
  const setIsOceanMuted = useAppStore(state => state.setIsOceanMuted);
  


  const buttonStyle = (isMuted: boolean) => ({
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: isMuted ? 'rgba(239, 68, 68, 0.2)' : 'rgba(30, 41, 59, 0.7)',
    border: `1px solid ${isMuted ? 'rgba(239, 68, 68, 0.5)' : 'rgba(148, 163, 184, 0.3)'}`,
    color: isMuted ? '#ef4444' : '#e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backdropFilter: 'blur(8px)',
    transition: 'all 0.2s ease',
    marginBottom: '8px'
  });

  return (
    <div style={{
      position: 'absolute',
        top: '80px',
        left: '30px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
      }}>
        {/* Music Toggle */}
        <button 
          title="Toggle Music"
          style={buttonStyle(isMusicMuted)}
          onClick={() => setIsMusicMuted(!isMusicMuted)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
            {isMusicMuted && <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="2" />}
          </svg>
        </button>
        
        {/* SFX Toggle */}
        <button 
          title="Toggle Sound Effects"
          style={buttonStyle(isSfxMuted)}
          onClick={() => setIsSfxMuted(!isSfxMuted)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            {isSfxMuted && <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="2" />}
          </svg>
        </button>
        
        {/* Ocean Ambience Toggle */}
        <button 
          title="Toggle Ambient Sounds"
          style={buttonStyle(isOceanMuted)}
          onClick={() => setIsOceanMuted(!isOceanMuted)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12h4l2-2 4 4 4-4 4 4h4"></path>
            {isOceanMuted && <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="2" />}
          </svg>
        </button>
      </div>
  );
}
