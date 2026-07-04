import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import { useAppStore } from '../../store/useAppStore';

// A single GLTF animated bird
const FlyingSeagull = ({ position, rotation, scale = 1, speedOffset = 0, radius = 50 }: any) => {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('/flying_seagull.glb');
  
  // Clone the scene so we can have multiple independent birds
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    // Play the first available animation (usually flying/flapping)
    if (actions && Object.keys(actions).length > 0) {
      const actionName = Object.keys(actions)[0];
      const action = actions[actionName];
      if (action) {
        // Vary playback speed slightly so they don't all flap in unison
        action.setEffectiveTimeScale(0.8 + Math.random() * 0.4);
        action.play();
      }
    }
  }, [actions]);

  useFrame((state) => {
    if (group.current) {
      // Smooth circular sweeping flight paths using time
      const time = state.clock.elapsedTime * (0.2 + speedOffset);
      group.current.position.x = position[0] + Math.cos(time + position[0]) * radius;
      group.current.position.y = position[1] + Math.sin(time * 0.5) * 5; // Slight bobbing up and down
      group.current.position.z = position[2] + Math.sin(time + position[0]) * radius;
      
      // Face the direction of flight (tangent to the circle)
      // Since it's moving clockwise/counter-clockwise, rotation is derived from time
      group.current.rotation.y = -(time + position[0]);
      
      // Bank into the turn
      group.current.rotation.z = -0.3; 
    }
  });

  return (
    <group ref={group} position={position} rotation={rotation} scale={scale} dispose={null}>
      <primitive object={clone} />
    </group>
  );
};

