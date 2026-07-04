import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';

const beamVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const beamFragmentShader = `
  varying vec2 vUv;
  uniform float uOpacity;
  uniform float uTime;
  uniform vec3 uColor;

  void main() {
    float verticalGradient = pow(1.0 - vUv.y, 1.5);
    float stripes = sin(vUv.x * 40.0 + uTime * -10.0) * 0.5 + 0.5;
    stripes = pow(stripes, 3.0);
    float edge = pow(2.0 * abs(vUv.x - 0.5), 4.0);
    float alpha = (verticalGradient * 0.4 + stripes * 0.6 + edge) * uOpacity * (1.0 - vUv.y);
    vec3 finalColor = mix(uColor, vec3(1.0), edge * 0.5 + stripes * 0.5);
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export const ReturnTeleportBeam = () => {
  const beamRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);
  const { isReturningToBench, returnTeleportPos, endReturnTeleport, setHasTeleported, setSittingAtTable, setCurrentQuestId, setIsTeleporting } = useAppStore();

  const uniforms = useMemo(() => ({
    uOpacity: { value: 0 },
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#00f0ff') } // Electric Cyan
  }), []);

  useEffect(() => {
    if (isReturningToBench) {
      timeRef.current = 0;
    }
  }, [isReturningToBench]);

  useFrame((_, delta) => {
    if (!isReturningToBench || !beamRef.current || !returnTeleportPos) return;
    timeRef.current += delta;
    
    const t = timeRef.current;
    const mat = beamRef.current.material as THREE.ShaderMaterial;
    mat.uniforms.uTime.value = t;
    
    // Smooth fast teleport sequence
    if (t < 1.0) {
      // 0-1s: scale up Y rapidly, fade in
      beamRef.current.visible = true;
      beamRef.current.scale.y = t * 40; 
      beamRef.current.scale.x = 1;
      beamRef.current.scale.z = 1;
      mat.uniforms.uOpacity.value = t; 
      beamRef.current.position.set(returnTeleportPos[0], returnTeleportPos[1] + (t * 20), returnTeleportPos[2]);
    } else if (t < 2.0) {
      // 1-2s: hold intensity, player gets beamed up
      beamRef.current.scale.y = 40;
      mat.uniforms.uOpacity.value = 1.0 + Math.sin(t * 15) * 0.15;
      beamRef.current.position.set(returnTeleportPos[0], returnTeleportPos[1] + 20, returnTeleportPos[2]);
    } else if (t < 2.1) {
      // 2.0s: BOOM! Teleport happens now!
      setHasTeleported(false); 
      setIsTeleporting(false);
      setSittingAtTable(true);
      setCurrentQuestId('click_contact_card');
      
      // Trigger the contact card sequence!
      useAppStore.getState().setIsContactCardVisible(true);
    } else if (t < 3.0) {
      // After teleport, the beam dissolves
      beamRef.current.visible = false;
    } else {
      endReturnTeleport();
    }
  });

  if (!isReturningToBench || !returnTeleportPos) return null;

  return (
    <mesh ref={beamRef} position={returnTeleportPos}>
      <cylinderGeometry args={[1.8, 1.8, 1, 32, 1, true]} />
      <shaderMaterial
        vertexShader={beamVertexShader}
        fragmentShader={beamFragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
