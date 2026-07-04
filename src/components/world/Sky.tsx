import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AnimeSkyVertex, AnimeSkyFragment } from '../../shaders/AnimeSkyShader';

export const Sky = () => {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
  }), []);

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <>
      {/* Huge sky sphere — BackSide so we see it from inside */}
      <mesh>
        <sphereGeometry args={[9000, 64, 64]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={AnimeSkyVertex}
          fragmentShader={AnimeSkyFragment}
          uniforms={uniforms}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Lighting to illuminate the water surface */}
      <ambientLight intensity={1.4} color="#cce8ff" />
      <directionalLight
        position={[350, 300, -900]}
        intensity={3.5}
        color="#fff8e0"
        castShadow
      />

      {/* Soft horizon atmospheric fog */}
      <fog attach="fog" args={['#a8d8f5', 5000, 20000]} />
    </>
  );
};