export const Birds = () => {
  const isSpeaking = useAppStore(state => state.isSpeaking);
  const isSpeakingRef = useRef(false);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const waveGainRef = useRef<GainNode | null>(null);
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  const isMusicMuted = useAppStore(state => state.isMusicMuted);
  
  // Keep ref in sync for interval callbacks and instantly adjust BGM volume
  useEffect(() => {
     isSpeakingRef.current = isSpeaking;
     if (bgmRef.current) {
        if (isMusicMuted) {
          bgmRef.current.pause();
        } else {
          // Play if not playing, handle autoplay policy
          if (bgmRef.current.paused) bgmRef.current.play().catch(() => {});
          bgmRef.current.volume = isSpeaking ? 0.05 : 0.4;
        }
     }
  }, [isSpeaking, isMusicMuted]);

  // Setup procedural environmental sounds (Ocean Waves & Seagulls)
  useEffect(() => {
    let waveNoiseSource: AudioBufferSourceNode | null = null;
    
    const initAudio = () => {
      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) audioCtxRef.current = new AudioContext();
      }
      return audioCtxRef.current && audioCtxRef.current.state === 'running';
    };

    // 🌊 Procedural Ocean Waves Crashing Sound
    const startOceanWaves = () => {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      
      // Create white noise buffer
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      
      waveNoiseSource = ctx.createBufferSource();
      waveNoiseSource.buffer = noiseBuffer;
      waveNoiseSource.loop = true;

      const waveFilter = ctx.createBiquadFilter();
      waveFilter.type = 'lowpass';
      
      const waveGain = ctx.createGain();
      waveGain.gain.value = 0.05; 
      waveGainRef.current = waveGain;
      
      waveNoiseSource.connect(waveFilter);
      waveFilter.connect(waveGain);
      waveGain.connect(ctx.destination);
      
      waveNoiseSource.start();

      // Modulate waves crashing every ~6 seconds
      const waveCycle = () => {
        const ctx = audioCtxRef.current;
        const gainNode = waveGainRef.current;
        if (!ctx || !gainNode) return;
        
        const t = ctx.currentTime;
        const speaking = isSpeakingRef.current;
        // High volume if walking, low volume if speaking
        const muted = useAppStore.getState().isOceanMuted || useAppStore.getState().isSfxMuted;
        const peakVol = muted ? 0 : (speaking ? 0.04 : 0.25);
        const lowVol = muted ? 0 : (speaking ? 0.01 : 0.05);

        // Wave rolls in
        gainNode.gain.linearRampToValueAtTime(peakVol, t + 2);
        waveFilter.frequency.setValueAtTime(200, t);
        waveFilter.frequency.exponentialRampToValueAtTime(800, t + 2);
        // Wave pulls back
        gainNode.gain.linearRampToValueAtTime(lowVol, t + 5);
        waveFilter.frequency.exponentialRampToValueAtTime(150, t + 5);
      };
      
      waveCycle();
      const waveInterval = setInterval(waveCycle, 6000);
      return waveInterval;
    };

    // 🦅 Procedural "Kewhh Kewh" Seagull Cry
    const playSeagullCry = () => {
      const ctx = audioCtxRef.current;
      if (!ctx || document.hidden) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      filter.type = 'bandpass';
      filter.frequency.value = 1800;
      filter.Q.value = 1.5;
      osc.type = 'sawtooth';

      const t = ctx.currentTime;
      const basePitch = 1200 + Math.random() * 400; 
      
      const speaking = isSpeakingRef.current;
      const muted = useAppStore.getState().isBirdsMuted || useAppStore.getState().isSfxMuted;
      // High volume if walking, very quiet if speaking
      const peakVol = muted ? 0 : (speaking ? 0.02 : 0.15);
      
      // 1st Kewh
      osc.frequency.setValueAtTime(basePitch, t);
      osc.frequency.exponentialRampToValueAtTime(basePitch - 400, t + 0.25);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(peakVol, t + 0.05);
      gain.gain.linearRampToValueAtTime(0, t + 0.25);

      // 2nd Kewh
      osc.frequency.setValueAtTime(basePitch, t + 0.35);
      osc.frequency.exponentialRampToValueAtTime(basePitch - 400, t + 0.6);
      gain.gain.setValueAtTime(0, t + 0.35);
      gain.gain.linearRampToValueAtTime(peakVol, t + 0.4);
      gain.gain.linearRampToValueAtTime(0, t + 0.6);

      // 3rd Kewh
      osc.frequency.setValueAtTime(basePitch, t + 0.7);
      osc.frequency.exponentialRampToValueAtTime(basePitch - 400, t + 0.95);
      gain.gain.setValueAtTime(0, t + 0.7);
      gain.gain.linearRampToValueAtTime(peakVol, t + 0.75);
      gain.gain.linearRampToValueAtTime(0, t + 0.95);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(t);
      osc.stop(t + 1.0);
    };

    let waveIntervalId: number | null = null;
    
    // Play chirps more frequently because there are 20 birds now!
    const birdInterval = setInterval(() => {
      if (initAudio()) {
        if (!waveNoiseSource) {
           waveIntervalId = startOceanWaves() as unknown as number;
        }
        if (Math.random() > 0.4) playSeagullCry();
      }
    }, 2500 + Math.random() * 3000);

    // Initial click listener to start audio context (browsers block audio until user interacts)
    const handleUserInteraction = async () => {
      // First ensure the context is created
      initAudio();
      
      // Force resume the audio context because browsers suspend it by default
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume();
      }
      
      if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
        if (!waveNoiseSource) {
           waveIntervalId = startOceanWaves() as unknown as number;
        }
        
        // Start the Background Music downloaded from YouTube
        if (!bgmRef.current) {
          const bgm = new Audio('/bgm.webm');
          bgm.loop = true;
          bgm.volume = isSpeakingRef.current ? 0.05 : 0.4;
          if (!useAppStore.getState().isMusicMuted) {
            bgm.play().catch(e => console.error("Audio play failed:", e));
          }
          bgmRef.current = bgm;
        }
      }
    };
    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);

    return () => {
      clearInterval(birdInterval);
      if (waveIntervalId) clearInterval(waveIntervalId);
      if (waveNoiseSource) waveNoiseSource.stop();
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current.currentTime = 0;
      }
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  // Generate 20 birds with randomized flight paths, scales, and positions
  const birdData = useMemo(() => {
    return Array.from({ length: 20 }).map(() => ({
      x: (Math.random() - 0.5) * 80, // Spread across the island
      y: 20 + Math.random() * 25,    // Fly at varying heights between 20 and 45
      z: (Math.random() - 0.5) * 80, // Spread across the island
      scale: 0.7 + Math.random() * 0.6, // Randomize sizes
      speedOffset: (Math.random() - 0.5) * 0.1, // Vary flight speed
      radius: 20 + Math.random() * 40, // Vary how wide their circular path is
    }));
  }, []);

  return (
    <group>
      {birdData.map((bird, i) => (
        <FlyingSeagull 
          key={i} 
          position={[bird.x, bird.y, bird.z]} 
          scale={bird.scale} 
          speedOffset={bird.speedOffset} 
          radius={bird.radius} 
        />
      ))}
    </group>
  );
};

// Preload the model
useGLTF.preload('/flying_seagull.glb');
