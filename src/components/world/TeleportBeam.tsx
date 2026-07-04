import { useRef, useMemo } from 'react';
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

// Gradient shader: Transparent at top (vUv.y = 1), glowing cyan at bottom, with vertical energy stripes
const beamFragmentShader = `
  varying vec2 vUv;
  uniform float uOpacity;
  uniform float uTime;
  uniform vec3 uColor;

  void main() {
    // We want the bottom (vUv.y = 0) to be intense, and top (vUv.y = 1) to be completely transparent.
    float verticalGradient = pow(1.0 - vUv.y, 1.5);
    
    // Scrolling vertical lines (energy beams)
    // Add uTime to y to make the stripes move downwards slightly, and multiply by x for vertical bands
    float stripes = sin(vUv.x * 40.0 + uTime * -10.0) * 0.5 + 0.5;
    stripes = pow(stripes, 3.0); // Sharpen lines
    
    // Edge glow (fresnel-like using uv.x)
    float edge = pow(2.0 * abs(vUv.x - 0.5), 4.0);
    
    // Combine them
    float alpha = (verticalGradient * 0.4 + stripes * 0.6 + edge) * uOpacity * (1.0 - vUv.y);
    
    // Whiter core, cyan edges
    vec3 finalColor = mix(uColor, vec3(1.0), edge * 0.5 + stripes * 0.5);

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export const TeleportBeam = ({ position }: { position: [number, number, number] }) => {
  const beamRef = useRef<THREE.Mesh>(null);
  const { hasTeleported } = useAppStore();
  const timeRef = useRef(0);

  const uniforms = useMemo(() => ({
    uOpacity: { value: 0 },
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#00f0ff') } // Electric Cyan
  }), []);

  useFrame((_, delta) => {
    if (!hasTeleported || !beamRef.current) return;
    timeRef.current += delta;
    
    const t = timeRef.current;
    const mat = beamRef.current.material as THREE.ShaderMaterial;
    mat.uniforms.uTime.value = t;
    
    // Wait 1.5 seconds for the camera to finish flying to the island
    if (t < 1.5) {
      beamRef.current.visible = false;
      return;
    }
    
    beamRef.current.visible = true;
    const animTime = t - 1.5; // Start animation clock after the 1.5s delay
    
    // User requested ~5 seconds for beam to appear and dissolve
    if (animTime < 1.0) {
      // 0-1s: scale up Y rapidly, fade in
      beamRef.current.scale.y = animTime * 40; // grow to height 40
      mat.uniforms.uOpacity.value = animTime; 
      beamRef.current.position.y = position[1] + (animTime * 20);
    } else if (animTime < 4.0) {
      // 1-4s: hold intensity, pulse slightly
      beamRef.current.scale.y = 40;
      mat.uniforms.uOpacity.value = 1.0 + Math.sin(animTime * 15) * 0.15;
      beamRef.current.position.y = position[1] + 20;
    } else if (animTime < 5.0) {
      // 4-5s: dissolve and scale down thickness
      const fade = 1 - (animTime - 4.0);
      beamRef.current.scale.x = fade;
      beamRef.current.scale.z = fade;
      mat.uniforms.uOpacity.value = fade;
    } else {
      beamRef.current.visible = false;
    }
  });

  if (!hasTeleported) return null;

  return (
    <mesh ref={beamRef} position={position}>
      <cylinderGeometry args={[1.8, 1.8, 1, 32, 1, true]} />
      <shaderMaterial
        vertexShader={beamVertexShader}
        fragmentShader={beamFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
