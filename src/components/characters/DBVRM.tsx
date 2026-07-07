import { useEffect, useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRM, VRMUtils } from '@pixiv/three-vrm';
import { useAppStore } from '../../store/useAppStore';
import * as THREE from 'three';
import { RigidBody, CapsuleCollider, type RapierRigidBody } from '@react-three/rapier';
import { Html } from '@react-three/drei';

export interface DBVRMProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}

// Pre-defined complex gesture states for the character
const GESTURES = [
  { // 0: Resting
    rua: [0, 0, 1.2], rla: [-0.2, 0, 0],
    lua: [0, 0, -1.2], lla: [-0.2, 0, 0]
  },
  { // 1: Explaining 
    rua: [0, 0.2, 0.8], rla: [-1.0, 0, 0],
    lua: [0, -0.2, -0.8], lla: [-1.0, 0, 0]
  },
  { // 2: Emphasizing (Right hand up)
    rua: [-0.2, 0.4, 0.7], rla: [-1.6, 0, 0],
    lua: [0, 0, -1.2], lla: [-0.2, 0, 0]
  },
  { // 3: Passionate (Both hands up)
    rua: [-0.2, 0.3, 0.8], rla: [-1.4, 0, 0],
    lua: [-0.2, -0.3, -0.8], lla: [-1.4, 0, 0]
  }
];

const SUBTITLES = [
  { time: 0, text: "" },
  { time: 0.1, text: "Hello there... and welcome." },
  { time: 2.0, text: "I'm Manohar Tej, a Computer Science Engineering student, a developer, and someone who truly enjoys turning ideas into meaningful digital experiences." },
  { time: 12.1, text: "Ever since I started exploring technology, I've been fascinated by one simple question..." },
  { time: 18.3, text: "\"What if I could build something that people would actually enjoy using?\"" },
  { time: 24.1, text: "That curiosity slowly became a passion." },
  { time: 27.0, text: "Today, I spend my time designing websites, building intelligent applications, experimenting with AI, and constantly learning new technologies." },
  { time: 35.6, text: "But for me... Programming isn't just about writing code." },
  { time: 39.9, text: "It's about solving problems... Creating experiences... And bringing imagination to life." },
  { time: 45.2, text: "Every project I build teaches me something new. Every challenge helps me grow." },
  { time: 51.4, text: "And every line of code takes me one step closer to becoming the engineer I aspire to be." },
  { time: 60.0, text: "So... This isn't just my portfolio. It's a journey." },
  { time: 64.3, text: "A collection of my ideas, my projects, my achievements, and the path I'm still walking." },
  { time: 71.5, text: "I'm glad you're here. Come on... Let's explore my world together." },
  { time: 76.8, text: "soo... you can ask me few questions if you wanna ask ..." },
  { time: 82.1, text: "" }
];

