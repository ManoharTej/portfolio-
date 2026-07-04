import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';

export const MediaGem = ({ position }: { position: [number, number, number] }) => {
  const crystalRef = useRef<THREE.Mesh>(null);
  
  const hasTeleported = useAppStore(state => state.hasTeleported);
  const currentQuestId = useAppStore(state => state.currentQuestId);

  useFrame(() => {
    if (crystalRef.current) {
      // Just keep it simple or remove animation since it's invisible
    }
  });

  if (!hasTeleported) return null;

  return (
    <group position={position}>
      <group position={[0, 1.0, 0]} ref={crystalRef}>
        <mesh 
          castShadow
          onClick={currentQuestId === 'go_to_media' ? () => {
            // Let the event bubble down to the actual crystal mesh in FloatingIsland to trigger the UI!
          } : undefined}
          onPointerOver={currentQuestId === 'go_to_media' ? (e) => {
            const pPos = (window as any).characterPosition;
            if (pPos) {
              const crystalWorldPos = new THREE.Vector3();
              e.object.getWorldPosition(crystalWorldPos);
              if (crystalWorldPos.distanceTo(pPos) < 4.5) {
                document.body.style.cursor = 'pointer';
              }
            }
          } : undefined}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          <boxGeometry args={[4, 6, 4]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      </group>
    </group>
  );
};
