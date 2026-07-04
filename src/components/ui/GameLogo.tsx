export function GameLogo() {
  return (
    <div style={{
      position: 'absolute',
      top: '30px',
      left: '30px',
      pointerEvents: 'none',
      zIndex: 100
    }}>
      <div style={{
        fontFamily: '"Caveat", cursive',
        fontSize: '32px',
        color: '#ffffff',
        textShadow: '0 4px 15px rgba(0,0,0,0.5), 0 0 15px rgba(56, 189, 248, 0.4)',
        letterSpacing: '1px',
        lineHeight: 1,
        userSelect: 'none'
      }}>
        World of Manohar
      </div>
    </div>
  );
}
