import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';

export const CameraController = () => {
  const { camera } = useThree();
  const yawRef = useRef(0);
  const pitchRef = useRef(0.15); 
  const radiusRef = useRef(4.0);
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const isSittingAtTable = useAppStore((state) => state.isSittingAtTable);
  const focusedShelfTier = useAppStore((state) => state.focusedShelfTier);
  const crystalFocusPoint = useAppStore((state) => state.crystalFocusPoint);
  const hasTeleported = useAppStore((state) => state.hasTeleported);
  const teleportTimerRef = useRef(0);
  const dropTimerRef = useRef(0);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      // Only drag if left click
      if (e.button !== 0) return;
      isDragging.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging.current) return;
      
      // Lock the camera angle while sitting or focused (disable dynamic mouse movement)
      if (useAppStore.getState().isSittingAtTable) return;
      if (useAppStore.getState().focusedShelfTier) return;
      
      const deltaX = event.clientX - previousMousePosition.current.x;
      
      const sensitivityX = 0.005;
      yawRef.current -= deltaX * sensitivityX;
      pitchRef.current = 0.15; // Lock pitch
      
      previousMousePosition.current = { x: event.clientX, y: event.clientY };
    };

    // Attach to window so dragging outside canvas works
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    const handleForceCameraAngle = (e: any) => {
      yawRef.current = e.detail.yaw;
      pitchRef.current = e.detail.pitch;
    };
    window.addEventListener('forceCameraAngle', handleForceCameraAngle);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('forceCameraAngle', handleForceCameraAngle);
    };
  }, []);

  useEffect(() => {
    if (isSittingAtTable) {
      // Symmetrical framing: camera perfectly centered between them
      yawRef.current = Math.PI / 2 + 0.25;
      pitchRef.current = 0.0;
    }
  }, [isSittingAtTable]);

  useFrame((_, delta) => {
    const introStage = useAppStore.getState().introStage;

    if (introStage !== 'complete') {
      const cam = camera as THREE.PerspectiveCamera;
      cam.fov = THREE.MathUtils.lerp(cam.fov, 60, 0.05);
      cam.updateProjectionMatrix();

      // High in the sky looking down
      const skyPos = new THREE.Vector3(30, 120, 80);
      const lookAtIsland = new THREE.Vector3(0, 20, 0);

      camera.position.lerp(skyPos, 0.05);
      
      const currentLookAt = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).add(camera.position);
      currentLookAt.lerp(lookAtIsland, 0.05);
      camera.lookAt(currentLookAt);

      return; // Skip normal camera logic
    }

    const isCameraFlyAway = useAppStore.getState().isCameraFlyAway;
    if (isCameraFlyAway) {
      const cam = camera as THREE.PerspectiveCamera;
      cam.fov = THREE.MathUtils.lerp(cam.fov, 75, 0.05);
      cam.updateProjectionMatrix();

      // High in the sky looking down, slowly drifting higher
      const skyPos = new THREE.Vector3(15, 180, 40);
      const lookAtIsland = new THREE.Vector3(0, 0, 0);

      camera.position.lerp(skyPos, 0.02);
      
      const currentLookAt = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).add(camera.position);
      currentLookAt.lerp(lookAtIsland, 0.02);
      camera.lookAt(currentLookAt);

      return; // Skip normal camera logic
    }

    if (crystalFocusPoint) {
      // --- CINEMATIC CRYSTAL ZOOM ---
      const cam = camera as THREE.PerspectiveCamera;
      cam.fov = THREE.MathUtils.lerp(cam.fov, 45, 0.05); // Tighter FOV for close-up
      cam.updateProjectionMatrix();

      // Zoom position: linear straight-on look from the front
      const targetCamPos = new THREE.Vector3(
        crystalFocusPoint[0],
        crystalFocusPoint[1] + 1.0,
        crystalFocusPoint[2] + 4.5
      );
      const targetLookAt = new THREE.Vector3(
        crystalFocusPoint[0],
        crystalFocusPoint[1] + 0.5,
        crystalFocusPoint[2]
      );

      camera.position.lerp(targetCamPos, 0.08); // Smooth fly-in
      
      const currentLookAt = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).add(camera.position);
      currentLookAt.lerp(targetLookAt, 0.08);
      camera.lookAt(currentLookAt);

    } else if (focusedShelfTier) {
      // --- CINEMATIC SHELF ZOOM ---
      const cam = camera as THREE.PerspectiveCamera;
      cam.fov = THREE.MathUtils.lerp(cam.fov, 45, 0.05); // Tighter FOV for close-up
      cam.updateProjectionMatrix();

      // Shelf Base World Position: [9, 45, -9]
      // Scale: 0.4.
      // Shelf Tier Y offsets (local): Top=5.2, Mid=3.3, Bot=1.4
      // Shelf Tier Y (world): Top = 45 + 5.2*0.4 = 47.08
      let targetY = 47.08;
      if (focusedShelfTier === 'tools') targetY = 46.32; // 45 + 3.3*0.4 = 46.32
      if (focusedShelfTier === 'certs') targetY = 45.56; // 45 + 1.4*0.4 = 45.56

      let targetCamPos: THREE.Vector3;
      let targetLookAt: THREE.Vector3;

      if (focusedShelfTier === 'board') {
        // Board position: [38.84, 38.24, -3.0]
        // Base Y: 38.24, Screen Y local offset: 2.85, Scale: 0.9
        // Target Y = 38.24 + (2.85 * 0.9) = 40.805
        targetY = 40.8;
        const distance = 4.0;
        // Board is rotated 180 degrees (Math.PI) so its screen faces -Z.
        // We place the camera further into -Z to look back at it.
        targetCamPos = new THREE.Vector3(38.84, targetY, -3.0 - distance);
        targetLookAt = new THREE.Vector3(38.84, targetY, -3.0);
      } else {
        // The shelf is rotated -Math.PI / 4. 
        // To look directly at it, the camera should be placed along the normal extending from its front.
        const distance = 1.8;
        const camX = 9 - distance * Math.sin(Math.PI / 4); 
        const camZ = -9 + distance * Math.cos(Math.PI / 4); 
        targetCamPos = new THREE.Vector3(camX, targetY, camZ);
        targetLookAt = new THREE.Vector3(9, targetY, -9);
      }

      camera.position.lerp(targetCamPos, 0.08); // Smooth fly-in
      
      // Look perfectly at the center of the active target
      const currentLookAt = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).add(camera.position);
      currentLookAt.lerp(targetLookAt, 0.08);
      camera.lookAt(currentLookAt);

    } else if ((window as any).characterPosition) {
      // --- NORMAL 3RD PERSON CAMERA ---
      const rawPos = (window as any).characterPosition;
      let charPos = new THREE.Vector3(rawPos.x, rawPos.y, rawPos.z);
      
      if (hasTeleported && teleportTimerRef.current < 2.5) {
        teleportTimerRef.current += delta;
        // Target camera position: standing higher up on the grass, looking up at the teleport beam
        const finalCamPos = new THREE.Vector3(5, 45, -4);
        
        // Instantly snap to the spawn location to avoid ANY clipping through the ground!
        if (teleportTimerRef.current < 0.1) {
          camera.position.copy(finalCamPos);
        } else {
          camera.position.lerp(finalCamPos, 0.2); // Keep it tightly locked there
        }
        
        // Look up at the sky where the characters are suspended
        const currentLookAt = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).add(camera.position);
        const targetLookAt = new THREE.Vector3(5, 48, -10);
        currentLookAt.lerp(targetLookAt, 0.08);
        camera.lookAt(currentLookAt);
        
        return; // Skip normal 3rd person calculations during this sequence
      }
      
      const targetFov = isSittingAtTable ? 35 : 75;
      const cam = camera as THREE.PerspectiveCamera;
      cam.fov = THREE.MathUtils.lerp(cam.fov, targetFov, 0.05);
      cam.updateProjectionMatrix();

      // Export camera rotation for UI
      const camEuler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
      (window as any).cameraRotationY = camEuler.y;

      const targetRadius = isSittingAtTable ? 1.0 : 4.0;
      radiusRef.current = THREE.MathUtils.lerp(radiusRef.current, targetRadius, 0.05);
      
      const heightOffset = isSittingAtTable ? 0.75 : 1.4;
      
      const camX = charPos.x + radiusRef.current * Math.cos(pitchRef.current) * Math.sin(yawRef.current);
      const camY = charPos.y + heightOffset + radiusRef.current * Math.sin(pitchRef.current);
      const camZ = charPos.z + radiusRef.current * Math.cos(pitchRef.current) * Math.cos(yawRef.current);
      
      const targetCamPos = new THREE.Vector3(camX, camY, camZ);
      
      // Buttery smooth 3-second camera drop from the sky when intro completes!
      const introStage = useAppStore.getState().introStage;
      if (introStage === 'complete') {
        dropTimerRef.current += delta;
        if (dropTimerRef.current > 4.0 && !useAppStore.getState().isCameraDropComplete) {
          useAppStore.getState().setIsCameraDropComplete(true);
        }
      } else {
        dropTimerRef.current = 0;
      }
      
      const lerpFactor = dropTimerRef.current > 0 && dropTimerRef.current < 4.0 ? 0.015 : 0.1;
      camera.position.lerp(targetCamPos, lerpFactor);
      
      const targetLookX = isSittingAtTable ? charPos.x - 1.2 : charPos.x;
      const targetLookY = isSittingAtTable ? charPos.y + 0.75 : charPos.y + 1.0;
      const targetLookZ = isSittingAtTable ? camZ : charPos.z;
      
      // Smooth lookAt for transition back from cinematic focus
      const currentLookAt = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).add(camera.position);
      const newTargetLookAt = new THREE.Vector3(targetLookX, targetLookY, targetLookZ);
      currentLookAt.lerp(newTargetLookAt, lerpFactor);
      camera.lookAt(currentLookAt);
    }
  });

  return null;
};
