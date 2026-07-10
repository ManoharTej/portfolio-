import { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

export function MiniMap() {
  const hasTeleported = useAppStore(state => state.hasTeleported);
  const isSittingAtTable = useAppStore(state => state.isSittingAtTable);
  const isMapExpanded = useAppStore(state => state.isMapExpanded);
  const setIsMapExpanded = useAppStore(state => state.setIsMapExpanded);
  
  const [playerPos, setPlayerPos] = useState({ x: 0, z: 0, rot: 0 });

  useEffect(() => {
    let animationFrameId: number;
    
    const updateMap = () => {
      if ((window as any).characterPosition) {
        const pos = (window as any).characterPosition;
        setPlayerPos({ x: pos.x, z: pos.z, rot: (window as any).cameraRotationY || 0 });
      }
      animationFrameId = requestAnimationFrame(updateMap);
    };
    
    updateMap();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  if (!hasTeleported && isSittingAtTable) return null;

  const size = isMapExpanded ? 300 : 150;
  
  // Mapping world coordinates to map pixels.
  // The world ranges from roughly x: -100 to 100, z: -100 to 150.
  // We'll center the map differently based on teleport status
  const worldScale = hasTeleported ? 0.3 : 1.2; 
  const mapCenterX = playerPos.x;
  const mapCenterZ = playerPos.z;
  
  const toMapCoords = (worldX: number, worldZ: number) => {
    const relX = (worldX - mapCenterX) * worldScale;
    const relZ = (worldZ - mapCenterZ) * worldScale;
    return {
      x: (size / 2) + relX,
      y: (size / 2) + relZ // Z translates to Y in 2D map
    };
  };

  const pMap = toMapCoords(playerPos.x, playerPos.z);
  
  // Static POIs
  const benchMap = toMapCoords(40.6, 50.0);
  const islandMap = toMapCoords(0, 0);

  return (
    <div 
      onClick={() => setIsMapExpanded(!isMapExpanded)}
      style={{
        position: 'absolute',
        top: '30px',
        right: '30px',
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(148, 163, 184, 0.4)',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        zIndex: 100
      }}
    >
      <svg width="100%" height="100%">
        {/* Satellite Map Background */}
        <defs>
          <linearGradient id="islandTerrain" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />   {/* Green grass */}
            <stop offset="70%" stopColor="#166534" />  {/* Dark forest */}
            <stop offset="100%" stopColor="#854d0e" /> {/* Brown dirt/rocks */}
          </linearGradient>
        </defs>

        {/* Ocean Base (Flat 2D) */}
        <rect width="100%" height="100%" fill="#0ea5e9" />

        {/* No isometric, pure top-down BR style */}
        <g>
          {!hasTeleported && (
            <>
              {/* The Bench / Table area - SVG Park Bench */}
              <g transform={`translate(${benchMap.x}, ${benchMap.y}) scale(0.6)`}>
                {/* Backrest wooden slats */}
                <rect x="-20" y="-15" width="40" height="4" fill="#a44c4c" rx="1" />
                <rect x="-20" y="-9" width="40" height="4" fill="#a44c4c" rx="1" />
                <rect x="-20" y="-3" width="40" height="4" fill="#a44c4c" rx="1" />
                
                {/* Seat wooden slats */}
                <rect x="-22" y="5" width="44" height="4" fill="#8f3d3d" rx="1" />
                <rect x="-22" y="11" width="44" height="4" fill="#8f3d3d" rx="1" />
                
                {/* Iron frame/legs */}
                <path d="M -15 -15 Q -20 0 -22 15 L -18 15 Q -16 0 -13 -15 Z" fill="#111a24" />
                <path d="M 15 -15 Q 20 0 22 15 L 18 15 Q 16 0 13 -15 Z" fill="#111a24" />
                
                {/* Iron armrests */}
                <path d="M -22 10 Q -25 0 -20 -3 L -19 0 Q -22 5 -20 10 Z" fill="#111a24" />
                <path d="M 22 10 Q 25 0 20 -3 L 19 0 Q 22 5 20 10 Z" fill="#111a24" />
              </g>
              <text x={benchMap.x + 18} y={benchMap.y + 4} fill="#ffffff" fontSize="10" fontFamily="sans-serif" fontWeight="bold" filter="drop-shadow(1px 1px 1px rgba(0,0,0,0.8))">BENCH</text>
            </>
          )}

          {hasTeleported && (
            <>
              {/* Main Island */}
              <path 
                d={`M ${islandMap.x - 40} ${islandMap.y - 15} 
                    C ${islandMap.x - 50} ${islandMap.y - 40}, ${islandMap.x - 10} ${islandMap.y - 60}, ${islandMap.x + 20} ${islandMap.y - 45} 
                    C ${islandMap.x + 50} ${islandMap.y - 30}, ${islandMap.x + 60} ${islandMap.y + 15}, ${islandMap.x + 30} ${islandMap.y + 40} 
                    C ${islandMap.x + 5} ${islandMap.y + 60}, ${islandMap.x - 30} ${islandMap.y + 45}, ${islandMap.x - 40} ${islandMap.y - 15} Z`} 
                fill="url(#islandTerrain)" 
                stroke="#166534"
                strokeWidth="1.5"
              />

              {/* Projects Island (Right side) */}
              <path 
                d={`M ${islandMap.x + 70} ${islandMap.y - 25} 
                    C ${islandMap.x + 60} ${islandMap.y - 40}, ${islandMap.x + 90} ${islandMap.y - 50}, ${islandMap.x + 105} ${islandMap.y - 20} 
                    C ${islandMap.x + 115} ${islandMap.y + 10}, ${islandMap.x + 90} ${islandMap.y + 30}, ${islandMap.x + 75} ${islandMap.y + 10} Z`}
                fill="url(#islandTerrain)"
                stroke="#166534"
                strokeWidth="1.5"
              />

              {/* Media Island (Top Right side) */}
              <path 
                d={`M ${islandMap.x + 20} ${islandMap.y - 75} 
                    C ${islandMap.x + 10} ${islandMap.y - 95}, ${islandMap.x + 40} ${islandMap.y - 110}, ${islandMap.x + 60} ${islandMap.y - 85} 
                    C ${islandMap.x + 75} ${islandMap.y - 60}, ${islandMap.x + 45} ${islandMap.y - 45}, ${islandMap.x + 30} ${islandMap.y - 60} Z`}
                fill="url(#islandTerrain)"
                stroke="#166534"
                strokeWidth="1.5"
              />

              {/* Bridges (Solid wood) */}
              {/* Main to Projects */}
              <path d={`M ${islandMap.x + 40} ${islandMap.y + 5} L ${islandMap.x + 75} ${islandMap.y - 5}`} stroke="#854d0e" strokeWidth="6" strokeLinecap="round" />
              {/* Main to Media */}
              <path d={`M ${islandMap.x + 20} ${islandMap.y - 40} L ${islandMap.x + 35} ${islandMap.y - 70}`} stroke="#854d0e" strokeWidth="6" strokeLinecap="round" />

              {/* Board on Projects Island */}
              <rect x={islandMap.x + 80} y={islandMap.y - 20} width="16" height="8" fill="#1e293b" stroke="#78350f" strokeWidth="2" rx="1" transform={`rotate(-15 ${islandMap.x + 88} ${islandMap.y - 16})`} />
              
              {/* Gem on Media Island */}
              <polygon points={`${islandMap.x + 45},${islandMap.y - 85} ${islandMap.x + 50},${islandMap.y - 80} ${islandMap.x + 45},${islandMap.y - 75} ${islandMap.x + 40},${islandMap.y - 80}`} fill="#c084fc" stroke="#a855f7" strokeWidth="1" />

              {/* Skills Shelf on Main Island */}
              <rect x={islandMap.x - 10} y={islandMap.y - 25} width="20" height="8" fill="#475569" stroke="#334155" strokeWidth="1.5" rx="1" />
              <rect x={islandMap.x - 9} y={islandMap.y - 24} width="18" height="6" fill="#94a3b8" />
              
              {/* Teleport Pad */}
              <circle cx={islandMap.x + 5} cy={islandMap.y + 15} r="6" fill="#06b6d4" stroke="#cffafe" strokeWidth="1" />
              
              <text x={islandMap.x - 20} y={islandMap.y - 45} fill="#ffffff" fontSize="11" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle" filter="drop-shadow(1px 1px 1px rgba(0,0,0,0.8))">ISLANDS</text>
            </>
          )}

          {/* Compass Letters */}
          <text x="50%" y="12" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">N</text>
          <text x="50%" y="100%" dy="-6" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">S</text>
          <text x="100%" dx="-10" y="50%" dy="4" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">E</text>
          <text x="6" y="50%" dy="4" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">W</text>

          {/* The Player Indicator */}
          <g transform={`translate(${pMap.x}, ${pMap.y}) rotate(${(playerPos.rot * 180) / Math.PI})`}>
            {/* Player Triangle (typical BR style indicator) pointing up (North) which aligns with -Z */}
            <path d="M 0 -8 L 6 6 L 0 3 L -6 6 Z" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
            
            <circle cx="0" cy="0" r="12" fill="none" stroke="rgba(239,68,68,0.8)" strokeWidth="1">
              <animate attributeName="r" from="4" to="24" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="1" to="0" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </g>
        </g>
      </svg>
      
      {/* Label */}
      <div style={{
        position: 'absolute',
        bottom: '8px',
        left: '0',
        width: '100%',
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: '10px',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        fontFamily: 'sans-serif'
      }}>
        {hasTeleported ? 'Island Map' : 'Ocean Map'}
      </div>
    </div>
  );
}
