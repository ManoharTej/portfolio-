import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

export const ContactFormUI = () => {
  const isContactFormOpen = useAppStore(state => state.isContactFormOpen);
  const setIsContactFormOpen = useAppStore(state => state.setIsContactFormOpen);
  const setIsEndingSequence = useAppStore(state => state.setIsEndingSequence);

  const [formData, setFormData] = useState({ name: '', email: '', feedback: '' });

  if (!isContactFormOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Feedback sent:", formData);
    setIsContactFormOpen(false);
    setIsEndingSequence(true);
  };

  return (
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999999,
      pointerEvents: 'auto'
    }}>
      <style>
        {`
          @keyframes zoomInCard {
            from {
              transform: scale(0.9) translateY(20px);
              opacity: 0;
            }
            to {
              transform: scale(1) translateY(0);
              opacity: 1;
            }
          }
          .glass-input::placeholder {
            color: rgba(255,255,255,0.4);
          }
        `}
      </style>
      
      {/* Premium Glassmorphic Card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.85) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '24px',
        padding: '40px',
        width: '520px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255,255,255,0.1)',
        color: '#f8fafc',
        fontFamily: '"Montserrat", sans-serif',
        position: 'relative',
        animation: 'zoomInCard 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}>
        {/* Glow effect behind the card */}
        <div style={{
          position: 'absolute',
          top: '-1px', left: '-1px', right: '-1px', bottom: '-1px',
          background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.3), rgba(167, 139, 250, 0.3))',
          borderRadius: '24px',
          zIndex: -1,
          filter: 'blur(20px)',
          opacity: 0.6
        }}></div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <h2 style={{ 
              margin: 0, 
              fontSize: '32px', 
              fontWeight: 900, 
              letterSpacing: '1px',
              background: 'linear-gradient(to right, #60a5fa, #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>MANOHAR TEJ</h2>
            <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#94a3b8', fontWeight: 700, letterSpacing: '2px' }}>SOFTWARE ENGINEER</p>
          </div>
          <button 
            onClick={() => setIsContactFormOpen(false)}
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '50%',
              color: '#94a3b8', 
              fontSize: '24px', 
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'flex', gap: '24px', marginBottom: '36px', padding: '24px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>
            <p style={{ margin: 0, fontSize: '15px', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500 }}>
              <span style={{ fontSize: '20px' }}>📧</span> manohartejkandula@gmail.com
            </p>
            <p style={{ margin: 0, fontSize: '15px', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500 }}>
              <span style={{ fontSize: '20px' }}>📸</span> ma.nohar____
            </p>
          </div>
          
          <div style={{ 
            width: '100px', 
            padding: '10px', 
            background: 'rgba(255,255,255,0.03)', 
            borderRadius: '12px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(5px)'
          }}>
            {/* WhatsApp QR Code Placeholder - Ready for image replacement */}
            <div style={{ 
              width: '75px', 
              height: '75px', 
              background: 'rgba(0,0,0,0.4)', 
              borderRadius: '8px',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              border: '1px dashed rgba(255,255,255,0.3)',
              marginBottom: '8px'
            }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', textAlign: 'center', fontWeight: 600 }}>YOUR QR<br/>HERE</span>
            </div>
            <p style={{ margin: 0, fontSize: '10px', color: '#4ade80', fontWeight: 700, letterSpacing: '0.5px' }}>WHATSAPP</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#94a3b8', fontWeight: 700, letterSpacing: '1.5px' }}>LEAVE A MESSAGE</p>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <input 
              type="text" 
              className="glass-input"
              placeholder="Your Name" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={{
                flex: 1,
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: '#fff',
                fontSize: '15px',
                fontFamily: '"Montserrat", sans-serif',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={e => e.target.style.borderColor = '#60a5fa'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <input 
              type="email" 
              className="glass-input"
              placeholder="Your Email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={{
                flex: 1,
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: '#fff',
                fontSize: '15px',
                fontFamily: '"Montserrat", sans-serif',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={e => e.target.style.borderColor = '#60a5fa'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>
          <textarea 
            className="glass-input"
            placeholder="Share your thoughts about this portfolio..." 
            rows={3}
            required
            value={formData.feedback}
            onChange={(e) => setFormData({...formData, feedback: e.target.value})}
            style={{
              padding: '14px 18px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: '#fff',
              fontSize: '15px',
              fontFamily: '"Montserrat", sans-serif',
              outline: 'none',
              resize: 'none',
              transition: 'all 0.3s ease'
            }}
            onFocus={e => e.target.style.borderColor = '#60a5fa'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
          
          <button 
            type="submit"
            style={{
              marginTop: '16px',
              padding: '18px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
              color: 'white',
              fontSize: '16px',
              fontWeight: 800,
              letterSpacing: '2px',
              fontFamily: '"Montserrat", sans-serif',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.4)';
            }}
          >
            FINISH JOURNEY
          </button>
        </form>
      </div>
    </div>
  );
};
