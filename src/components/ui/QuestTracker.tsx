import { useAppStore } from '../../store/useAppStore';
import { skillsData, toolsData, certsData } from '../../data/skillsData';

export function QuestTracker() {
  const currentQuestId = useAppStore(state => state.currentQuestId);
  const currentHint = useAppStore(state => state.currentHint);
  const isAutoWalking = useAppStore(state => state.isAutoWalking);
  const setIsAutoWalking = useAppStore(state => state.setIsAutoWalking);
  const viewedSkills = useAppStore(state => state.viewedSkills);
  const viewedTools = useAppStore(state => state.viewedTools);
  const viewedCerts = useAppStore(state => state.viewedCerts);
  const viewedProjects = useAppStore(state => state.viewedProjects);
  const isSittingAtTable = useAppStore(state => state.isSittingAtTable);
  
  // Hide when sitting at the bench, UNLESS the quest is about talking or the contact card
  if (isSittingAtTable && currentQuestId !== 'talk_to_avatar' && currentQuestId !== 'click_contact_card') return null;
  if (!currentQuestId && !currentHint) return null;

  let description = "";
  if (currentQuestId === 'go_to_skills') {
    if (viewedSkills.length < skillsData.length) {
      description = `Head to the wooden Skills Shelf and interact with the floating titles to view skills (${viewedSkills.length}/${skillsData.length}).`;
    } else if (viewedTools.length < toolsData.length) {
      description = `Great! Now click 'Tools & Tech' and view all items (${viewedTools.length}/${toolsData.length}).`;
    } else if (viewedCerts.length < certsData.length) {
      description = `Almost done! Click 'Certificates' and view all items (${viewedCerts.length}/${certsData.length}).`;
    } else {
      description = "All skills viewed! Advancing...";
    }
  } else if (currentQuestId === 'go_to_projects') {
    description = `Awesome! Now head over to the Project Board and scroll through all projects (${viewedProjects.length}/9).`;
  } else if (currentQuestId === 'go_to_media') {
    description = "Cross the wooden bridge and locate and click on the BLUE crystal gem to view social links.";
  } else if (currentQuestId === 'go_to_contact') {
    description = "Click the Contact button in the navigation bar to return to the bench.";
  } else if (currentQuestId === 'reach_bench') {
    description = "Wade through the water and reach the bench. Use W, A, S, D to walk and Space to jump.";
  } else if (currentQuestId === 'talk_to_avatar') {
    description = "You've reached the table! Click 'Ask Question' to speak to the AI clone.";
  } else if (currentQuestId === 'click_contact_card') {
    description = "Click the glowing yellow card on the table to view contact info.";
  } else if (currentQuestId === 'explore_island') {
    description = "Take your time and enjoy the scenery!";
  }

  return (
    <div style={{
      position: 'absolute',
      top: '190px', 
      right: '30px',
      width: '320px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      zIndex: 100,
      pointerEvents: 'auto',
    }}>
      {/* Main Quest Box */}
      <div style={{
        backgroundColor: 'rgba(30, 41, 59, 0.85)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderTop: '4px solid #38bdf8',
        borderRadius: '12px',
        padding: '16px',
        color: 'white',
        fontFamily: '"Outfit", "Inter", sans-serif',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{
          fontSize: '13px',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          color: '#7dd3fc',
          fontWeight: 800,
        }}>
          OBJECTIVE:
        </div>
        
        <div style={{
          fontSize: '14px',
          lineHeight: '1.5',
          color: '#f8fafc',
          minHeight: '42px'
        }}>
          {description}
        </div>

        {/* Auto-walk controls based on quest */}
        {currentQuestId && currentQuestId !== 'explore_island' && currentQuestId !== 'reach_bench' && currentQuestId !== 'talk_to_avatar' && currentQuestId !== 'go_to_contact' && (
          <button 
            onClick={() => {
              if (isAutoWalking) {
                setIsAutoWalking(false);
              } else {
                setIsAutoWalking(true);
              }
            }}
            style={{
              marginTop: '6px',
              padding: '6px 12px',
              backgroundColor: isAutoWalking ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.2)',
              border: `1px solid ${isAutoWalking ? '#ef4444' : '#38bdf8'}`,
              borderRadius: '16px',
              color: isAutoWalking ? '#ef4444' : '#38bdf8',
              fontFamily: '"Outfit", sans-serif',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              alignSelf: 'flex-end'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = isAutoWalking ? 'rgba(239, 68, 68, 0.4)' : 'rgba(56, 189, 248, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = isAutoWalking ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.2)';
            }}
          >
            {isAutoWalking ? "CANCEL AUTO-WALK" : "▶ GO TO OBJECTIVE"}
          </button>
        )}
      </div>

      {/* Dynamic Hint Popups */}
      {currentHint && (
        <div 
          style={{
            width: '100%',
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            backdropFilter: 'blur(12px)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '12px',
            fontFamily: '"Outfit", "Inter", sans-serif',
            fontSize: '14px',
            fontWeight: 700,
            boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3)',
            animation: 'pulseGlow 2s infinite',
          }}
        >
          ⚠️ {currentHint}
        </div>
      )}
    </div>
  );
}
