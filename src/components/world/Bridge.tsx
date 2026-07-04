import * as THREE from 'three';
import { useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';

export const Bridge = () => {
  const { planks } = useMemo(() => {
    // Raised the heights to match the top of the grass so it doesn't smash into the rock cliff!
    // (Lowered by 40 to match the massive island placement!)
    const ropeStart = new THREE.Vector3(5.43, 46.4, -11.34); 
    const ropeEnd = new THREE.Vector3(18.21, 43.0, -32.42); 
    
    const distance = ropeStart.distanceTo(ropeEnd);
    const totalPlanks = Math.floor(distance * 1.5);
    const sag = 2.0; // Matches the curve of the giant rope
    
    const planksData = [];
    
    // Adjusted indices to add the missing planks back so it perfectly touches the grass on both sides!
    const startIdx = Math.floor(totalPlanks * 0.18); 
    const endIdx = Math.floor(totalPlanks * 0.77);
    
    for (let i = startIdx; i <= endIdx; i++) {
      const t = i / totalPlanks;
      const nextT = Math.min(1, (i + 1) / totalPlanks);
      
      const getPos = (ratio: number) => {
        const pos = ropeStart.clone().lerp(ropeEnd, ratio);
        pos.y -= 4 * sag * ratio * (1 - ratio);
        return pos;
      };
      
      const pos = getPos(t);
      const nextPos = getPos(nextT);
      
      const obj = new THREE.Object3D();
      obj.position.copy(pos);
      if (i < totalPlanks) {
        obj.lookAt(nextPos);
      } else {
        const prevPos = getPos((i - 1) / totalPlanks);
        obj.position.copy(prevPos);
        obj.lookAt(pos);
        obj.position.copy(pos);
      }
      
      planksData.push({
        position: [pos.x, pos.y, pos.z] as [number, number, number],
        rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z] as [number, number, number],
      });
    }
    
    return { planks: planksData };
  }, []);

  return (
    <group>
      {planks.map((plank, i) => (
        <RigidBody key={i} type="fixed" colliders="cuboid" position={plank.position} rotation={plank.rotation}>
          {/* Wooden Plank - narrower to match the rope aesthetic */}
          <mesh receiveShadow castShadow>
            <boxGeometry args={[1.5, 0.1, 0.6]} />
            <meshStandardMaterial color="#6b4423" roughness={1.0} />
          </mesh>
          
          {/* Left Rope Handrail */}
          <mesh position={[-0.7, 0.6, 0]} receiveShadow castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.65]} />
            <meshStandardMaterial color="#d4a373" roughness={0.9} />
          </mesh>
          {/* Right Rope Handrail */}
          <mesh position={[0.7, 0.6, 0]} receiveShadow castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.65]} />
            <meshStandardMaterial color="#d4a373" roughness={0.9} />
          </mesh>
        </RigidBody>
      ))}
    </group>
  );
};
