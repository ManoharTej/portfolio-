import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRM } from '@pixiv/three-vrm';

export const RawVRM = ({ url, position }: { url: string; position: [number, number, number] }) => {
  const vrmRef = useRef<VRM | null>(null);
  const group = useRef<THREE.Group>(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    loader.load(url, (gltf) => {
      const vrm = gltf.userData.vrm;
      if (vrm) {
        vrmRef.current = vrm;
        vrm.scene.rotation.y = Math.PI;
        if (group.current) {
          group.current.add(vrm.scene);
        }
      }
    });
  }, [url]);

  useFrame((_, delta) => {
    if (vrmRef.current) {
      vrmRef.current.update(delta);
    }
  });

  return (
    <group ref={group} position={position}>
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.5, 2, 0.5]} />
        <meshBasicMaterial color="red" wireframe />
      </mesh>
    </group>
  );
};
