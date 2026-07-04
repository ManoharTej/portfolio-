import { useRef, Suspense, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, Svg, Center } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';
import { skillsData, toolsData, certsData } from '../../data/skillsData';
import type { ItemProps } from '../../data/skillsData';

// New InfoScreen Component
const InfoScreen = ({ position, item }: { position: [number, number, number], item: ItemProps }) => {
  const groupRef = useRef<THREE.Group>(null);
  const animTime = useRef(0);

  useEffect(() => {
    animTime.current = 1.0;
  }, [item]);

  useFrame((_, delta) => {
    if (animTime.current > 0 && groupRef.current) {
      animTime.current = Math.max(0, animTime.current - delta * 5); // 0.2s animation
      const pop = Math.sin(animTime.current * Math.PI); // 0 -> 1 -> 0
      groupRef.current.scale.setScalar(1.0 + (pop * 0.15));
    }
  });

  return (
    <group position={position} ref={groupRef}>
      {/* Screen Monitor Body */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[2.2, 1.2, 0.1]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>
      
      {/* Screen Display Area */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[2.1, 1.1]} />
        <meshBasicMaterial color="#020617" />
      </mesh>

      {/* Content */}
      <Text position={[0, 0.38, 0.02]} fontSize={0.15} color="#38bdf8" anchorX="center" anchorY="middle" fontWeight="bold">
        {item.title}
      </Text>
      
      <Text 
        position={[0, 0.20, 0.02]} 
        fontSize={0.10} 
        color="#e2e8f0" 
        anchorX="center" 
        anchorY="top"
        maxWidth={1.9}
        textAlign="center"
        lineHeight={1.4}
      >
        {item.description}
      </Text>
    </group>
  );
};

const GlassAward = ({ position, item }: { position: [number, number, number], item: ItemProps }) => {
  const meshRef = useRef<THREE.Group>(null);
  const animTime = useRef(0);

  useEffect(() => {
    animTime.current = 1.0;
  }, [item]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      
      if (animTime.current > 0) {
        animTime.current = Math.max(0, animTime.current - delta * 5); // 0.2s animation
        const pop = Math.sin(animTime.current * Math.PI); // 0 -> 1 -> 0
        meshRef.current.scale.setScalar(1.0 + (pop * 0.2));
        // Add a quick spin on change
        meshRef.current.rotation.y += (animTime.current * Math.PI * 0.5);
      } else {
        meshRef.current.scale.setScalar(1.0);
      }
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2} floatingRange={[-0.05, 0.05]}>
      <group position={position} ref={meshRef}>
        <mesh>
          <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} /> 
        </mesh>
        
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
          <meshPhysicalMaterial 
            transparent 
            opacity={0.3} 
            roughness={0.1} 
            metalness={0.9} 
            clearcoat={1}
            clearcoatRoughness={0.1}
            color="#a5f3fc"
          />
        </mesh>

        {item.isTextBased ? (
          <Text 
            position={[0, 0, 0.06]} 
            fontSize={0.14} 
            color="#ffffff" 
            anchorX="center" 
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            {item.title}
          </Text>
        ) : (
          <Suspense fallback={null}>
            <Center position={[0, 0, 0.055]}>
              <Svg src={item.iconUrl!} scale={0.0035} />
            </Center>
          </Suspense>
        )}
      </group>
    </Float>
  );
};

export const SkillsShelf = ({ position, rotation }: { position: [number, number, number], rotation?: [number, number, number] }) => {
  const activeShelfItems = useAppStore(state => state.activeShelfItems);
  const setFocusedShelfTier = useAppStore(state => state.setFocusedShelfTier);
  const handleTierClick = (tier: 'skills' | 'tools' | 'certs') => {
    setFocusedShelfTier(tier);
    if (tier === 'skills') useAppStore.getState().setViewedSkill(activeShelfItems.skills);
    if (tier === 'tools') useAppStore.getState().setViewedTool(activeShelfItems.tools);
    if (tier === 'certs') useAppStore.getState().setViewedCert(activeShelfItems.certs);
  };

  return (
    <group position={position} rotation={rotation ? new THREE.Euler(...rotation) : undefined} scale={[0.4, 0.4, 0.4]}>
      {/* Wooden Shelf Body */}
      {/* Back */}
      <mesh position={[0, 3.5, -0.5]}>
        <boxGeometry args={[4.8, 6.5, 0.2]} />
        <meshStandardMaterial color="#5C3A21" roughness={0.9} />
      </mesh>
      {/* Left Side */}
      <mesh position={[-2.3, 3.5, 0.1]}>
        <boxGeometry args={[0.2, 6.5, 1.0]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      {/* Right Side */}
      <mesh position={[2.3, 3.5, 0.1]}>
        <boxGeometry args={[0.2, 6.5, 1.0]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      {/* Top */}
      <mesh position={[0, 6.65, 0]}>
        <boxGeometry args={[4.8, 0.2, 1.2]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[4.8, 0.2, 1.2]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>

      {/* TIER 1: CORE SKILLS */}
      <group onClick={(e) => { e.stopPropagation(); handleTierClick('skills'); }}>
        <Text position={[0, 6.0, 0.2]} fontSize={0.25} color="#fbd38d" anchorX="center" anchorY="middle" outlineWidth={0.01}>
          Core Skills
        </Text>
        <GlassAward position={[-1.3, 5.2, 0.3]} item={skillsData[activeShelfItems.skills]} />
        <InfoScreen position={[0.8, 5.2, 0.3]} item={skillsData[activeShelfItems.skills]} />
      </group>
      <mesh position={[0, 4.4, 0.1]}><boxGeometry args={[4.4, 0.1, 1.0]} /><meshStandardMaterial color="#A0522D" /></mesh>

      {/* TIER 2: TOOLS */}
      <group onClick={(e) => { e.stopPropagation(); handleTierClick('tools'); }}>
        <Text position={[0, 4.1, 0.2]} fontSize={0.25} color="#fbd38d" anchorX="center" anchorY="middle" outlineWidth={0.01}>
          Tools & Tech
        </Text>
        <GlassAward position={[-1.3, 3.3, 0.3]} item={toolsData[activeShelfItems.tools]} />
        <InfoScreen position={[0.8, 3.3, 0.3]} item={toolsData[activeShelfItems.tools]} />
      </group>
      <mesh position={[0, 2.5, 0.1]}><boxGeometry args={[4.4, 0.1, 1.0]} /><meshStandardMaterial color="#A0522D" /></mesh>

      {/* TIER 3: CERTIFICATES */}
      <group onClick={(e) => { e.stopPropagation(); handleTierClick('certs'); }}>
        <Text position={[0, 2.2, 0.2]} fontSize={0.25} color="#fbd38d" anchorX="center" anchorY="middle" outlineWidth={0.01}>
          Certificates
        </Text>
        <GlassAward position={[-1.3, 1.4, 0.3]} item={certsData[activeShelfItems.certs]} />
        <InfoScreen position={[0.8, 1.4, 0.3]} item={certsData[activeShelfItems.certs]} />
      </group>

    </group>
  );
};
