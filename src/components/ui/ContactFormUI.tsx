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
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999999,
      pointerEvents: 'auto'
    }}>
      {/* Physical Visiting Card Style Container */}
      <div style={{
        backgroundColor: '#f8fafc',
        backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")', // subtle paper texture
        border: '1px solid #e2e8f0',
        borderRadius: '8px', // sharper corners like a real card
        padding: '40px',
        width: '600px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        color: '#0f172a', // dark text
        fontFamily: '"Inter", sans-serif',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '28px', color: '#0f172a', fontWeight: 800, letterSpacing: '-0.5px' }}>MANOHAR TEJ</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b', fontWeight: 600, letterSpacing: '1px' }}>SOFTWARE ENGINEER</p>
          </div>
          <button 
            onClick={() => setIsContactFormOpen(false)}
            style={{ 
              background: 'none', border: 'none', color: '#94a3b8', fontSize: '28px', cursor: 'pointer' 
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'flex', gap: '32px', marginBottom: '32px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
            <p style={{ margin: 0, fontSize: '15px', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>📧</span> <strong>manohartej@example.com</strong>
            </p>
            <p style={{ margin: 0, fontSize: '15px', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>📸</span> <strong>@manohartej.insta</strong>
            </p>
          </div>
          
          <div style={{ width: '100px', padding: '8px', backgroundColor: 'white', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            {/* Placeholder for WhatsApp QR Code */}
            <div style={{ width: '80px', height: '80px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #94a3b8' }}>
              <span style={{ color: '#64748b', fontSize: '10px', textAlign: 'center', fontWeight: 600 }}>QR<br/>Code</span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#16a34a', fontWeight: 700 }}>WhatsApp</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>LEAVE A MESSAGE</p>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <input 
              type="text" 
              placeholder="Your Name" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                backgroundColor: 'white',
                color: '#0f172a',
                fontSize: '15px',
                fontFamily: '"Inter", sans-serif',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
              }}
            />
            <input 
              type="email" 
              placeholder="Your Email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                backgroundColor: 'white',
                color: '#0f172a',
                fontSize: '15px',
                fontFamily: '"Inter", sans-serif',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
              }}
            />
          </div>
          <textarea 
            placeholder="Share your feedback about this portfolio..." 
            rows={3}
            required
            value={formData.feedback}
            onChange={(e) => setFormData({...formData, feedback: e.target.value})}
            style={{
              padding: '12px 16px',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              backgroundColor: 'white',
              color: '#0f172a',
              fontSize: '15px',
              fontFamily: '"Inter", sans-serif',
              resize: 'none',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
            }}
          />
          
          <button 
            type="submit"
            style={{
              marginTop: '12px',
              padding: '16px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: '#0f172a',
              color: 'white',
              fontSize: '15px',
              fontWeight: 700,
              letterSpacing: '1px',
              fontFamily: '"Inter", sans-serif',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#334155';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#0f172a';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            FINISH JOURNEY
          </button>
        </form>
      </div>
    </div>
  );
};
