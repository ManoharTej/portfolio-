import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';

export function ObjectiveWaypoint() {
  const currentQuestId = useAppStore(state => state.currentQuestId);
  const focusedShelfTier = useAppStore(state => state.focusedShelfTier);
  const groupRef = useRef<THREE.Group>(null);
  const [distance, setDistance] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useFrame((state) => {
    // Determine target based on quest
    let show = true;
    let tPos = new THREE.Vector3();

    if (!useAppStore.getState().isCameraDropComplete || currentQuestId === 'explore_island' || currentQuestId === 'talk_to_avatar' || focusedShelfTier) {
      show = false;
    } else if (currentQuestId === 'reach_bench') {
      tPos.set(39.4, 2.5, 49.7);
    } else if (currentQuestId === 'go_to_skills') {
      tPos.set(9, 48.0, -9);
    } else if (currentQuestId === 'go_to_projects') {
      tPos.set(38.84, 41.0, -3.0);
    } else if (currentQuestId === 'go_to_media') {
      tPos.set(18.21, 46.0, -32.42);
    } else {
      show = false;
    }

    if (isVisible !== show) setIsVisible(show);

    if (groupRef.current) {
      groupRef.current.visible = show;
      if (!show) return;

      groupRef.current.position.copy(tPos);
      // Bouncing animation
      groupRef.current.position.y = tPos.y + Math.sin(state.clock.elapsedTime * 4) * 0.2;
      groupRef.current.rotation.y += 0.02;

      // Calculate distance to player
      if ((window as any).characterPosition) {
        const pPos = (window as any).characterPosition;
        const dist = Math.floor(tPos.distanceTo(new THREE.Vector3(pPos.x, pPos.y, pPos.z)));
        if (dist !== distance) {
          setDistance(dist);
        }
      }
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      {isVisible && (
        <>
          {/* Distance Label */}
          <Html position={[0, 0.6, 0]} center style={{ pointerEvents: 'none' }}>
            <div style={{
              backgroundColor: 'rgba(2, 6, 23, 0.9)',
              backdropFilter: 'blur(2px)',
              padding: '2px 6px',
              borderRadius: '12px',
              border: '1px solid #1e293b',
              color: '#94a3b8',
              fontFamily: '"Outfit", sans-serif',
              fontWeight: 700,
              fontSize: '10px',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.8)'
            }}>
              <span>⬇</span>
              <span>{distance}m</span>
            </div>
          </Html>
        </>
      )}
    </group>
  );
}
