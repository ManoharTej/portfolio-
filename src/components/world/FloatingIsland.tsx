import { useGLTF, Html } from '@react-three/drei';
import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { RigidBody, CylinderCollider } from '@react-three/rapier';
import { useAppStore } from '../../store/useAppStore';
import { FaLinkedin, FaGithub, FaFilePdf, FaEnvelope, FaTimes } from 'react-icons/fa';

const IconButton = ({ href, color, icon: Icon, label }: { href: string, color: string, icon: any, label: string }) => (
  <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <div className="icon-tooltip" style={{
      position: 'absolute',
      top: '-40px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: 'bold',
      opacity: 0,
      transition: 'opacity 0.2s',
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
      border: '1px solid rgba(255,255,255,0.2)'
    }}>
      {label}
    </div>
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
        background: 'rgba(255,255,255,0.1)', 
        borderRadius: '50%', 
        border: `1px solid rgba(255,255,255,0.2)`,
        backdropFilter: 'blur(10px)',
        transition: 'all 0.2s',
        cursor: 'pointer',
        fontSize: '24px'
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.transform = 'scale(1.15) translateY(-5px)';
        el.style.background = 'rgba(255,255,255,0.2)';
        el.style.boxShadow = `0 5px 15px ${color}88`;
        (el.previousSibling as HTMLElement).style.opacity = '1';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.transform = 'scale(1) translateY(0)';
        el.style.background = 'rgba(255,255,255,0.1)';
        el.style.boxShadow = 'none';
        (el.previousSibling as HTMLElement).style.opacity = '0';
      }}
    >
      <Icon />
    </a>
  </div>
);

export const FloatingIsland = () => {
  const { scene } = useGLTF('/island.glb');
  const islandRef = useRef<THREE.Group>(null);
  const crystalFocusPoint = useAppStore(state => state.crystalFocusPoint);
  const setCrystalFocusPoint = useAppStore(state => state.setCrystalFocusPoint);
  const hasTeleported = useAppStore(state => state.hasTeleported);

  useEffect(() => {
    scene.traverse((node: any) => {
      if (node.isMesh) {
        node.frustumCulled = false; // Prevent it from disappearing when looking up from the ocean!
        if (node.material) {
          node.material.side = THREE.DoubleSide; // Make bottom visible
        }
      }
    });
  }, [scene]);

  const physicsScene = useMemo(() => {
    const clone = scene.clone();
    const toRemove: THREE.Object3D[] = [];
    clone.traverse((node: any) => {
      if (node.isMesh) {
        const name = node.name.toLowerCase();
        // ONLY remove small grass blades (grass.001, etc.) and leaves. Do NOT remove "grass top"!
        if (name.match(/grass\.\d+/) || name.match(/fallen/)) {
          toRemove.push(node);
        }
      }
    });
    toRemove.forEach(node => node.removeFromParent());
    return clone;
  }, [scene]);

  return (
    <>
      <group position={[0, 40, 0]} scale={[5, 5, 5]}>
      {/* Always-on physics so teleporting is instant and solid */}
      <RigidBody type="fixed" colliders="trimesh" includeInvisible={true}>
         <primitive object={physicsScene} visible={false} />
      </RigidBody>

      {/* Visual Scene */}
      <group ref={islandRef}>
         <primitive 
           object={scene} 
           onPointerOver={(e: any) => {
             const name = e.object.name.toLowerCase();
             if (name.includes('crystal')) {
               e.stopPropagation();
               document.body.style.cursor = 'pointer';
               if (e.object.material) {
                 if (e.object.userData.origEmissive === undefined) {
                   e.object.userData.origEmissive = e.object.material.emissive ? e.object.material.emissive.clone() : new THREE.Color(0x000000);
                   e.object.userData.origIntensity = e.object.material.emissiveIntensity || 0;
                 }
                 e.object.material.emissive = e.object.material.color || new THREE.Color(0xffffff);
                 e.object.material.emissiveIntensity = 0.8;
               }
             }
           }}
           onPointerOut={(e: any) => {
             const name = e.object.name.toLowerCase();
             if (name.includes('crystal')) {
               e.stopPropagation();
               document.body.style.cursor = 'auto';
               if (e.object.material && e.object.userData.origEmissive !== undefined) {
                 e.object.material.emissive.copy(e.object.userData.origEmissive);
                 e.object.material.emissiveIntensity = e.object.userData.origIntensity;
               }
             }
           }}
           onClick={(e: any) => {
             const name = e.object.name.toLowerCase();
             if (name.includes('crystal')) {
               e.stopPropagation();
               setCrystalFocusPoint([e.point.x, e.point.y, e.point.z]);
             } else {
               setCrystalFocusPoint(null);
             }
           }}
         />
      </group>
    </group>

      {/* Floating Buttons UI (World Space) */}
      {crystalFocusPoint && (
        <group position={[crystalFocusPoint[0], crystalFocusPoint[1] + 1.2, crystalFocusPoint[2] + 0.5]}>
          <Html position={[0, 0, 0]} center zIndexRange={[100, 0]}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '15px 25px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '25px', border: '1px solid rgba(56, 189, 248, 0.3)', backdropFilter: 'blur(12px)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <IconButton href="https://www.linkedin.com/in/manohar-tej-963a452a4" color="#3b82f6" icon={FaLinkedin} label="LinkedIn" />
              <IconButton href="https://github.com/ManoharTej" color="#f8fafc" icon={FaGithub} label="GitHub" />
              <IconButton href="https://drive.google.com/file/d/1yp84iFob9ZTGQtZ7HddbqwaZKX13Fq0e/view?usp=drive_link" color="#ec4899" icon={FaFilePdf} label="Resume" />
              <IconButton href="mailto:manohartejkamdul@gmail.com" color="#10b981" icon={FaEnvelope} label="Email" />
              
              {/* Close Button */}
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  setCrystalFocusPoint(null);
                  if (useAppStore.getState().currentQuestId === 'go_to_media') {
                    useAppStore.getState().setCurrentQuestId('go_to_contact');
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '30px',
                  height: '30px',
                  marginLeft: '10px',
                  color: '#ef4444',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                  e.currentTarget.style.color = '#ef4444';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <FaTimes />
              </div>
            </div>
          </Html>
        </group>
      )}

      {/* Invisible ocean-level wall to prevent player from walking into the downward-sloping roots */}
      {!hasTeleported && (
        <RigidBody type="fixed" position={[0, 5, 0]}>
           {/* halfHeight: 10 (spans Y=-5 to 15), radius: 20 */}
           <CylinderCollider args={[10, 20]} />
        </RigidBody>
      )}
    </>
  );
};
