import { Canvas } from '@react-three/fiber';
import { Suspense, useMemo, useEffect } from 'react';
import { Ocean } from './components/world/Ocean';
import { Sky } from './components/world/Sky';
import { KeyboardControls } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { UserVRM } from './components/characters/UserVRM';
import { CameraController } from './components/world/CameraController';
import { WaterEffects } from './components/world/WaterEffects';
import { FloatingIsland } from './components/world/FloatingIsland';
import { BlankBoard } from './components/world/BlankBoard';
import { Bridge } from './components/world/Bridge';
import { TableSet } from './components/world/TableSet';
import { Birds } from './components/world/Birds';
import { SkillsShelf } from './components/world/SkillsShelf';
import { TeleportBeam } from './components/world/TeleportBeam';
import { ReturnTeleportBeam } from './components/world/ReturnTeleportBeam';
import { ObjectiveWaypoint } from './components/world/ObjectiveWaypoint';
import { useAppStore } from './store/useAppStore';
import { AskQuestionModal } from './components/ui/AskQuestionModal';
import { WelcomeScreen } from './components/ui/WelcomeScreen';
import { GameHUD } from './components/ui/GameHUD';
import { DBVRM } from './components/characters/DBVRM';
import { skillsData, toolsData, certsData } from './data/skillsData';
import { MediaGem } from './components/world/MediaGem';
import { ContactFormUI } from './components/ui/ContactFormUI';
import { EndScreenUI } from './components/ui/EndScreenUI';

import { Controls } from './controls';

// Keyframe animation for glowing button
const glowAnimation = `
  @keyframes pulseGlow {
    0% { box-shadow: 0 0 10px rgba(56, 189, 248, 0.4), inset 0 0 10px rgba(255,255,255,0.1); transform: scale(1); }
    50% { box-shadow: 0 0 30px rgba(56, 189, 248, 0.9), inset 0 0 20px rgba(255,255,255,0.3); transform: scale(1.05); }
    100% { box-shadow: 0 0 10px rgba(56, 189, 248, 0.4), inset 0 0 10px rgba(255,255,255,0.1); transform: scale(1); }
  }
`;

