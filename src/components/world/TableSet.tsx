import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useAppStore } from '../../store/useAppStore';


const ContactCard = () => {
  const isContactCardVisible = useAppStore(state => state.isContactCardVisible);
  const setIsContactFormOpen = useAppStore(state => state.setIsContactFormOpen);
  const cardRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!cardRef.current) return;
    
    if (isContactCardVisible) {
      if (cardRef.current.scale.x < 1) {
        cardRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), delta * 5);
      }
      // Lie flat on the table
      cardRef.current.position.y = 0.932;
    } else {
      cardRef.current.scale.set(0, 0, 0);
    }
  });

  return (
    <mesh 
      ref={cardRef} 
      position={[0.5, 0.932, -0.2]} 
      rotation={[0, 0, 0]}
      scale={[0, 0, 0]}
      onClick={(e) => {
        if (!isContactCardVisible) return;
        e.stopPropagation();
        setIsContactFormOpen(true);
      }}
      onPointerEnter={() => document.body.style.cursor = 'pointer'}
      onPointerLeave={() => document.body.style.cursor = 'auto'}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[0.1, 0.002, 0.06]} />
      {/* Glowing yellow material */}
      <meshStandardMaterial color="#fef08a" emissive="#eab308" emissiveIntensity={1.5} roughness={0.2} />
    </mesh>
  );
};

export const TableSet = ({ position = [40, 0, 50], rotation = [0, Math.PI / 2, 0] }: { position?: [number, number, number], rotation?: [number, number, number] }) => {
  const setSittingAtTable = useAppStore((state) => state.setSittingAtTable);
  const hasTeleported = useAppStore(state => state.hasTeleported);
  
  if (hasTeleported) return null;

  return (
    <group position={position} rotation={rotation}>
      <ContactCard />
      {/* Decorative Water Ripples instead of a wooden basement */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[2.5, 2.7, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.3} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[3.2, 3.3, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.15} depthWrite={false} />
      </mesh>

      {/* Realistic Picnic Table (Long length, narrow width) */}
      <group position={[0, 0, 0]}>
        {/* Table Top Planks */}
        <RigidBody type="fixed" colliders="cuboid" position={[0, 0.9, 0]}>
          <mesh receiveShadow castShadow>
            <boxGeometry args={[2.4, 0.06, 0.6]} />
            <meshStandardMaterial color="#8d6e63" roughness={0.8} />
          </mesh>
        </RigidBody>
        
        {/* Bench Left (Moved closer to Z = -0.6) */}
        <RigidBody type="fixed" colliders="cuboid" position={[0, 0.54, -0.6]}>
          <mesh receiveShadow castShadow>
            <boxGeometry args={[2.4, 0.06, 0.36]} />
            <meshStandardMaterial color="#8d6e63" roughness={0.8} />
          </mesh>
        </RigidBody>

        {/* Bench Right (Moved closer to Z = 0.6) */}
        <group>
          <RigidBody type="fixed" colliders="cuboid" position={[0, 0.54, 0.6]}>
            <mesh receiveShadow castShadow>
              <boxGeometry args={[2.4, 0.06, 0.36]} />
              <meshStandardMaterial color="#8d6e63" roughness={0.8} />
            </mesh>
          </RigidBody>
          
          {/* Invisible Trigger Zone for Sitting */}
          <RigidBody type="fixed" position={[0, 0.54, 0.6]}>
            <CuboidCollider 
              args={[2.0, 1.5, 2.0]} 
              sensor 
              onIntersectionEnter={() => setSittingAtTable(true)}
            />
          </RigidBody>
        </group>

        {/* A-Frame Legs Front */}
        <RigidBody type="fixed" position={[-0.96, 0.456, -0.2]} rotation={[0.4, 0, 0]}>
          <mesh receiveShadow castShadow><boxGeometry args={[0.12, 0.96, 0.12]} /><meshStandardMaterial color="#5d4037" /></mesh>
        </RigidBody>
        <RigidBody type="fixed" position={[-0.96, 0.456, 0.2]} rotation={[-0.4, 0, 0]}>
          <mesh receiveShadow castShadow><boxGeometry args={[0.12, 0.96, 0.12]} /><meshStandardMaterial color="#5d4037" /></mesh>
        </RigidBody>

        {/* A-Frame Legs Back */}
        <RigidBody type="fixed" position={[0.96, 0.456, -0.2]} rotation={[0.4, 0, 0]}>
          <mesh receiveShadow castShadow><boxGeometry args={[0.12, 0.96, 0.12]} /><meshStandardMaterial color="#5d4037" /></mesh>
        </RigidBody>
        <RigidBody type="fixed" position={[0.96, 0.456, 0.2]} rotation={[-0.4, 0, 0]}>
          <mesh receiveShadow castShadow><boxGeometry args={[0.12, 0.96, 0.12]} /><meshStandardMaterial color="#5d4037" /></mesh>
        </RigidBody>
        
        {/* Bench Supports connecting legs horizontally */}
        <RigidBody type="fixed" position={[-0.96, 0.42, 0]}>
          <mesh receiveShadow castShadow><boxGeometry args={[0.12, 0.06, 1.2]} /><meshStandardMaterial color="#5d4037" /></mesh>
        </RigidBody>
        <RigidBody type="fixed" position={[0.96, 0.42, 0]}>
          <mesh receiveShadow castShadow><boxGeometry args={[0.12, 0.06, 1.2]} /><meshStandardMaterial color="#5d4037" /></mesh>
        </RigidBody>
      </group>

    </group>
  );
};