export function DBVRM({ position = [0, 0, 0], rotation, scale = 1 }: DBVRMProps) {
  const [vrm, setVrm] = useState<VRM | null>(null);

  // Audio & Animation State
  const isSittingAtTable = useAppStore(state => state.isSittingAtTable);
  const isSpeaking = useAppStore(state => state.isSpeaking);
  const setIsSpeaking = useAppStore(state => state.setIsSpeaking);
  const handingOverPaperIndex = useAppStore(state => state.handingOverPaperIndex);
  const setIsIntroFinished = useAppStore(state => state.setIsIntroFinished);
  const isIntroFinished = useAppStore(state => state.isIntroFinished);
  const aiAudioUrl = useAppStore(state => state.aiAudioUrl);
  const setAiAudioUrl = useAppStore(state => state.setAiAudioUrl);
  const isTeleporting = useAppStore(state => state.isTeleporting);
  const hasTeleported = useAppStore(state => state.hasTeleported);
  const focusedShelfTier = useAppStore(state => state.focusedShelfTier);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const dataArray = useRef(new Uint8Array(128));
  const currentSubtitle = useAppStore(state => state.currentSubtitle);
  const setCurrentSubtitle = useAppStore(state => state.setCurrentSubtitle);

  // Animation State Machine Trackers
  const targetGesture = useRef(0);
  const lastGestureChange = useRef(0);
  const smoothedMouth = useRef(0);
  const blinkTimer = useRef(0);
  const receiveTimeRef = useRef(0);
  const dialogueTimeRef = useRef(0);
  const teleportTimerRef = useRef(0);
  const groupRef = useRef<THREE.Group>(null);
  const rbRef = useRef<RapierRigidBody>(null);


  useEffect(() => {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    loader.load('/db.vrm', (gltf) => {
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

        loadedVrm.scene.rotation.y = 0;
        loadedVrm.scene.scale.set(0.85, 0.85, 0.85);
        setVrm(loadedVrm);
      }
    });
  }, []);

  // Trigger speech sequence when sitting
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (isSittingAtTable && !isPlaying && !isIntroFinished) {
      timeout = setTimeout(() => {
        if (!audioRef.current) {
          audioRef.current = new Audio('/speech.mp3');
          audioRef.current.crossOrigin = "anonymous";

          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioContext();
          audioCtxRef.current = ctx;

          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.5;
          analyserRef.current = analyser;

          const source = ctx.createMediaElementSource(audioRef.current);
          source.connect(analyser);
          analyser.connect(ctx.destination);

          audioRef.current.onplay = () => {
            setIsPlaying(true);
            setIsSpeaking(true);
          };
          audioRef.current.onended = () => {
            setIsPlaying(false);
            setIsSpeaking(false);
            setIsIntroFinished(true);
          };
        } else {
          // Reset time if it's already created (for repeating)
          audioRef.current.currentTime = 0;
        }

        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }

        audioRef.current.play().catch(e => {
          console.warn("Audio autoplay blocked, requires interaction:", e);
        });
      }, 1500);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [isSittingAtTable, isPlaying, isIntroFinished, setIsSpeaking, setIsIntroFinished]);

  // Handle dynamic AI audio playback
  useEffect(() => {
    if (aiAudioUrl && audioRef.current) {
      const prevSrc = audioRef.current.src;
      audioRef.current.src = aiAudioUrl;

      audioRef.current.onended = () => {
        setIsPlaying(false);
        setIsSpeaking(false);
        setAiAudioUrl(null);
        setCurrentSubtitle("");

        // Restore intro logic for the Repeat button
        if (audioRef.current) {
          audioRef.current.src = prevSrc;
          audioRef.current.onended = () => {
            setIsPlaying(false);
            setIsSpeaking(false);
            setIsIntroFinished(true);
          };
        }
      };

      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      audioRef.current.play().catch(e => console.error("AI audio play failed", e));
    }
  }, [aiAudioUrl, setAiAudioUrl, setIsPlaying, setIsSpeaking, setIsIntroFinished, setCurrentSubtitle]);

  useEffect(() => {
    // If the user skips the intro manually (isIntroFinished becomes true while audio is playing)
    if (isIntroFinished && audioRef.current && !aiAudioUrl) {
      if (!audioRef.current.paused) {
        audioRef.current.pause();
      }
      audioRef.current.currentTime = 0;
      dialogueTimeRef.current = 0;
      setIsPlaying(false);
      setIsSpeaking(false);
      setCurrentSubtitle("");
    }
  }, [isIntroFinished, aiAudioUrl, setIsPlaying, setIsSpeaking, setCurrentSubtitle]);

  useEffect(() => {
    // Only handle initial interaction for the first audio
    if (!audioRef.current || !audioCtxRef.current) return;

    const onInteract = () => {
      if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      // Only autoplay if intro isn't finished yet
      if (audioRef.current && !isPlaying && !isIntroFinished && audioRef.current.src.includes('speech.mp3')) {
        audioRef.current.play().catch(e => console.warn(e));
        setIsPlaying(true);
        setIsSpeaking(true);
      }
      window.removeEventListener('click', onInteract);
    };

    window.addEventListener('click', onInteract);
    return () => window.removeEventListener('click', onInteract);
  }, [isPlaying, isIntroFinished, setIsSpeaking]);

  // Handle the Ending Sequence TTS
  const isEndingSequence = useAppStore(state => state.isEndingSequence);
  const isCameraFlyAway = useAppStore(state => state.isCameraFlyAway);
  const setIsCameraFlyAway = useAppStore(state => state.setIsCameraFlyAway);
  const setIsEndingSequence = useAppStore(state => state.setIsEndingSequence);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isEndingSequence) {
      timeoutId = setTimeout(() => {
        const message = "Thank you for exploring my world and taking the time to know about me. I hope you enjoyed the experience, and please feel free to send me your feedback if possible!";
        setCurrentSubtitle(message);
        
        try {
          const audio = new Audio('/end.wav');
          
          audio.onplay = () => {
            setIsSpeaking(true);
            targetGesture.current = 1; // Explaining/welcoming gesture
          };
          
          audio.onended = () => {
            setIsSpeaking(false);
            setTimeout(() => setCurrentSubtitle(""), 1000);
            setIsEndingSequence(false);
            setIsCameraFlyAway(true); // Trigger camera fly away
          };
          
          audio.onerror = () => {
            console.error("Ending audio failed to load");
            setIsSpeaking(false);
            setTimeout(() => setCurrentSubtitle(""), 1000);
            setIsEndingSequence(false);
            setIsCameraFlyAway(true);
          };
          
          audio.play().catch(err => {
            console.error("Audio play blocked", err);
            setTimeout(() => {
              setCurrentSubtitle("");
              setIsEndingSequence(false);
              setIsCameraFlyAway(true);
            }, 4000);
          });
        } catch (err) {
          console.error("Ending audio exception", err);
          setIsCameraFlyAway(true);
        }
      }, 2000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isEndingSequence, setIsEndingSequence, setIsCameraFlyAway, setCurrentSubtitle, setIsSpeaking]);

  useFrame((state, delta) => {
    if (!vrm) return;
    vrm.update(delta);

    const h = vrm.humanoid;
    const time = state.clock.elapsedTime;
    
    // Hold DBVRM in the sky synchronously with UserVRM during teleport
    if (hasTeleported && rbRef.current) {
      if (teleportTimerRef.current < 2.5) {
        teleportTimerRef.current += delta;
        rbRef.current.setTranslation({ x: 5.5, y: 55, z: -10.5 }, true);
        rbRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        rbRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
        return; // Skip normal physics movement while suspended
      }
    }

    // --- Lower Body Posture ---
    const hips = h?.getNormalizedBoneNode('hips');
    const leftLeg = h?.getNormalizedBoneNode('leftUpperLeg');
    const rightLeg = h?.getNormalizedBoneNode('rightUpperLeg');
    const leftKnee = h?.getNormalizedBoneNode('leftLowerLeg');
    const rightKnee = h?.getNormalizedBoneNode('rightLowerLeg');

    if (!hasTeleported) {
      if (hips) hips.position.y = THREE.MathUtils.lerp(hips.position.y, 0.45, delta * 5);
      if (leftLeg) {
        leftLeg.rotation.x = THREE.MathUtils.lerp(leftLeg.rotation.x, -1.4, delta * 5);
        leftLeg.rotation.z = THREE.MathUtils.lerp(leftLeg.rotation.z, 0.08, delta * 5);
      }
      if (rightLeg) {
        rightLeg.rotation.x = THREE.MathUtils.lerp(rightLeg.rotation.x, -1.4, delta * 5);
        rightLeg.rotation.z = THREE.MathUtils.lerp(rightLeg.rotation.z, -0.08, delta * 5);
      }
      if (leftKnee) leftKnee.rotation.x = THREE.MathUtils.lerp(leftKnee.rotation.x, 1.3, delta * 5);
      if (rightKnee) rightKnee.rotation.x = THREE.MathUtils.lerp(rightKnee.rotation.x, 1.3, delta * 5);
    } else {
      // When teleported, reset hips Y and Z rotations so he stands up straight
      if (hips) hips.position.y = THREE.MathUtils.lerp(hips.position.y, 0.85, delta * 10);
      if (leftLeg) {
        leftLeg.rotation.x = THREE.MathUtils.lerp(leftLeg.rotation.x, 0, delta * 10);
        leftLeg.rotation.z = THREE.MathUtils.lerp(leftLeg.rotation.z, 0, delta * 10);
      }
      if (rightLeg) {
        rightLeg.rotation.x = THREE.MathUtils.lerp(rightLeg.rotation.x, 0, delta * 10);
        rightLeg.rotation.z = THREE.MathUtils.lerp(rightLeg.rotation.z, 0, delta * 10);
      }
      if (leftKnee) leftKnee.rotation.x = THREE.MathUtils.lerp(leftKnee.rotation.x, 0, delta * 10);
      if (rightKnee) rightKnee.rotation.x = THREE.MathUtils.lerp(rightKnee.rotation.x, 0, delta * 10);
    }

    // --- Dynamic Audio Logic & Lip Sync ---
    let volume = 0;

    // Manage virtual dialogue time
    if (isPlaying && audioRef.current) {
      dialogueTimeRef.current = audioRef.current.currentTime;
    } else if (!isPlaying && !isIntroFinished && dialogueTimeRef.current > 0 && dialogueTimeRef.current < 85) {
      dialogueTimeRef.current += delta;
    } else if (isIntroFinished && !aiAudioUrl) {
      dialogueTimeRef.current = 0;
    }

    // Update Subtitles continuously
    if (dialogueTimeRef.current > 0) {
      const activeSub = SUBTITLES.reduce((prev, curr) => {
        return dialogueTimeRef.current >= curr.time ? curr : prev;
      }, SUBTITLES[0]);

      if (activeSub && activeSub.text !== currentSubtitle) {
        setCurrentSubtitle(activeSub.text);
      }
    }

    let targetMouth = 0;

    if (isPlaying && analyserRef.current && audioRef.current) {
      analyserRef.current.getByteFrequencyData(dataArray.current);
      let sum = 0;
      for (let i = 0; i < dataArray.current.length; i++) {
        sum += dataArray.current[i];
      }
      const average = sum / dataArray.current.length;

      targetMouth = average > 5 ? average / 50.0 : 0;
    } else if (isSpeaking && !isPlaying) {
      // Spoof lip-sync for AI TTS since window.speechSynthesis doesn't pipe to AudioContext
      targetMouth = Math.random() > 0.3 ? 0.2 + Math.random() * 0.6 : 0.05;
    }

    smoothedMouth.current = THREE.MathUtils.lerp(smoothedMouth.current, targetMouth, 0.2);

    if (targetMouth > 0.3) {
      vrm.expressionManager?.setValue('aa', smoothedMouth.current * 0.7);
      vrm.expressionManager?.setValue('ih', smoothedMouth.current * 0.2);
      vrm.expressionManager?.setValue('ou', (Math.sin(time * 10) > 0 ? 0.3 : 0));
    } else {
      vrm.expressionManager?.setValue('aa', smoothedMouth.current);
      vrm.expressionManager?.setValue('ih', 0);
      vrm.expressionManager?.setValue('ou', 0);
    }

    // 2. Expressions
    const currentTime = audioRef.current ? audioRef.current.currentTime : 0;
    if (currentTime > 45 && currentTime < 55) {
      vrm.expressionManager?.setValue('joy', THREE.MathUtils.lerp(vrm.expressionManager.getValue('joy') || 0, 0.8, delta));
      vrm.expressionManager?.setValue('neutral', THREE.MathUtils.lerp(vrm.expressionManager.getValue('neutral') || 1, 0, delta));
    } else {
      vrm.expressionManager?.setValue('joy', THREE.MathUtils.lerp(vrm.expressionManager.getValue('joy') || 0, 0, delta));
      vrm.expressionManager?.setValue('neutral', THREE.MathUtils.lerp(vrm.expressionManager.getValue('neutral') || 0, 1, delta));
    }

    // 3. Gesture State Machine
    if (targetMouth > 0.1 && time - lastGestureChange.current > 2 + Math.random() * 2) {
      let newGesture = Math.floor(Math.random() * GESTURES.length);
      if (newGesture === 0) newGesture = 1;
      targetGesture.current = newGesture;
      lastGestureChange.current = time;
    }

    // Return to rest when neither playing nor speaking
    if (!isPlaying && !isSpeaking) {
      targetGesture.current = 0;
      smoothedMouth.current = THREE.MathUtils.lerp(smoothedMouth.current, 0, delta * 10);
      vrm.expressionManager?.setValue('aa', smoothedMouth.current);
      vrm.expressionManager?.setValue('ih', 0);
      vrm.expressionManager?.setValue('ou', 0);
    }

    // --- Apply Blinking ---
    if (time > blinkTimer.current) {
      vrm.expressionManager?.setValue('blink', 1);
      if (time > blinkTimer.current + 0.1) {
        vrm.expressionManager?.setValue('blink', 0);
        blinkTimer.current = time + 3 + Math.random() * 4;
      }
    }

    // --- Apply Procedural Upper Body Gestures via State Machine ---
    const g = GESTURES[targetGesture.current];
    const lerpSpeed = delta * 4;

    const spine = h?.getNormalizedBoneNode('spine');
    const head = h?.getNormalizedBoneNode('head');
    const leftArm = h?.getNormalizedBoneNode('leftUpperArm');
    const leftElbow = h?.getNormalizedBoneNode('leftLowerArm');
    const rightArm = h?.getNormalizedBoneNode('rightUpperArm');
    const rightElbow = h?.getNormalizedBoneNode('rightLowerArm');

    // Subtle head bobbing and breathing
    const breathing = Math.sin(time * 1.5) * 0.02;

    if (spine) {
      spine.rotation.set(0.1 + breathing, 0, 0);
    }

    if (head) {
      const headEmphasis = (isPlaying && volume > 0.3) ? -0.05 * volume : 0;
      head.rotation.set(Math.sin(time * 2) * 0.02 - 0.1 + headEmphasis, 0, 0);
    }

    if (handingOverPaperIndex !== null) {
      receiveTimeRef.current += delta;
      const extensionProgress = Math.min(receiveTimeRef.current * 2, 1);

      // DB extends right arm to receive
      if (rightArm) {
        rightArm.rotation.set(0.2, 0, THREE.MathUtils.lerp(-1.2, -1.5, extensionProgress));
      }
      if (rightElbow) {
        rightElbow.rotation.set(THREE.MathUtils.lerp(-0.5, -0.1, extensionProgress), 0, 0);
      }
    } else {
      receiveTimeRef.current = 0;
      if (rightArm) {
        rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, g.rua[0], lerpSpeed);
        rightArm.rotation.y = THREE.MathUtils.lerp(rightArm.rotation.y, g.rua[1], lerpSpeed);
        rightArm.rotation.z = THREE.MathUtils.lerp(rightArm.rotation.z, g.rua[2], lerpSpeed);
      }
      if (rightElbow) {
        rightElbow.rotation.x = THREE.MathUtils.lerp(rightElbow.rotation.x, g.rla[0], lerpSpeed);
        rightElbow.rotation.y = THREE.MathUtils.lerp(rightElbow.rotation.y, g.rla[1], lerpSpeed);
        rightElbow.rotation.z = THREE.MathUtils.lerp(rightElbow.rotation.z, g.rla[2], lerpSpeed);
      }
    }

    if (leftArm) {
      leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, g.lua[0], lerpSpeed);
      leftArm.rotation.y = THREE.MathUtils.lerp(leftArm.rotation.y, g.lua[1], lerpSpeed);
      leftArm.rotation.z = THREE.MathUtils.lerp(leftArm.rotation.z, g.lua[2], lerpSpeed);
    }
    if (leftElbow) {
      leftElbow.rotation.x = THREE.MathUtils.lerp(leftElbow.rotation.x, g.lla[0], lerpSpeed);
      leftElbow.rotation.y = THREE.MathUtils.lerp(leftElbow.rotation.y, g.lla[1], lerpSpeed);
      leftElbow.rotation.z = THREE.MathUtils.lerp(leftElbow.rotation.z, g.lla[2], lerpSpeed);
    }

    // Teleportation hands animation
    if (isTeleporting && vrm && !hasTeleported) {
      const rightArm = vrm.humanoid?.getRawBoneNode('rightUpperArm');
      const rightLower = vrm.humanoid?.getRawBoneNode('rightLowerArm');

      // Reach forward and slightly inward toward the center crystal with right hand only
      if (rightArm) {
        rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, 0.8, delta * 3);
        rightArm.rotation.z = THREE.MathUtils.lerp(rightArm.rotation.z, 0.2, delta * 3);
      }

      // Straighten the lower arm slightly to touch it
      if (rightLower) rightLower.rotation.x = THREE.MathUtils.lerp(rightLower.rotation.x, -0.2, delta * 3);
    }

    // Follow the user if teleported
    if (hasTeleported && groupRef.current) {
      const userPos = (window as any).characterPosition;
      if (userPos && hasTeleported && rbRef.current) {
        const dbPos = rbRef.current.translation();
        const dx = userPos.x - dbPos.x;
        const dz = userPos.z - dbPos.z;
        const dist2D = Math.sqrt(dx * dx + dz * dz);

        const currentVel = rbRef.current.linvel();

        // Use 1.6 to ensure the asymptotic lerp actually stops instead of constantly thinking it's moving
        if (dist2D > 1.6) {
          // Move towards user if too far
          const dirX = dx / dist2D;
          const dirZ = dz / dist2D;

          const targetX = userPos.x - dirX * 1.5;
          const targetZ = userPos.z - dirZ * 1.5;

          const velX = (targetX - dbPos.x) * 4.0;
          const velZ = (targetZ - dbPos.z) * 4.0;
          
          rbRef.current.setLinvel({ x: velX, y: currentVel.y, z: velZ }, true);

          // Walking bobbing effect on visual group
          if (groupRef.current) {
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 15) * 0.02;
          }

          // Simple arm and leg swing animation for DB while walking
          const walkCycle = state.clock.elapsedTime * 10;
          const leftArm = vrm.humanoid?.getRawBoneNode('leftUpperArm');
          const rightArm = vrm.humanoid?.getRawBoneNode('rightUpperArm');
          if (leftArm) leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, Math.sin(walkCycle) * 0.3, delta * 10);
          if (rightArm) rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, Math.sin(walkCycle + Math.PI) * 0.3, delta * 10);

          if (leftLeg) leftLeg.rotation.x = THREE.MathUtils.lerp(leftLeg.rotation.x, Math.sin(walkCycle) * 0.5, delta * 10);
          if (rightLeg) rightLeg.rotation.x = THREE.MathUtils.lerp(rightLeg.rotation.x, Math.sin(walkCycle + Math.PI) * 0.5, delta * 10);
          if (leftKnee) leftKnee.rotation.x = THREE.MathUtils.lerp(leftKnee.rotation.x, Math.max(0, -Math.sin(walkCycle - Math.PI / 4)) * 0.8, delta * 10);
          if (rightKnee) rightKnee.rotation.x = THREE.MathUtils.lerp(rightKnee.rotation.x, Math.max(0, -Math.sin(walkCycle + Math.PI * 0.75)) * 0.8, delta * 10);
        } else {
          // Stop moving
          rbRef.current.setLinvel({ x: 0, y: currentVel.y, z: 0 }, true);
          if (groupRef.current) {
            groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, delta * 10);
          }

          // Smoothly reset arms and legs when standing still
          const leftArm = vrm.humanoid?.getRawBoneNode('leftUpperArm');
          const rightArm = vrm.humanoid?.getRawBoneNode('rightUpperArm');
          if (leftArm) leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, 0, delta * 5);
          if (rightArm) rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, 0, delta * 5);

          if (leftLeg) leftLeg.rotation.x = THREE.MathUtils.lerp(leftLeg.rotation.x, 0, delta * 5);
          if (rightLeg) rightLeg.rotation.x = THREE.MathUtils.lerp(rightLeg.rotation.x, 0, delta * 5);
          if (leftKnee) leftKnee.rotation.x = THREE.MathUtils.lerp(leftKnee.rotation.x, 0, delta * 5);
          if (rightKnee) rightKnee.rotation.x = THREE.MathUtils.lerp(rightKnee.rotation.x, 0, delta * 5);
        }

        // Look at the user (rotate on Y axis only)
        if (groupRef.current) {
          const lookTarget = new THREE.Vector3(userPos.x, dbPos.y, userPos.z);
          groupRef.current.lookAt(lookTarget);
        }
      }
    }
  });

  useEffect(() => {
    if (hasTeleported && rbRef.current) {
      teleportTimerRef.current = 0;
      // Synchronous teleport with UserVRM
      rbRef.current.setTranslation({ x: 5.5, y: 55, z: -10.5 }, true);
      rbRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      rbRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
  }, [hasTeleported]);

  return (
    <RigidBody
      ref={rbRef}
      type={hasTeleported ? 'dynamic' : 'kinematicPosition'}
      position={position}
      lockRotations
      colliders={false}
      ccd
    >
      <CapsuleCollider args={[0.6, 0.3]} position={[0, 0.9, 0]} />
      <group
        ref={groupRef}
        rotation={hasTeleported ? undefined : rotation || [0, 0, 0]}
        scale={typeof scale === 'number' ? [scale, scale, scale] : scale}
        visible={!focusedShelfTier}
      >
        {vrm && <primitive object={vrm.scene} />}
        {vrm && isIntroFinished && !isEndingSequence && !isCameraFlyAway && (
          <Html center position={[0, 1.75, 0]}>
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.9)', // Red box
              color: 'white',
              padding: '2px 8px',
              borderRadius: '4px',
              fontFamily: '"Outfit", sans-serif',
              fontSize: '12px',
              fontWeight: 700,
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              letterSpacing: '1px'
            }}>
              Manohar
            </div>
          </Html>
        )}
      </group>
    </RigidBody>
  );
}
