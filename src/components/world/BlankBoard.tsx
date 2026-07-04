import { RigidBody } from '@react-three/rapier';
import { Text } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';

interface BlankBoardProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}

const GITHUB_REPOS = [
  { 
    name: 'Signal Forge', 
    repo: 'eda-signal-forge',
    desc: 'Signal Forge is an advanced Forensic Biometric Workstation designed to find, analyze, and clear complex signal artifacts in Electrodermal Activity data. By leveraging unsupervised machine learning algorithms, it automates the tedious cleaning of biometric datasets. This allows researchers to effortlessly extract meaningful insights, processing massive amounts of physiological information with incredible speed and precision.',
    images: ['docs/architecture.png', 'eda-insight/public/deep-dive/adaptive_threshold.png', 'eda-insight/public/deep-dive/age_dependency.png']
  },
  { 
    name: 'TradeFlow Bot',
    repo: 'trading-bot', 
    desc: 'TradeFlow Bot is a fully automated algorithmic trading command-line execution engine tailored for Binance Futures. Built for speed, this high-performance bot allows traders to deploy quantitative strategies and execute trades with minimal latency. It constantly monitors real-time market data, automatically identifies profitable trends, and flawlessly executes strict, data-driven decisions while entirely removing human emotion.',
    images: []
  },
  { 
    name: 'Memory Album',
    repo: 'Memory-Albumn', 
    desc: 'Memory Album is a beautifully immersive and fully interactive 3D WebGL digital memory book experience that brings your photos to life in the web browser. Built using React Three Fiber, this project explores the absolute limits of creative 3D web design. It allows users to physically flip through virtual pages, creating pure digital joy.',
    images: ['screenshots/home.png']
  },
  { 
    name: 'Eduverse AI', 
    repo: 'eduverse-ai',
    desc: 'Eduverse AI is a next-generation, AI-powered educational platform meticulously designed to revolutionize how students learn and interact with educational content. By integrating smart, conversational AI tutoring systems, the platform provides highly personalized learning experiences. It features interactive tools, dynamic quizzes, and real-time feedback mechanisms that make studying engaging, democratizing education with a knowledgeable AI tutor.',
    images: []
  },
  { 
    name: 'AI Explorations', 
    repo: 'ai',
    desc: 'AI Explorations is a comprehensive collection of advanced Artificial Intelligence and Machine Learning research notebooks, scripts, and experimental models. This repository serves as a sandbox to deeply explore foundational data science concepts, experiment with cutting-edge neural networks, and push the boundaries of modern AI. It acts as a living portfolio of my journey through AI.',
    images: []
  },
  { 
    name: 'AI Control System', 
    repo: 'ai-control-system',
    desc: 'AI Control System is a highly sophisticated dashboard and command center built specifically for managing, monitoring, and deploying AI models at scale. It provides tools that allow administrators to track real-time performance metrics and seamlessly manage complex model configurations. Users can visually oversee their entire AI infrastructure, ensuring bots run efficiently, safely, and entirely command-line free.',
    images: ['docs/assets/banner.png', 'docs/assets/architecture.png']
  },
  { 
    name: 'ServiceNow Suite', 
    repo: 'sn-cad',
    desc: 'ServiceNow Suite is a custom study tool I built to extract repeated questions from PDFs and convert them into structured JSON data. It automatically generates interactive mock tests and flashcards to track my accuracy. This powerful suite was specifically designed to deeply analyze my performance and perfectly prepare me for both the ServiceNow CSA and CAD certification exams.',
    images: []
  },
  { 
    name: 'Mobile Challenge', 
    repo: 'mobile_app_developer_challenge_KandulamanoharTej',
    desc: 'Mobile Challenge is my official, highly competitive submission for a prestigious mobile app developer contest. Built entirely from scratch using the modern Flutter framework, this application showcases my ability to rapidly prototype polished software under tight deadlines. The app features completely smooth animations and highly robust state management, proving my capability to deploy production-ready applications.',
    images: []
  },
  { 
    name: 'Bday Experience', 
    repo: 'bday',
    desc: 'Bday Experience is a highly personalized, delightfully interactive HTML webpage created specifically to bring joy and celebrate a special birthday. As a creative front-end side project, it heavily utilizes advanced CSS animations, custom JavaScript logic, and carefully crafted interactive elements. It proves that programming can be a wonderfully expressive medium for creating memorable digital experiences.',
    images: ['birthday-menace/assets/images/Picsart_26-01-15_01-55-42-333.jpg']
  },
];

