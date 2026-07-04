import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRM, VRMUtils } from '@pixiv/three-vrm';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import { useKeyboardControls } from '@react-three/drei';
import { Controls } from '../../controls';
import { useAppStore } from '../../store/useAppStore';

export interface UserVRMProps {
  url: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  isPlayable?: boolean;
  isSitting?: boolean;
}

export function UserVRM({ url, position = [0, 0, 0], rotation, scale = 1, isPlayable = false, isSitting = false }: UserVRMProps) {
  const [vrm, setVrm] = useState<VRM | null>(null);
  const characterGroup = useRef<THREE.Group>(null);
  const timeRef = useRef(0);
  
  const isSittingAtTable = useAppStore((state) => state.isSittingAtTable);
  const isAskQuestionModalOpen = useAppStore((state) => state.isAskQuestionModalOpen);
  const isWriting = useAppStore((state) => state.isWriting);
  const isTeleporting = useAppStore((state) => state.isTeleporting);
  const hasTeleported = useAppStore((state) => state.hasTeleported);
  const handingOverPaperIndex = useAppStore((state) => state.handingOverPaperIndex);
  const setHandingOverPaperIndex = useAppStore((state) => state.setHandingOverPaperIndex);
  
  const sitting = isPlayable ? isSittingAtTable : isSitting;
  const handOverTimeRef = useRef(0);
  const teleportTimerRef = useRef(0);
  const stuckTimerRef = useRef(0);
  const wrongDirectionTimerRef = useRef(0);
  const logTimerRef = useRef(0);
  const pathIndexRef = useRef(0);
  const prevQuestIdRef = useRef<string | null>(null);

  // Pre-defined paths for navigation
  const navigationPaths: Record<string, THREE.Vector3[]> = {
    reach_bench: [
      new THREE.Vector3(40.6, 2.5, 75.0),
      new THREE.Vector3(40.6, 2.5, 50.0)
    ],
    go_to_skills: [
      new THREE.Vector3(7, 45, -9.5),
      new THREE.Vector3(7.38, 45.05, -8.81)
    ],
    go_to_projects: [
      new THREE.Vector3(6.89, 45.05, -7.94),
      new THREE.Vector3(13.70, 45.05, -4.31),
      new THREE.Vector3(21.54, 40.54, -4.13),
      new THREE.Vector3(33.10, 38.55, -4.95),
      new THREE.Vector3(38.35, 38.22, -5.39)
    ],
    go_to_media: [
      new THREE.Vector3(8.0, 46.0, -8.0),
      new THREE.Vector3(5.43, 46.4, -11.34),
      new THREE.Vector3(11.82, 43.4, -21.88),
      new THREE.Vector3(18.21, 46.0, -32.42)
    ]
  };

  // Safe to call since CharacterVRM is inside KeyboardControls in App.tsx
  const [, get] = useKeyboardControls<Controls>();

  useEffect(() => {
    if (!url) return;
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    loader.load(url, (gltf) => {
        const loadedVrm = gltf.userData.vrm;
        if (loadedVrm) {
          VRMUtils.removeUnnecessaryVertices(gltf.scene);
          VRMUtils.removeUnnecessaryJoints(gltf.scene);
          loadedVrm.scene.traverse((obj: any) => {
            if (obj.isMesh) {
              obj.frustumCulled = false;
              obj.castShadow = true;

              if (obj.material) {
                const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
                materials.forEach((mat: any) => {
                  if (mat && mat.name) {
                    const name = mat.name.toLowerCase();
                    if (name.includes('skin') || name.includes('face') || name.includes('body')) {
                       mat.color.setHex(0xe8b08d);
                    }
                  }
                });
              }
            }
          });
          
          if (!isPlayable) {
             loadedVrm.scene.rotation.y = Math.PI;
          }
          
          loadedVrm.scene.scale.set(1.2, 1.2, 1.2);
          setVrm(loadedVrm);
        }
      });
  }, [url, isPlayable]);

  useFrame((_, delta) => {
    if (vrm) {
      vrm.update(delta);
      
      let isMoving = false;
      let isRunning = false;
      if (isPlayable && !sitting) {
        const { forward, backward, leftward, rightward, run } = get();
        const store = useAppStore.getState();
        isMoving = forward || backward || leftward || rightward || store.isAutoWalking;
        isRunning = isMoving && run;
      }

      timeRef.current += delta;
      const animSpeed = isRunning ? 15 : 10;
      const walkCycle = timeRef.current * animSpeed;
      
      const leftLeg = vrm.humanoid?.getNormalizedBoneNode('leftUpperLeg');
      const rightLeg = vrm.humanoid?.getNormalizedBoneNode('rightUpperLeg');
      const leftKnee = vrm.humanoid?.getNormalizedBoneNode('leftLowerLeg');
      const rightKnee = vrm.humanoid?.getNormalizedBoneNode('rightLowerLeg');
      const leftArm = vrm.humanoid?.getNormalizedBoneNode('leftUpperArm');
      const rightArm = vrm.humanoid?.getNormalizedBoneNode('rightUpperArm');
      const leftElbow = vrm.humanoid?.getNormalizedBoneNode('leftLowerArm');
      const rightElbow = vrm.humanoid?.getNormalizedBoneNode('rightLowerArm');
      const spine = vrm.humanoid?.getNormalizedBoneNode('spine');

      if (sitting) {
        const hips = vrm.humanoid?.getNormalizedBoneNode('hips');
        if (hips) {
          hips.position.y = 0.45; 
        }
        if (spine) {
          spine.rotation.x = 0.15; 
          spine.rotation.z = 0;
        }
        // Thighs horizontal forward, calves bend 90° down from knee
        if (leftLeg)  { leftLeg.rotation.x  = -1.4; leftLeg.rotation.z  =  0.08; }
        if (rightLeg) { rightLeg.rotation.x = -1.4; rightLeg.rotation.z = -0.08; }
        if (leftKnee)  leftKnee.rotation.x  = 1.3;
        if (rightKnee) rightKnee.rotation.x = 1.3;
        
        // Handle procedural hand animations while sitting
        if (handingOverPaperIndex !== null) {
          handOverTimeRef.current += delta;
          
          // Extend arm forward
          const extensionProgress = Math.min(handOverTimeRef.current * 2, 1);
          
          if (leftArm) leftArm.rotation.set(0.2, 0, -1.2);
          if (rightArm) rightArm.rotation.set(0.2, 0, THREE.MathUtils.lerp(1.2, 1.5, extensionProgress));
          
          if (leftElbow) leftElbow.rotation.set(-0.5, 0, 0);
          if (rightElbow) rightElbow.rotation.set(THREE.MathUtils.lerp(-0.5, -0.1, extensionProgress), 0, 0);
          
          // Clear state after 2 seconds
          if (handOverTimeRef.current > 2.0) {
            setHandingOverPaperIndex(null);
            handOverTimeRef.current = 0;
          }
        } else if (isWriting) {
          handOverTimeRef.current = 0;
          if (leftArm) leftArm.rotation.set(0.2, 0, -1.2);
          
          // Bring right arm up to table height, bend elbow
          if (rightArm) rightArm.rotation.set(0.4, 0.2, 1.3);
          
          // Move wrist/elbow slightly in a sine wave to simulate writing
          const writeCycle = timeRef.current * 15;
          if (rightElbow) rightElbow.rotation.set(-1.0 + Math.sin(writeCycle) * 0.05, 0.1 * Math.cos(writeCycle), 0);
          if (leftElbow) leftElbow.rotation.set(-0.5, 0, 0);
        } else if (isTeleporting && !hasTeleported) {
          // Reach forward towards the crystal with right hand only
          if (rightArm) {
            rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, 0.8, delta * 3);
            rightArm.rotation.z = THREE.MathUtils.lerp(rightArm.rotation.z, -0.2, delta * 3);
          }
          if (rightElbow) rightElbow.rotation.x = THREE.MathUtils.lerp(rightElbow.rotation.x, -0.2, delta * 3);
        } else {
          handOverTimeRef.current = 0;
          // Natural lap-resting pose (arms dropped to sides, elbows bent slightly)
          if (leftArm) leftArm.rotation.set(THREE.MathUtils.lerp(leftArm.rotation.x, 0.2, 0.1), 0, THREE.MathUtils.lerp(leftArm.rotation.z, -1.2, 0.1));
          if (rightArm) rightArm.rotation.set(THREE.MathUtils.lerp(rightArm.rotation.x, 0.2, 0.1), 0, THREE.MathUtils.lerp(rightArm.rotation.z, 1.2, 0.1));
          
          if (leftElbow) leftElbow.rotation.set(THREE.MathUtils.lerp(leftElbow.rotation.x, -0.5, 0.1), 0, 0);
          if (rightElbow) rightElbow.rotation.set(THREE.MathUtils.lerp(rightElbow.rotation.x, -0.5, 0.1), 0, 0);
        }
      } else if (isMoving) {
        if (spine) {
          spine.rotation.x = THREE.MathUtils.lerp(spine.rotation.x, isRunning ? 0.2 : 0.05, 0.1);
          spine.rotation.z = Math.sin(walkCycle * 0.5) * 0.03;
        }
        const legSwing = isRunning ? 0.8 : 0.5;
        if (leftLeg) leftLeg.rotation.x = Math.sin(walkCycle) * legSwing;
        if (rightLeg) rightLeg.rotation.x = Math.sin(walkCycle + Math.PI) * legSwing;
        
        const kneeBend = isRunning ? 1.2 : 0.7;
        if (leftKnee) leftKnee.rotation.x = Math.max(0, -Math.sin(walkCycle - Math.PI / 4)) * kneeBend;
        if (rightKnee) rightKnee.rotation.x = Math.max(0, -Math.sin(walkCycle + Math.PI * 0.75)) * kneeBend;
        
        const armSwing = isRunning ? 1.4 : 0.5; 
        if (leftArm) {
          leftArm.rotation.x = Math.sin(walkCycle + Math.PI) * armSwing;
          leftArm.rotation.z = isRunning ? -1.4 : -1.2; 
        }
        if (rightArm) {
          rightArm.rotation.x = Math.sin(walkCycle) * armSwing;
          rightArm.rotation.z = isRunning ? 1.4 : 1.2;
        }
        
        const elbowBendBase = isRunning ? -1.2 : -0.2;
        const elbowPump = isRunning ? 0.6 : 0.1;
        
        if (leftElbow) leftElbow.rotation.x = elbowBendBase + Math.sin(walkCycle + Math.PI) * elbowPump;
        if (rightElbow) rightElbow.rotation.x = elbowBendBase + Math.sin(walkCycle) * elbowPump;
      } else {
        if (spine) {
          spine.rotation.x = THREE.MathUtils.lerp(spine.rotation.x, 0, 0.1);
          spine.rotation.z = THREE.MathUtils.lerp(spine.rotation.z, 0, 0.1);
        }
        if (leftLeg) leftLeg.rotation.x = THREE.MathUtils.lerp(leftLeg.rotation.x, 0, 0.1);
        if (rightLeg) rightLeg.rotation.x = THREE.MathUtils.lerp(rightLeg.rotation.x, 0, 0.1);
        if (leftKnee) leftKnee.rotation.x = THREE.MathUtils.lerp(leftKnee.rotation.x, 0, 0.1);
        if (rightKnee) rightKnee.rotation.x = THREE.MathUtils.lerp(rightKnee.rotation.x, 0, 0.1);
        if (leftArm) {
          leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, 0, 0.1);
          leftArm.rotation.z = THREE.MathUtils.lerp(leftArm.rotation.z, -1.2, 0.1); 
        }
        if (rightArm) {
          rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, 0, 0.1);
          rightArm.rotation.z = THREE.MathUtils.lerp(rightArm.rotation.z, 1.2, 0.1);
        }
        if (leftElbow) leftElbow.rotation.x = THREE.MathUtils.lerp(leftElbow.rotation.x, 0, 0.1);
        if (rightElbow) rightElbow.rotation.x = THREE.MathUtils.lerp(rightElbow.rotation.x, 0, 0.1);
      }

      // Removed fade animation per user request

    }
  });

  const rigidBody = useRef<any>(null);
  const { camera } = useThree();

  useEffect(() => {
    if (hasTeleported && rigidBody.current) {
      teleportTimerRef.current = 0;
      rigidBody.current.setTranslation({ x: 5, y: 55, z: -10 }, true);
      rigidBody.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      rigidBody.current.setAngvel({ x: 0, y: 0, z: 0 }, true);

      // Removed fade material changes per user request
    }
  }, [hasTeleported, vrm]);

  useFrame((_, delta) => {
    if (isPlayable && rigidBody.current) {
      if (hasTeleported) {
        if (teleportTimerRef.current < 2.5) {
          teleportTimerRef.current += delta;
          // Hold the character in the sky while the camera flies over and the beam forms
          rigidBody.current.setTranslation({ x: 5, y: 55, z: -10 }, true);
          rigidBody.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
          rigidBody.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
          (window as any).characterPosition = rigidBody.current.translation();
          
          // Log coordinates for the user every 1 second
          logTimerRef.current += delta;
          if (logTimerRef.current > 1.0) {
             const pos = rigidBody.current.translation();
             logTimerRef.current = 0;
             console.log(`📍 COORDS -> X: ${pos.x.toFixed(2)}, Y: ${pos.y.toFixed(2)}, Z: ${pos.z.toFixed(2)}`);
          }
          return; // Skip normal physics movement while suspended
        }
      }

      if (sitting) {
        // Snap to the right bench of the picnic table, shifted slightly to perfectly frame the cinematic shot
        // Raised Y slightly from 0.55 to 0.65 to prevent the physics capsule from colliding with the bench top
        rigidBody.current.setTranslation({ x: 40.6, y: 0.65, z: 50.25 }, true);
        rigidBody.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        rigidBody.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
        
        // Orient player to face DB
        if (characterGroup.current) {
          characterGroup.current.rotation.y = -Math.PI / 2;
        }

        // Stand up ONLY if player presses jump (Spacebar). WASD is disabled while sitting.
        // Also ensure they don't accidentally stand up while typing in the Ask Question modal.
        const { jump } = get();
        if (jump && !isAskQuestionModalOpen) {
          useAppStore.getState().setSittingAtTable(false);
          rigidBody.current.setTranslation({ x: 43, y: 1.5, z: 50 }, true);
        }
      } else {
        // Proximity-based auto-sit: check distance to bench every frame
        const pos = rigidBody.current.translation();
        const dx = pos.x - 40.6;
        const dz = pos.z - 50.0;
        const distToBench = Math.sqrt(dx * dx + dz * dz);
        const store = useAppStore.getState();
        if (distToBench < 2.0 && !hasTeleported) {
          if (!store.isSittingAtTable) store.setSittingAtTable(true);
          if (store.currentQuestId === 'reach_bench') {
            store.setCurrentQuestId('talk_to_avatar');
          }
        }
        
        const { forward, backward, leftward, rightward, run, jump } = get();
        const manualMove = forward || backward || leftward || rightward;
        
        if (store.isAutoWalking && (manualMove || jump)) {
          store.setIsAutoWalking(false);
        }

        const isCurrentlyMoving = manualMove || store.isAutoWalking;
        const speed = run ? 7.5 : 3.0;
        const activeSpeed = store.isAutoWalking ? 5.0 : speed;

        // Reset path index when quest changes
        if (store.currentQuestId !== prevQuestIdRef.current) {
          pathIndexRef.current = 0;
          store.setIsAutoWalking(false); // Disable auto-walking on new objective
          prevQuestIdRef.current = store.currentQuestId;
        }

        if (store.currentQuestId === 'explore_island' && hasTeleported) {
          store.setCurrentQuestId('go_to_skills');
        }

        let targetPos: THREE.Vector3 | null = null;
        if (store.isAutoWalking) {
          const path = navigationPaths[store.currentQuestId];
          if (path && pathIndexRef.current < path.length) {
            targetPos = path[pathIndexRef.current];
          }
        } else {
          // If not auto walking, we might still need a targetPos for wrong direction hints
          if (!hasTeleported && store.currentQuestId === 'reach_bench') {
            targetPos = new THREE.Vector3(40.6, 2.5, 50.0);
          } else if (hasTeleported) {
            if (store.currentQuestId === 'go_to_skills') targetPos = new THREE.Vector3(9, 45, -9);
            if (store.currentQuestId === 'go_to_projects') targetPos = new THREE.Vector3(38.84, 42.0, -3.0);
            if (store.currentQuestId === 'go_to_media') targetPos = new THREE.Vector3(18.21, 46.0, -32.42);
          }
        }

        let direction = new THREE.Vector3();

        if (manualMove) {
          const frontVector = new THREE.Vector3(0, 0, (backward ? 1 : 0) - (forward ? 1 : 0));
          const sideVector = new THREE.Vector3((leftward ? 1 : 0) - (rightward ? 1 : 0), 0, 0);
          direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(activeSpeed);
          const camEuler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
          direction.applyEuler(new THREE.Euler(0, camEuler.y, 0));
        } else if (store.isAutoWalking && targetPos) {
          const toTarget = new THREE.Vector3().subVectors(targetPos, new THREE.Vector3(pos.x, pos.y, pos.z));
          toTarget.y = 0; // Ignore height difference when checking if arrived!
          const dist = toTarget.length();
          if (dist < 1.0) {
            pathIndexRef.current++;
            if (pathIndexRef.current >= navigationPaths[store.currentQuestId].length) {
              store.setIsAutoWalking(false);
              
              // If arriving at the skills shelf, snap rotation to face it perfectly for the camera
              if (store.currentQuestId === 'go_to_skills' && characterGroup.current) {
                // Shelf is roughly at [9.5, 45, -9.5], character is at [7.38, 45, -8.81]
                const dx = 9.5 - 7.38;
                const dz = -9.5 - (-8.81);
                const targetRotation = Math.atan2(dx, dz);
                characterGroup.current.rotation.y = targetRotation;
                
                // Force camera angle to be behind and slightly left of the player, framing the shelf and DB
                window.dispatchEvent(new CustomEvent('forceCameraAngle', { 
                  detail: { yaw: targetRotation + Math.PI - 0.4, pitch: 0.15 } 
                }));
              }
            }
          } else {
            toTarget.y = 0; 
            direction.copy(toTarget).normalize().multiplyScalar(activeSpeed);
          }
        }

        const linvel = rigidBody.current.linvel();
        
        let newVelY = linvel.y;
        let autoJump = false;

        // Stuck detection hint & auto-jump
        if (isCurrentlyMoving && Math.sqrt(linvel.x * linvel.x + linvel.z * linvel.z) < 0.5 && Math.abs(linvel.y) < 0.1) {
          stuckTimerRef.current += delta;
          if (stuckTimerRef.current > 1.0 && store.isAutoWalking) {
             autoJump = true;
             stuckTimerRef.current = 0;
          } else if (stuckTimerRef.current > 2.0 && store.currentHint === null) {
            store.setCurrentHint("Struggling to walk? Press SPACE to JUMP over obstacles!");
          }
        } else {
          stuckTimerRef.current = 0;
          if (!jump && store.currentHint && store.currentHint.includes("JUMP")) {
            // we keep the hint until they jump
          } else if (jump && store.currentHint && store.currentHint.includes("JUMP")) {
            store.setCurrentHint(null);
          }
        }

        if ((jump || autoJump) && Math.abs(linvel.y) < 0.1) {
          newVelY = 8.0; 
          store.setCurrentHint(null); // Clear hint on jump
        }

        // Wrong direction hint
        if (isCurrentlyMoving && targetPos) {
          const toTarget = new THREE.Vector3().subVectors(targetPos, new THREE.Vector3(pos.x, pos.y, pos.z)).normalize();
          const moveDir = direction.clone().normalize();
          if (toTarget.dot(moveDir) < -0.2) {
             wrongDirectionTimerRef.current += delta;
             if (wrongDirectionTimerRef.current > 3.0 && store.currentHint === null) {
                 store.setCurrentHint("You're going the wrong way! Turn around and use W to walk towards the objective.");
             }
          } else {
             wrongDirectionTimerRef.current = 0;
             if (store.currentHint && store.currentHint.includes("wrong way")) {
               store.setCurrentHint(null);
             }
          }
        } else {
          wrongDirectionTimerRef.current = 0;
        }

        // Island Fall Respawn
        if (hasTeleported && pos.y < 30) {
           rigidBody.current.setTranslation({ x: 5, y: 55, z: -10 }, true);
           rigidBody.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
           store.setCurrentHint("Oops! You fell off the floating island. Be careful!");
           setTimeout(() => store.setCurrentHint(null), 5000);
           return;
        }

        rigidBody.current.setLinvel({ x: direction.x, y: newVelY, z: direction.z }, true);

        logTimerRef.current += delta;
        if (logTimerRef.current > 1.0) {
           logTimerRef.current = 0;
           console.log(`📍 COORDS -> X: ${pos.x.toFixed(2)}, Y: ${pos.y.toFixed(2)}, Z: ${pos.z.toFixed(2)}`);
        }

        if (isCurrentlyMoving && characterGroup.current) {
          const targetRotation = Math.atan2(direction.x, direction.z);
          let currentRotation = characterGroup.current.rotation.y;
          while (currentRotation - targetRotation > Math.PI) currentRotation -= Math.PI * 2;
          while (targetRotation - currentRotation > Math.PI) currentRotation += Math.PI * 2;
          characterGroup.current.rotation.y = THREE.MathUtils.lerp(currentRotation, targetRotation, 0.1);
        }
      }

      const pos = rigidBody.current.translation();
      (window as any).characterPosition = new THREE.Vector3(pos.x, pos.y, pos.z);
    }
  });

  if (isPlayable) {
    return (
      <RigidBody ref={rigidBody} type={sitting ? 'kinematicPosition' : 'dynamic'} colliders={false} position={position} lockRotations ccd={true}>
        <CapsuleCollider args={[0.6, 0.3]} position={[0, 0.9, 0]} />
        <group ref={characterGroup} position={[0, sitting ? -0.45 : (hasTeleported ? 0.65 : 0), 0]}>
          {vrm && <primitive object={vrm.scene} />}
        </group>
      </RigidBody>
    );
  }

  return (
    <RigidBody type="fixed" position={position} colliders={false}>
      <CapsuleCollider args={[0.6, 0.3]} position={[0, 0.9, 0]} />
      <group rotation={rotation || [0, 0, 0]} position={[0, 0, 0]} scale={scale}>
        {vrm && <primitive object={vrm.scene} />}
      </group>
    </RigidBody>
  );
};
