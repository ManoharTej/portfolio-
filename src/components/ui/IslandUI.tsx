import { useAppStore } from '../../store/useAppStore';

export function IslandNavbar() {
  const hasTeleported = useAppStore(state => state.hasTeleported);
  const currentQuestId = useAppStore(state => state.currentQuestId);
  const setCurrentQuestId = useAppStore(state => state.setCurrentQuestId);

  if (!hasTeleported) return null;

  const handleNavClick = (questId: 'go_to_skills' | 'go_to_projects' | 'go_to_media') => {
    setCurrentQuestId(questId);
    // Use a slight timeout so it overrides the default safety mechanism 
    // in UserVRM that disables auto-walk when the quest ID changes.
    setTimeout(() => {
      useAppStore.getState().setIsAutoWalking(true);
    }, 50);
  };

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '24px',
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(56, 189, 248, 0.3)',
      borderRadius: '30px',
      padding: '12px 32px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      zIndex: 100,
      pointerEvents: 'auto'
    }}>
      {[
        { label: 'Introduction', quest: 'talk_to_avatar' },
        { label: 'Skills', quest: 'go_to_skills' },
        { label: 'Projects', quest: 'go_to_projects' },
        { label: 'Social Media', quest: 'go_to_media' },
        { label: 'Contact', quest: 'go_to_media' }
      ].map((item) => (
        <button
          key={item.label}
          onClick={() => {
            if (item.label === 'Contact') {
              const pos = (window as any).characterPosition;
              if (pos) {
                useAppStore.getState().triggerReturnTeleport([pos.x, pos.y, pos.z]);
              }
            } else if (item.quest !== 'talk_to_avatar') {
              handleNavClick(item.quest as any);
            }
          }}
          style={{
            background: 'none',
            border: 'none',
            color: currentQuestId === item.quest ? '#38bdf8' : '#e2e8f0',
            fontFamily: '"Outfit", sans-serif',
            fontSize: '16px',
            fontWeight: currentQuestId === item.quest ? 700 : 500,
            cursor: 'pointer',
            padding: '4px 8px',
            transition: 'all 0.2s',
            textShadow: currentQuestId === item.quest ? '0 0 10px rgba(56, 189, 248, 0.6)' : 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#38bdf8';
          }}
          onMouseLeave={(e) => {
            if (currentQuestId !== item.quest) e.currentTarget.style.color = '#e2e8f0';
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function SocialModal() {
  const isSocialModalOpen = useAppStore(state => state.isSocialModalOpen);
  const setIsSocialModalOpen = useAppStore(state => state.setIsSocialModalOpen);

  if (!isSocialModalOpen) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999999,
      pointerEvents: 'auto'
    }}>
      <div style={{
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        borderTop: '3px solid #38bdf8',
        borderRadius: '16px',
        padding: '40px',
        width: '400px',
        textAlign: 'center',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)'
      }}>
        <h2 style={{
          fontFamily: '"Outfit", sans-serif',
          color: '#e0f2fe',
          fontSize: '28px',
          margin: '0 0 32px 0',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          textShadow: '0 2px 10px rgba(56, 189, 248, 0.5)'
        }}>
          Connect with Me
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '20px' }}>
          {[
            {
              name: 'GitHub',
              url: 'https://github.com/manohar',
              svg: <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            },
            {
              name: 'LinkedIn',
              url: 'https://linkedin.com/in/manohar',
              svg: <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            },
            {
              name: 'Twitter',
              url: 'https://twitter.com/manohar',
              svg: <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            },
            {
              name: 'Email',
              url: 'mailto:manohar@example.com',
              svg: <path d="M12 12.713l11.985-8.713h-23.97l11.985 8.713zm0 2.574l-12-8.727v11.44h24v-11.44l-12 8.727z"/>
            }
          ].map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '60px',
                height: '60px',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#7dd3fc',
                borderRadius: '50%',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.25)';
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(56, 189, 248, 0.3)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.1)';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.color = '#7dd3fc';
              }}
              title={social.name}
            >
              <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                {social.svg}
              </svg>
            </a>
          ))}
        </div>

        <button
          onClick={() => setIsSocialModalOpen(false)}
          style={{
            marginTop: '32px',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#ef4444',
            fontFamily: '"Outfit", sans-serif',
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
            padding: '8px 16px',
          }}
          onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
          onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}