export function BlankBoard({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }: BlankBoardProps) {
  // Generate a stylized, anime-friendly wood texture with rings and grain
  const woodTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Base cartoon-wood color
    ctx.fillStyle = '#b07b46';
    ctx.fillRect(0, 0, 512, 512);

    // Draw wavy wood grain lines
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#8b5a2b';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = -10; i < 40; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * 15);
      for (let x = 0; x <= 512; x += 20) {
        ctx.lineTo(x, i * 15 + Math.sin(x * 0.03 + i) * 12);
      }
      ctx.stroke();
    }

    // Add wooden knots (rings)
    for (let i = 0; i < 6; i++) {
      const kx = Math.random() * 512;
      const ky = Math.random() * 512;
      for (let r = 4; r < 24; r += 5) {
        ctx.beginPath();
        // Slightly squished circles for a natural knot look
        ctx.ellipse(kx, ky, r * 1.5, r, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    
    // NearestFilter keeps it sharp/stylized
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    
    return texture;
  }, []);

  const activeBoardItem = useAppStore((state) => state.activeShelfItems.board);
  const currentProject = GITHUB_REPOS[activeBoardItem || 0];

  return (
    <RigidBody type="fixed" colliders="cuboid" position={position} rotation={rotation}>
      <group 
        scale={typeof scale === 'number' ? [scale, scale, scale] : scale}
        onClick={(e) => {
          e.stopPropagation();
          useAppStore.getState().setFocusedShelfTier('board');
          useAppStore.getState().setViewedProject(activeBoardItem || 0);
          
          if (useAppStore.getState().currentQuestId === 'go_to_projects') {
             const viewed = useAppStore.getState().viewedProjects;
             if (viewed.length === GITHUB_REPOS.length || (viewed.length === GITHUB_REPOS.length - 1 && !viewed.includes(activeBoardItem || 0))) {
                 useAppStore.getState().setCurrentQuestId('go_to_media');
             }
          }
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Left Post */}
        <mesh position={[-1.6, 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.2, 4, 0.2]} />
          <meshStandardMaterial map={woodTexture || undefined} color="#ffffff" roughness={0.9} />
        </mesh>
        
        {/* Right Post */}
        <mesh position={[1.6, 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.2, 4, 0.2]} />
          <meshStandardMaterial map={woodTexture || undefined} color="#ffffff" roughness={0.9} />
        </mesh>

        {/* Top Bar */}
        <mesh position={[0, 3.9, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.4, 0.2, 0.22]} />
          <meshStandardMaterial map={woodTexture || undefined} color="#ffffff" roughness={0.9} />
        </mesh>

        {/* Bottom Bar */}
        <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.4, 0.2, 0.22]} />
          <meshStandardMaterial map={woodTexture || undefined} color="#ffffff" roughness={0.9} />
        </mesh>

        {/* White Screen Base */}
        <mesh position={[0, 2.85, 0.05]} castShadow receiveShadow>
          <boxGeometry args={[3, 1.9, 0.1]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
        
        {/* NATIVE 3D PORTFOLIO CONTENT */}
        <group position={[0, 2.85, 0.101]}>
          
          {/* Top Heading */}
          <Text 
            position={[0, 0.75, 0]} 
            fontSize={0.20} 
            color="#0f172a" 
            anchorX="center" 
            anchorY="middle" 
            fontWeight="bold"
          >
            {currentProject.name}
          </Text>
          <mesh position={[0, 0.60, 0]}>
            <planeGeometry args={[2.8, 0.01]} />
            <meshBasicMaterial color="#cbd5e1" />
          </mesh>

          {/* Left Column: Active Project Details */}
          <group position={[-1.35, 0.45, 0]}>
            <Text 
              position={[0, 0, 0]} 
              fontSize={0.07} 
              color="#334155" 
              anchorX="left" 
              anchorY="top" 
              maxWidth={1.35}
              lineHeight={1.4}
            >
              {currentProject.desc}
            </Text>
          </group>

          {/* Right Column: Native 3D Image Placeholder */}
          <group position={[0.8, 0.15, 0]}>
            <mesh position={[0, 0, 0]} castShadow>
              <planeGeometry args={[1.3, 0.8]} />
              <meshBasicMaterial color="#1e293b" />
            </mesh>
            <mesh position={[0, 0, 0.01]}>
              <planeGeometry args={[1.2, 0.7]} />
              <meshBasicMaterial color="#0f172a" />
            </mesh>
            <Text position={[0, 0, 0.02]} fontSize={0.08} color="#475569" anchorX="center" anchorY="middle">
              [ Image Placeholder ]
            </Text>
          </group>

        </group>
        
        {/* Back of the board (wood) */}
        <mesh position={[0, 2.85, -0.05]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 2.1, 0.1]} />
          <meshStandardMaterial map={woodTexture || undefined} color="#ffffff" roughness={0.9} />
        </mesh>
      </group>
    </RigidBody>
  );
}