const App = () => {
  const currentSubtitle = useAppStore(state => state.currentSubtitle);
  const isIntroFinished = useAppStore(state => state.isIntroFinished);
  const isContactCardVisible = useAppStore(state => state.isContactCardVisible);
  const setIsIntroFinished = useAppStore(state => state.setIsIntroFinished);
  const isSittingAtTable = useAppStore(state => state.isSittingAtTable);
  const setIsAskQuestionModalOpen = useAppStore(state => state.setIsAskQuestionModalOpen);
  const isTeleporting = useAppStore(state => state.isTeleporting);
  const setIsTeleporting = useAppStore(state => state.setIsTeleporting);
  const hasTeleported = useAppStore(state => state.hasTeleported);
  const setHasTeleported = useAppStore(state => state.setHasTeleported);
  const setSittingAtTable = useAppStore(state => state.setSittingAtTable);
  const focusedShelfTier = useAppStore(state => state.focusedShelfTier);
  const setFocusedShelfTier = useAppStore(state => state.setFocusedShelfTier);
  const nextShelfItem = useAppStore(state => state.nextShelfItem);
  const prevShelfItem = useAppStore(state => state.prevShelfItem);
  const currentQuestId = useAppStore(state => state.currentQuestId);
  const activeShelfItems = useAppStore(state => state.activeShelfItems);
  const viewedProjects = useAppStore(state => state.viewedProjects);
  const viewedSkills = useAppStore(state => state.viewedSkills);
  const viewedTools = useAppStore(state => state.viewedTools);
  const viewedCerts = useAppStore(state => state.viewedCerts);
  const setCurrentQuestId = useAppStore(state => state.setCurrentQuestId);

  // Track if all projects are viewed
  useEffect(() => {
    if (currentQuestId === 'go_to_projects' && viewedProjects.length >= 9) {
      setCurrentQuestId('go_to_media');
      
      // Auto close the board zoom after 15 seconds if they don't close it themselves
      const timer = setTimeout(() => {
        if (useAppStore.getState().focusedShelfTier === 'board') {
          useAppStore.getState().setFocusedShelfTier(null);
        }
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [currentQuestId, viewedProjects.length, setCurrentQuestId]);

  // Track if all skills are viewed
  useEffect(() => {
    if (currentQuestId === 'go_to_skills') {
      if (viewedSkills.length >= skillsData.length &&
          viewedTools.length >= toolsData.length &&
          viewedCerts.length >= certsData.length) {
          setCurrentQuestId('go_to_projects');
          useAppStore.getState().setFocusedShelfTier(null); // Auto close
      }
    }
  }, [currentQuestId, viewedSkills.length, viewedTools.length, viewedCerts.length, setCurrentQuestId]);

  const currentItemIndex = focusedShelfTier ? activeShelfItems[focusedShelfTier] : 0;
  let maxItems = 0;
  if (focusedShelfTier === 'skills') maxItems = skillsData.length;
  if (focusedShelfTier === 'tools') maxItems = toolsData.length;
  if (focusedShelfTier === 'certs') maxItems = certsData.length;
  if (focusedShelfTier === 'board') maxItems = 9;
  
  const isAtStart = currentItemIndex === 0;
  const isAtEnd = currentItemIndex === maxItems - 1;

  const handleNextShelfItem = () => {
    if (focusedShelfTier === 'skills') {
      nextShelfItem('skills', skillsData.length);
      const newIndex = (activeShelfItems.skills + 1) % skillsData.length;
      useAppStore.getState().setViewedSkill(newIndex);
    }
    if (focusedShelfTier === 'tools') {
      nextShelfItem('tools', toolsData.length);
      const newIndex = (activeShelfItems.tools + 1) % toolsData.length;
      useAppStore.getState().setViewedTool(newIndex);
    }
    if (focusedShelfTier === 'certs') {
      nextShelfItem('certs', certsData.length);
      const newIndex = (activeShelfItems.certs + 1) % certsData.length;
      useAppStore.getState().setViewedCert(newIndex);
    }
    if (focusedShelfTier === 'board') {
      nextShelfItem('board', 9);
      const newIndex = Math.min(activeShelfItems.board + 1, 8);
      useAppStore.getState().setViewedProject(newIndex);
    }
  };

  const handlePrevShelfItem = () => {
    if (focusedShelfTier === 'skills') {
      prevShelfItem('skills', skillsData.length);
      const newIndex = (activeShelfItems.skills - 1 + skillsData.length) % skillsData.length;
      useAppStore.getState().setViewedSkill(newIndex);
    }
    if (focusedShelfTier === 'tools') {
      prevShelfItem('tools', toolsData.length);
      const newIndex = (activeShelfItems.tools - 1 + toolsData.length) % toolsData.length;
      useAppStore.getState().setViewedTool(newIndex);
    }
    if (focusedShelfTier === 'certs') {
      prevShelfItem('certs', certsData.length);
      const newIndex = (activeShelfItems.certs - 1 + certsData.length) % certsData.length;
      useAppStore.getState().setViewedCert(newIndex);
    }
    if (focusedShelfTier === 'board') {
      prevShelfItem('board', 9);
      const newIndex = Math.max(activeShelfItems.board - 1, 0);
      useAppStore.getState().setViewedProject(newIndex);
    }
  };
  
  const map = useMemo(() => [
    { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
    { name: Controls.backward, keys: ['ArrowDown', 'KeyS'] },
    { name: Controls.leftward, keys: ['ArrowLeft', 'KeyA'] },
    { name: Controls.rightward, keys: ['ArrowRight', 'KeyD'] },
    { name: Controls.jump, keys: ['Space'] },
    { name: Controls.run, keys: ['Shift'] },
  ], []);

  // Handle the screen flash and teleport logic
  useMemo(() => {
    if (isTeleporting) {
      setTimeout(() => {
        setHasTeleported(true);
        setSittingAtTable(false); // Unmount the table player and switch to exploration
      }, 50); // Instantly switch to trigger camera flight and beam
    }
  }, [isTeleporting, setHasTeleported, setSittingAtTable]);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <KeyboardControls map={map}>
        <Canvas
          shadows
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          camera={{
            position: [4.84, 10.00, -11.87],
            fov: 60,
            near: 0.5,
            far: 20000,
          }}
          onPointerMissed={() => useAppStore.getState().setCrystalFocusPoint(null)}
          onCreated={({ gl }) => {
            gl.toneMapping = 4; // ACESFilmicToneMapping
            gl.toneMappingExposure = 1.3;
          }}
          dpr={[1, 2]}
        >
          {/* Atmospheric Anime Fog */}
          <fog attach="fog" args={['#8fb8ed', 100, 15000]} />

          <Suspense fallback={null}>
            <ambientLight intensity={0.9} color="#ffffff" />
            <directionalLight position={[0.2, 0.5, -0.95]} intensity={1.2} color="#ffffff" castShadow />

            {/* NORMAL CONTROLS ARE BACK */}
            <CameraController />

            <Physics timeStep="vary">
              <Sky />
              <Ocean />
              <WaterEffects />
              <FloatingIsland />
              <BlankBoard position={[38.84, 38.24, -3.0]} rotation={[0, Math.PI, 0]} scale={0.9} />
              <Bridge />
              <Birds />
              <TableSet />
              
              {/* The Skills & Awards Shelf placed away from bamboo */}
              <SkillsShelf position={[9, 45, -9]} rotation={[0, -Math.PI / 4, 0]} />

              <TeleportBeam position={[5, 45, -10]} />
              <ReturnTeleportBeam />
              <MediaGem position={[18.21, 44.0, -32.42]} />
              <ObjectiveWaypoint />

              {/* Character is fully playable again */}
              <UserVRM 
                url="/user.vrm" 
                position={[40, 5.00, 100]}
                isPlayable={true}
                isSitting={false}
              />
              
              {/* DBVRM is always mounted to prevent lag spikes. 
                  It starts at the table [39.4, 0.4, 49.75] and teleports to the island [2, 45, -12] */}
              <DBVRM 
                position={hasTeleported ? [2, 45, -12] : [39.4, 0.4, 49.75]} 
                rotation={hasTeleported ? [0, Math.PI / 4, 0] : [0, Math.PI / 2, 0]} 
                scale={hasTeleported ? 1.5 : 1.15} 
              />

              {/* Ocean walking floor at water surface level */}
              <RigidBody type="fixed" position={[0, -0.5, 0]}>
                <mesh>
                  <boxGeometry args={[10000, 1, 10000]} />
                  <meshBasicMaterial transparent opacity={0} depthWrite={false} />
                </mesh>
              </RigidBody>

              {/* Fallback bottom floor */}
              <RigidBody type="fixed" position={[0, -50.3, 0]}>
                <mesh>
                  <boxGeometry args={[10000, 100, 10000]} />
                  <meshBasicMaterial color="red" transparent opacity={0} depthWrite={false} />
                </mesh>
              </RigidBody>
            </Physics>
          </Suspense>
        </Canvas>
      </KeyboardControls>

      {/* 2D Subtitles Overlay */}
      {currentSubtitle && (
        <div style={{
          position: 'absolute',
          bottom: '8%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          padding: '12px 24px',
          borderRadius: '8px',
          color: 'white',
          fontFamily: '"Inter", sans-serif',
          fontSize: '22px',
          fontWeight: 500,
          textAlign: 'center',
          maxWidth: '80%',
          textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
          pointerEvents: 'none',
          zIndex: 99999999,
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <span style={{ color: '#60A5FA', fontWeight: 700, marginRight: '10px' }}>Manohar:</span>
          {currentSubtitle}
        </div>
      )}

      {/* Contact Form Overlay */}
      <ContactFormUI />
      
      {/* End Screen Overlay */}
      <EndScreenUI />

      {/* UI Overlay for Question and Navigation */}
      {isSittingAtTable && !hasTeleported && (
        <div style={{
          position: 'absolute',
          bottom: '12%',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          pointerEvents: currentSubtitle || !isIntroFinished || isContactCardVisible ? 'none' : 'auto',
          opacity: currentSubtitle || !isIntroFinished || isContactCardVisible ? 0 : 1, // Hide when talking, intro isn't done, or contact card is visible
          transition: 'opacity 0.3s ease',
          zIndex: 99999990
        }}>
          <button 
            onClick={() => setIsAskQuestionModalOpen(true)}
            style={{
              padding: '14px 28px',
              fontSize: '16px',
              fontFamily: '"Outfit", "Inter", sans-serif',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '30px',
              backdropFilter: 'blur(12px)',
              boxShadow: currentQuestId === 'talk_to_avatar' 
                ? '0 0 20px rgba(56, 189, 248, 0.8), inset 0 0 10px rgba(255,255,255,0.2)' 
                : '0 8px 32px rgba(31, 38, 135, 0.2), inset 0 0 10px rgba(255,255,255,0.1)',
              animation: currentQuestId === 'talk_to_avatar' ? 'pulseGlow 2s infinite' : 'none',
              transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            }}
            onMouseOver={(e) => {
              if (currentQuestId !== 'talk_to_avatar') {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(31, 38, 135, 0.3), inset 0 0 15px rgba(255,255,255,0.2)';
              }
            }}
            onMouseOut={(e) => {
              if (currentQuestId !== 'talk_to_avatar') {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(31, 38, 135, 0.2), inset 0 0 10px rgba(255,255,255,0.1)';
              }
            }}
          >
            Ask Question
          </button>

          <button 
            onClick={() => setIsIntroFinished(false)}
            style={{
              padding: '14px 28px',
              fontSize: '16px',
              fontFamily: '"Outfit", "Inter", sans-serif',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              color: '#d1d5db',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '30px',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
              e.currentTarget.style.color = '#d1d5db';
              e.currentTarget.style.transform = 'translateY(0px)';
            }}
          >
            Repeat Intro
          </button>

          <button 
            onClick={() => {
              setIsTeleporting(true);
              useAppStore.getState().setCurrentQuestId('explore_island');
            }}
            style={{
              padding: '14px 28px',
              fontSize: '16px',
              fontFamily: '"Outfit", "Inter", sans-serif',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              backgroundColor: 'rgba(56, 189, 248, 0.8)',
              color: 'white',
              border: '1px solid rgba(56, 189, 248, 0.8)',
              borderRadius: '30px',
              backdropFilter: 'blur(12px)',
              boxShadow: currentQuestId === 'talk_to_avatar' 
                ? '0 0 20px rgba(56, 189, 248, 0.8), inset 0 0 10px rgba(255,255,255,0.2)' 
                : '0 8px 32px rgba(31, 38, 135, 0.2), inset 0 0 10px rgba(255,255,255,0.1)',
              animation: currentQuestId === 'talk_to_avatar' ? 'pulseGlow 2s infinite' : 'none',
              transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(31, 38, 135, 0.3), inset 0 0 15px rgba(255,255,255,0.2)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.8)';
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(31, 38, 135, 0.2), inset 0 0 10px rgba(255,255,255,0.1)';
            }}
          >
            Explore World
          </button>
        </div>
      )}

      {/* Skip Intro Button */}
      {!isIntroFinished && isSittingAtTable && (
        <button
          onClick={() => {
            setIsIntroFinished(true);
          }}
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '40px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.2)',
            padding: '12px 28px',
            borderRadius: '30px',
            fontSize: '16px',
            fontFamily: '"Outfit", "Inter", sans-serif',
            fontWeight: 700,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            zIndex: 99999999
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(255,255,255,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)';
          }}
        >
          Skip Intro
        </button>
      )}

      {/* Exit Zoom Button */}
      {focusedShelfTier && (
        <button
          onClick={() => setFocusedShelfTier(null)}
          style={{
            position: 'absolute',
            top: '40px',
            right: '40px',
            backgroundColor: '#0f172a',
            backdropFilter: 'blur(12px)',
            color: '#ef4444',
            border: '2px solid #ef4444',
            padding: '12px 28px',
            borderRadius: '30px',
            fontSize: '18px',
            fontFamily: '"Outfit", "Inter", sans-serif',
            fontWeight: 900,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 15px rgba(239,68,68,0.4)',
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            zIndex: 99999999
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(239, 68, 68, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.backgroundColor = '#0f172a';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.5), 0 0 15px rgba(239,68,68,0.4)';
          }}
        >
          X
        </button>
      )}

      {/* 2D Shelf Navigation Buttons */}
      {focusedShelfTier && (
        <div style={{
          position: 'absolute',
          bottom: '40px',
          right: '40px',
          display: 'flex',
          gap: '20px',
          zIndex: 99999999
        }}>
          <button
            onClick={handlePrevShelfItem}
            disabled={isAtStart}
            style={{
              width: '60px',
              height: '60px',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              backdropFilter: 'blur(12px)',
              color: '#38bdf8',
              border: '2px solid rgba(56, 189, 248, 0.5)',
              borderRadius: '50%',
              fontSize: '28px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isAtStart ? 'not-allowed' : 'pointer',
              opacity: isAtStart ? 0.4 : 1,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 15px rgba(56,189,248,0.2)',
              transition: 'all 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => {
              if (isAtStart) return;
              e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 1)';
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(56, 189, 248, 0.4)';
            }}
            onMouseLeave={(e) => {
              if (isAtStart) return;
              e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4), 0 0 15px rgba(56,189,248,0.2)';
            }}
          >
            &lt;
          </button>
          
          <button
            onClick={handleNextShelfItem}
            disabled={isAtEnd}
            style={{
              width: '60px',
              height: '60px',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              backdropFilter: 'blur(12px)',
              color: '#38bdf8',
              border: '2px solid rgba(56, 189, 248, 0.5)',
              borderRadius: '50%',
              fontSize: '28px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isAtEnd ? 'not-allowed' : 'pointer',
              opacity: isAtEnd ? 0.4 : 1,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 15px rgba(56,189,248,0.2)',
              transition: 'all 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => {
              if (isAtEnd) return;
              e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 1)';
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(56, 189, 248, 0.4)';
            }}
            onMouseLeave={(e) => {
              if (isAtEnd) return;
              e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4), 0 0 15px rgba(56,189,248,0.2)';
            }}
          >
            &gt;
          </button>
        </div>
      )}

      {/* Ask Question Modal */}
      <AskQuestionModal />


      {/* Main Game HUD */}
      <GameHUD />

      {/* Cinematic Welcome Screen & Form overlay */}
      <WelcomeScreen />
      
      {/* Inject Keyframe Styles */}
      <style>{glowAnimation}</style>
    </div>
  );
};

export default App;
