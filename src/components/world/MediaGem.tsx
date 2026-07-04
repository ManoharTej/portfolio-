import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';
import { Html } from '@react-three/drei';
import { FaLinkedin, FaGithub, FaFilePdf, FaEnvelope, FaTimes } from 'react-icons/fa';

const IconButton = ({ href, color, icon: Icon }: { href: string, color: string, icon: any }) => (
  <a 
    href={href} 
    target="_blank" 
    onClick={(e) => e.stopPropagation()} 
    style={{ 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '50px',
      height: '50px',
      color: color, 
      textDecoration: 'none', 
      background: 'rgba(30, 41, 59, 0.7)', 
      borderRadius: '50%', 
      border: `2px solid rgba(255,255,255,0.15)`,
      transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
      cursor: 'pointer',
      fontSize: '24px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'scale(1.1) translateY(-10px)';
      e.currentTarget.style.background = 'rgba(30, 41, 59, 0.9)';
      e.currentTarget.style.border = `2px solid ${color}`;
      e.currentTarget.style.boxShadow = `0 15px 40px ${color}66`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'scale(1) translateY(0)';
      e.currentTarget.style.background = 'rgba(30, 41, 59, 0.7)';
      e.currentTarget.style.border = `2px solid rgba(255,255,255,0.15)`;
      e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
    }}
  >
    <Icon />
  </a>
);

export const MediaGem = ({ position }: { position: [number, number, number] }) => {
  const crystalRef = useRef<THREE.Mesh>(null);
  
  const hasTeleported = useAppStore(state => state.hasTeleported);
  const isSocialModalOpen = useAppStore(state => state.isSocialModalOpen);
  const setIsSocialModalOpen = useAppStore(state => state.setIsSocialModalOpen);
  const currentQuestId = useAppStore(state => state.currentQuestId);
  const setCurrentHint = useAppStore(state => state.setCurrentHint);

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
          onClick={currentQuestId === 'go_to_media' ? (e) => {
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
