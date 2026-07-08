import { useState, useEffect } from 'react';

export function MobileWarning() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Check if window width is small or if user agent suggests mobile
      const isMobileWidth = window.innerWidth <= 768;
      const isMobileAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileWidth || isMobileAgent);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px',
      zIndex: 999999,
      fontFamily: '"Montserrat", sans-serif',
      color: 'white',
      textAlign: 'center'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '50px 40px',
        borderRadius: '24px',
        maxWidth: '400px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🖥️</div>
        <h1 style={{
          fontSize: '1.8rem',
          fontWeight: 800,
          marginBottom: '16px',
          background: 'linear-gradient(to right, #38bdf8, #818cf8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Desktop Experience Required
        </h1>
        <p style={{
          fontSize: '1rem',
          lineHeight: '1.6',
          color: 'rgba(255, 255, 255, 0.7)',
          marginBottom: '30px'
        }}>
          This is a high-quality 3D portfolio designed specifically for desktop devices. Please open this link on your PC or Laptop to dive into the world!
        </p>
        <div style={{
          fontSize: '0.85rem',
          color: 'rgba(56, 189, 248, 0.8)',
          fontWeight: 600,
          letterSpacing: '1px'
        }}>
          SEE YOU ON THE BIG SCREEN
        </div>
      </div>
    </div>
  );
}
