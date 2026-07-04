import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

export const PaperEditor = () => {
  const activePaperIndex = useAppStore((state) => state.activePaperIndex);
  const setActivePaper = useAppStore((state) => state.setActivePaper);
  const papers = useAppStore((state) => state.papers);
  const updatePaperText = useAppStore((state) => state.updatePaperText);
  const setIsWriting = useAppStore((state) => state.setIsWriting);
  const setHandingOverPaperIndex = useAppStore((state) => state.setHandingOverPaperIndex);

  const [text, setText] = useState("");

  // Sync state when active paper changes
  useEffect(() => {
    if (activePaperIndex !== null) {
      setText(papers[activePaperIndex]);
      setIsWriting(true); // Start writing animation
    } else {
      setIsWriting(false); // Stop writing animation if closed
    }
  }, [activePaperIndex, papers, setIsWriting]);

  if (activePaperIndex === null) return null;

  const handleSave = () => {
    updatePaperText(activePaperIndex, text);
    setIsWriting(false);
    
    // Only trigger hand-over if there is actually some text written
    if (text.trim().length > 0) {
      setHandingOverPaperIndex(activePaperIndex);
    }
    
    setActivePaper(null); // close editor
  };

  const handleCancel = () => {
    setIsWriting(false);
    setActivePaper(null);
  };

  // Prevent keyboard events from bubbling up to R3F KeyboardControls
  const stopPropagation = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#f8fafc',
        width: '100%',
        maxWidth: '600px',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: '#334155', fontFamily: '"Inter", sans-serif' }}>
            Write Question {activePaperIndex + 1}
          </h2>
          <button 
            onClick={() => setActivePaper(null)}
            style={{
              background: 'none', border: 'none', fontSize: '24px', color: '#94a3b8', cursor: 'pointer'
            }}
          >
            &times;
          </button>
        </div>
        
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={stopPropagation}
          onKeyUp={stopPropagation}
          onKeyPress={stopPropagation}
          autoFocus
          placeholder="Ask Manohar a question about his experience, projects, or goals..."
          style={{
            width: '100%',
            height: '200px',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            backgroundColor: 'white',
            color: '#1e293b',
            fontFamily: '"Inter", sans-serif',
            fontSize: '16px',
            resize: 'none',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={handleCancel}
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: 'white',
              color: '#475569',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: '"Inter", sans-serif',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#3b82f6',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: '"Inter", sans-serif',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
