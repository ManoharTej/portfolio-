import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Water } from 'three/addons/objects/Water.js';

// ── Glowing horizon border ─────────────────────────────────────────────────
const HorizonGlow = () => (
  <group>
    {/* Wide soft cyan spread */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
      <ringGeometry args={[6500, 10500, 128]} />
      <meshBasicMaterial color="#5ee8ff" transparent opacity={0.3}
        side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
    </mesh>
    {/* Tighter brighter glow */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.09, 0]}>
      <ringGeometry args={[8500, 10200, 128]} />
      <meshBasicMaterial color="#7df0ff" transparent opacity={0.55}
        side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
    </mesh>
    {/* Razor-thin bright rim */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.14, 0]}>
      <ringGeometry args={[9400, 9900, 128]} />
      <meshBasicMaterial color="#c0f7ff" transparent opacity={0.9}
        side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
    </mesh>
  </group>
);

export const Ocean = () => {
  const ref = useRef<Water | null>(null);
  const { scene } = useThree();

  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    const waterNormals = textureLoader.load(
      'https://threejs.org/examples/textures/waternormals.jpg',
      (tex) => {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      }
    );

    const waterGeometry = new THREE.PlaneGeometry(20000, 20000, 10, 10);

    const water = new Water(waterGeometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals,
      sunDirection: new THREE.Vector3(0.35, 0.3, -0.9).normalize(),
      sunColor: 0xffffff,
      waterColor: 0x005599,   // Slightly darker vivid sky-blue to show reflections better
      distortionScale: 1.2,
      fog: true,
    });

    water.rotation.x = -Math.PI / 2;
    water.position.y = 0;

    // Allow reflections to show by not being completely opaque
    (water.material as any).uniforms['alpha'].value = 0.85;

    scene.add(water);
    ref.current = water;

    return () => {
      scene.remove(water);
      waterGeometry.dispose();
    };
  }, [scene]);

  useFrame((_, delta) => {
    if (ref.current) {
      (ref.current.material as any).uniforms['time'].value += delta * 0.5;
    }
  });

  return <HorizonGlow />;
};
