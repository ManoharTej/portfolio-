import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { useAppStore } from '../../store/useAppStore';

const finalName = "MANOHAR TEJ";

const LotteryNameText = ({ startDelay }: { startDelay: number }) => {
  const [displayName, setDisplayName] = useState("");
  const hasStarted = useRef(false);

  useEffect(() => {
    const startLottery = () => {
      let iteration = 0;
      const interval = setInterval(() => {
        setDisplayName(finalName.split("").map((letter, index) => {
          if (letter === " ") return " ";
          if (index < iteration) return finalName[index];
          return Math.floor(Math.random() * 10).toString();
        }).join(""));
        
        if (iteration >= finalName.length) clearInterval(interval);
        iteration += 1 / 4; 
      }, 30);
    };

    if (!hasStarted.current) {
      hasStarted.current = true;
      setTimeout(startLottery, startDelay * 1000);
    }
  }, [startDelay]);

  return (
    <div style={{
      fontSize: '6.5rem',
      color: '#60A5FA',
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 900,
      letterSpacing: '8px',
      lineHeight: 1.1,
      textShadow: '0 0 30px rgba(96, 165, 250, 0.4)',
      marginBottom: '40px',
      minHeight: '7rem' 
    }}>
      {displayName}
    </div>
  );
};


export const WelcomeScreen = () => {
  const introStage = useAppStore(state => state.introStage);
  const setIntroStage = useAppStore(state => state.setIntroStage);
  const visitorName = useAppStore(state => state.visitorName);
  const setVisitorName = useAppStore(state => state.setVisitorName);
  const visitorEmail = useAppStore(state => state.visitorEmail);
  const setVisitorEmail = useAppStore(state => state.setVisitorEmail);


  const hasAnimated = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Caveat:wght@600&family=Montserrat:wght@900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  useEffect(() => {
    if (introStage === 'welcome' && !hasAnimated.current) {
      hasAnimated.current = true;
      
      if (svgRef.current) {
        const paths = svgRef.current.querySelectorAll('.draw-path');
        paths.forEach((path: any) => {
          const length = path.getTotalLength();
          path.style.strokeDasharray = length;
          path.style.strokeDashoffset = length;
        });
      }

      const tl = gsap.timeline();

      if (containerRef.current) {
        gsap.set(containerRef.current, { backgroundColor: 'rgba(0, 0, 0, 1)' });
      }

      // --- BACKGROUND DRAWING ---
      tl.to('.sun-path', { strokeDashoffset: 0, duration: 2.5, ease: "power1.inOut" }, 0)
        .to('.mountain-path', { strokeDashoffset: 0, duration: 2.5, ease: "power2.inOut" }, 0)
        .to('.bird-path', { strokeDashoffset: 0, duration: 1.5, stagger: 0.05, ease: "power1.out" }, 0.5)

      // --- BIRDS HOVERING & BACKGROUND FADE ---
      tl.to('.bird-group', { scaleY: 0.3, duration: 0.25, repeat: -1, yoyo: true, ease: "sine.inOut" }, 2.5)
      tl.to('.bird-group', {
        x: "+=15", 
        y: "-=10",
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        stagger: 0.1,
        ease: "sine.inOut"
      }, 2.5);

      tl.to(containerRef.current, {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        duration: 2.0,
        ease: "power2.inOut"
      }, 2.5);

      // --- TEXT ANIMATION ---
      const textStart = 4.0;
      tl.fromTo('.welcome-char', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.1, stagger: 0.1, ease: "none" }, textStart)
        .fromTo('.line-1', { width: "0%" }, { width: "100%", duration: 0.8, ease: "power2.inOut" }, "-=0.2")
        .fromTo('.subtext-char', { opacity: 0, y: 5 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power2.out" }, "-=0.4")
        .fromTo('.line-2', { width: "0%" }, { width: "100%", duration: 0.8, ease: "power2.inOut" }, "-=0.2")
        
      tl.fromTo('.start-button',
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0,
          duration: 1.2, 
          ease: "power2.out"
        },
        textStart + 3.0
      );
    }
  }, [introStage]);

  const handleStart = () => {
    // FIX: Only fade out the welcome text, NOT the entire wrapper container!
    gsap.to('.welcome-container', {
      opacity: 0,
      y: -30,
      duration: 0.8,
      ease: "power3.in",
      onComplete: () => {
        setIntroStage('form');
        // Ensure background is clean for the form screen
        if (containerRef.current) {
          gsap.to(containerRef.current, { backgroundColor: 'rgba(0, 0, 0, 0.6)', duration: 0.5 });
        }
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim()) return;
    
    gsap.to('.form-container', {
      opacity: 0,
      scale: 0.95,
      duration: 0.8,
      ease: "power2.in",
      onComplete: () => setIntroStage('complete')
    });
  };

  if (introStage === 'complete') return null;

  const renderSplitText = (text: string, className: string) => {
    return text.split("").map((char, i) => (
      <span key={`${className}-${i}`} className={className} style={{ opacity: 0, display: 'inline-block' }}>
        {char === " " ? "\u00A0" : char}
      </span>
    ));
  };

  // Generate 3 distinct groups of 3 birds in V-formations
  const generateBirds = () => {
    const birds = [];
    const groups = [
      { bx: 250, by: 120, scale: 0.6 }, // Left group
      { bx: 500, by: 100, scale: 0.4 }, // Center group (smaller, further away)
      { bx: 800, by: 150, scale: 0.7 }  // Right group (larger, closer)
    ];

    groups.forEach((g, gIndex) => {
      // Classic V-formation offsets
      const positions = [
        { x: g.bx, y: g.by },             // Leader (front)
        { x: g.bx - 35, y: g.by + 20 },   // Left wingman (behind)
        { x: g.bx + 35, y: g.by + 20 }    // Right wingman (behind)
      ];

      positions.forEach((pos, i) => {
        birds.push(
          <g key={`bird-${gIndex}-${i}`} className="bird-group" transform={`translate(${pos.x}, ${pos.y}) scale(${g.scale})`}>
            <path 
              className="draw-path bird-path" 
              d="M -15 -10 Q -5 -5 0 0 Q 5 -5 15 -10" 
              fill="none" 
              stroke={`rgba(255,255,255,0.8)`} 
              strokeWidth="3" 
              strokeLinecap="round" 
            />
          </g>
        );
      });
    });
    return birds;
  };

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        background: 'rgba(0,0,0,1)', // Starts pitch black
        overflow: 'hidden'
      }}
    >
      
      {/* SVG Background - only visible during welcome stage */}
      {introStage === 'welcome' && (
        <svg 
          ref={svgRef}
          width="100%" 
          height="100%" 
          viewBox="0 0 1000 500" 
          preserveAspectRatio="xMidYMid slice" 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            zIndex: -1, 
            opacity: 0.25 
          }}
        >
          <circle className="draw-path sun-path" cx="800" cy="120" r="60" fill="none" stroke="#fff" strokeWidth="2.5" />
          <path 
            className="draw-path sun-path" 
            d="M 800 45 L 800 25 M 800 195 L 800 215 M 725 120 L 705 120 M 875 120 L 895 120 M 747 67 L 733 53 M 853 173 L 867 187 M 747 173 L 733 187 M 853 67 L 867 53" 
            fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" 
          />

          <path 
            className="draw-path mountain-path" 
            d="M -50 500 L 150 250 Q 180 200 210 250 L 400 450 L 600 200 Q 640 150 680 200 L 900 450 L 1050 300" 
            fill="none" 
            stroke="#ffffff" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          <path 
            className="draw-path mountain-path" 
            d="M 100 500 L 350 320 Q 380 280 410 320 L 700 500 L 850 350 Q 880 320 910 350 L 1100 500" 
            fill="none" 
            stroke="rgba(255,255,255,0.4)" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          
          {/* 3 distinct groups of 3 birds in V-formation */}
          {generateBirds()}
        </svg>
      )}

      {/* TEXT LAYER */}
      {introStage === 'welcome' && (
        <div className="welcome-container" style={{ 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          width: '80%', 
          maxWidth: '800px', 
          zIndex: 10,
          filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.8))'
        }}>
          
          <div style={{
            fontSize: '6.5rem',
            color: '#fff',
            fontFamily: '"Bebas Neue", sans-serif',
            letterSpacing: '12px',
            lineHeight: 1,
            textShadow: '0 5px 15px rgba(0,0,0,0.5)'
          }}>
            {renderSplitText("WELCOME", "welcome-char")}
          </div>
          
          <div className="line-1" style={{
            width: '0%',
            height: '3px',
            background: 'rgba(255,255,255,0.8)',
            margin: '5px 0 15px 0',
            boxShadow: '0 0 10px rgba(255,255,255,0.3)'
          }}></div>
          
          <div style={{
            fontSize: '2.8rem',
            color: '#ffffff',
            fontFamily: '"Caveat", cursive',
            letterSpacing: '3px',
            lineHeight: 1,
            textShadow: '0 2px 10px rgba(255,255,255,0.3)'
          }}>
            {renderSplitText("To the world of", "subtext-char")}
          </div>

          <div className="line-2" style={{
            width: '0%',
            height: '3px',
            background: 'rgba(255,255,255,0.8)',
            margin: '15px 0 25px 0',
            boxShadow: '0 0 10px rgba(255,255,255,0.3)'
          }}></div>

          <LotteryNameText startDelay={5.5} />

          <button
            className="start-button"
            onClick={handleStart}
            style={{
              opacity: 0,
              padding: '14px 40px',
              fontSize: '18px',
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: 800,
              letterSpacing: '4px',
              color: '#000',
              background: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = '#60A5FA';
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.boxShadow = '0 0 25px rgba(96, 165, 250, 0.6)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = '#fff';
              e.currentTarget.style.color = '#000';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            START
          </button>
        </div>
      )}

      {/* FORM LAYER */}
      {introStage === 'form' && (
        <form className="form-container" onSubmit={handleSubmit} style={{
          background: 'rgba(0, 0, 0, 0.4)', // Very clean, simple background for the form
          padding: '50px 60px',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '30px',
          width: '450px',
          backdropFilter: 'blur(10px)', // Blur only applies directly behind the form box, not the whole screen
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
        }}>
          <h2 style={{ color: 'white', fontFamily: '"Bebas Neue", sans-serif', fontSize: '42px', margin: 0, letterSpacing: '2px' }}>IDENTIFY YOURSELF</h2>
          
          <div style={{ width: '100%' }}>
            <input
              type="text"
              placeholder="YOUR NAME"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '16px 24px',
                background: 'rgba(0,0,0,0.4)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '18px',
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 600,
                letterSpacing: '1px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={e => e.target.style.borderColor = '#60A5FA'}
              onBlur={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
            />
          </div>

          <div style={{ width: '100%' }}>
            <input
              type="email"
              placeholder="YOUR EMAIL (OPTIONAL)"
              value={visitorEmail}
              onChange={(e) => setVisitorEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 24px',
                background: 'rgba(0,0,0,0.4)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '18px',
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 600,
                letterSpacing: '1px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={e => e.target.style.borderColor = '#60A5FA'}
              onBlur={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '18px',
              fontSize: '20px',
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: 900,
              letterSpacing: '4px',
              color: '#000',
              background: '#fff',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = '#60A5FA';
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(96, 165, 250, 0.8)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = '#fff';
              e.currentTarget.style.color = '#000';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            DIVE IN
          </button>
        </form>
      )}
    </div>
  );
};
