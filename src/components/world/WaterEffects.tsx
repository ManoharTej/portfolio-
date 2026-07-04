import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const MAX_SPLASHES = 30; // Number of water droplets
const MAX_RIPPLES = 15;

export const WaterEffects = () => {
  const splashesRef = useRef<THREE.Group>(null);
  const ripplesRef = useRef<THREE.Group>(null);
  
  const splashes = useMemo(() => {
    return Array.from({ length: MAX_SPLASHES }, () => ({
      position: new THREE.Vector3(0, -1000, 0),
      velocity: new THREE.Vector3(),
      life: 0,
      maxLife: 0.5,
      scale: 1,
    }));
  }, []);

  const ripples = useMemo(() => {
    return Array.from({ length: MAX_RIPPLES }, () => ({
      position: new THREE.Vector3(0, -1000, 0),
      life: 0,
    }));
  }, []);

  const lastPos = useRef(new THREE.Vector3());
  const distSinceLastRipple = useRef(0);
  let splashIdx = 0;
  let rippleIdx = 0;

  useFrame((_, delta) => {
    const charPos = (window as any).characterPosition as THREE.Vector3;
    
    if (charPos) {
      const horizontalDist = new THREE.Vector2(lastPos.current.x, lastPos.current.z)
                             .distanceTo(new THREE.Vector2(charPos.x, charPos.z));
      
      // If the character is moving
      if (horizontalDist > 0.01) { 
        distSinceLastRipple.current = 0; // Reset standing timer

        // Spawn realistic leg-level splashes
        // Only spawn a few per frame to look like natural water kicking up
        for(let i = 0; i < 2; i++) { 
          const p = splashes[splashIdx];
          // Spawn near the feet
          p.position.set(
            charPos.x + (Math.random() - 0.5) * 0.4,
            0.1, // Start slightly above water
            charPos.z + (Math.random() - 0.5) * 0.4
          );
          // Kick water up to about knee/leg height (Y velocity ~1.5 to 2.5)
          p.velocity.set(
            (Math.random() - 0.5) * 1.5, 
            Math.random() * 1.5 + 1.0, 
            (Math.random() - 0.5) * 1.5
          );
          p.life = Math.random() * 0.3 + 0.2; 
          p.maxLife = p.life;
          p.scale = Math.random() * 0.05 + 0.02; // Small realistic water drops
          
          splashIdx = (splashIdx + 1) % MAX_SPLASHES;
        }

        lastPos.current.copy(charPos);
      } else {
        // Character is standing still
        distSinceLastRipple.current += delta; 

        // Spawn a ripple every 0.8 seconds while standing
        if (distSinceLastRipple.current > 0.8) {
          const r = ripples[rippleIdx];
          // Raised Y position to 0.15 so it's visible above the ocean distortion waves
          r.position.set(charPos.x, 0.15, charPos.z);
          r.life = 1.0; 
          
          rippleIdx = (rippleIdx + 1) % MAX_RIPPLES;
          distSinceLastRipple.current = 0;
        }
      }
    }

    // Update Splashes
    if (splashesRef.current) {
      splashesRef.current.children.forEach((child: any, i) => {
        const p = splashes[i];
        if (p && p.life > 0) {
          p.life -= delta;
          p.velocity.y -= 9.8 * delta; // Real gravity
          p.position.addScaledVector(p.velocity, delta);
          
          // Kill droplet when it hits the water
          if (p.position.y < 0) p.life = 0;
          
          child.position.copy(p.position);
          
          // Point droplet in the direction it's moving
          const target = p.position.clone().add(p.velocity);
          child.lookAt(target);
          child.rotateX(Math.PI / 2); // Align cone to velocity
          
          // Shrink slightly as it falls
          const s = p.scale * (0.5 + 0.5 * (p.life / p.maxLife));
          child.scale.set(s, s, s);
          
          // Fade out
          if (child.material) {
            child.material.opacity = Math.max(0, (p.life / p.maxLife) * 1.0);
          }
          
          child.visible = true;
        } else {
          child.visible = false;
        }
      });
    }

    // Update Ripples
    if (ripplesRef.current) {
      ripplesRef.current.children.forEach((child: any, i) => {
        const r = ripples[i];
        if (r && r.life > 0) {
          r.life -= delta * 0.5; // Slower ripple ~2s life
          child.position.copy(r.position);
          
          // Realistic small ripple size (expands gently)
          const s = 0.5 + (1.0 - r.life) * 2.0; 
          child.scale.set(s, s, s);
          
          // Fade out opacity smoothly
          if (child.material) {
            child.material.opacity = Math.max(0, r.life * 0.6);
          }
          child.visible = true;
        } else {
          child.visible = false;
        }
      });
    }
  });

  return (
    <group>
      {/* Splashes */}
      <group ref={splashesRef}>
        {splashes.map((_, i) => (
          <mesh key={`splash-${i}`} visible={false}>
            <coneGeometry args={[0.4, 1.5, 5]} />
            <meshPhysicalMaterial 
              color="#e0f7fa" 
              transmission={0.9} 
              opacity={1} 
              transparent={true} 
              roughness={0.1} 
              ior={1.33} 
              thickness={0.5} 
            />
          </mesh>
        ))}
      </group>
      
      {/* Ripples */}
      <group ref={ripplesRef}>
        {ripples.map((_, i) => (
          <mesh key={`ripple-${i}`} rotation-x={-Math.PI / 2} visible={false}>
            <ringGeometry args={[0.9, 1.0, 32]} />
            <meshBasicMaterial color="#aee6ff" transparent opacity={0.4} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
    </group>
  );
};
