import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { KNOWLEDGE_BASE } from '../../data/achievements';




export function AskQuestionModal() {
  const isAskQuestionModalOpen = useAppStore(state => state.isAskQuestionModalOpen);
  const setIsAskQuestionModalOpen = useAppStore(state => state.setIsAskQuestionModalOpen);
  const questionsAskedCount = useAppStore(state => state.questionsAskedCount);
  const incrementQuestionsAsked = useAppStore(state => state.incrementQuestionsAsked);
  const setCurrentSubtitle = useAppStore(state => state.setCurrentSubtitle);

  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [activeEngine, setActiveEngine] = useState<string | null>(null);

  // Multi-LLM Keys from Environment Variables
  const MAX_QUESTIONS = 5;

  if (!isAskQuestionModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    if (questionsAskedCount >= MAX_QUESTIONS) {
      alert("You have already asked 5 questions!");
      return;
    }
    
    setIsAsking(true);

    // Close modal, increment counter, show thinking state
    setIsAskQuestionModalOpen(false);
    incrementQuestionsAsked();
    const currentQ = question;
    setQuestion("");
    setCurrentSubtitle("Thinking...");

    let answer = "";
    
    try {
      setActiveEngine("Manohar AI");
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          question: currentQ,
          context: KNOWLEDGE_BASE
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Backend request failed");
      }

      const data = await response.json();
      answer = data.answer;
      
      if (!answer) {
        throw new Error("Failed to get answer from backend.");
      }
      
      // Generate Voice using standard Web Speech API (Browser Built-in)
      try {
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(answer);
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          // Try to find a good English voice
          const voices = window.speechSynthesis.getVoices();
          const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Microsoft Mark') || v.lang === 'en-US');
          if (preferredVoice) utterance.voice = preferredVoice;
          
          utterance.onstart = () => {
            setCurrentSubtitle(answer); // Sync subtitle with audio start
            useAppStore.getState().setIsSpeaking(true);
          };
          utterance.onend = () => {
            useAppStore.getState().setIsSpeaking(false);
            setTimeout(() => useAppStore.getState().setCurrentSubtitle(""), 1000);
          };
          utterance.onerror = () => {
            useAppStore.getState().setIsSpeaking(false);
            setTimeout(() => useAppStore.getState().setCurrentSubtitle(""), 1000);
          };

          window.speechSynthesis.speak(utterance);
        } else {
          // Fallback if TTS not supported
          setCurrentSubtitle(answer);
          setTimeout(() => setCurrentSubtitle(""), 8000);
        }
      } catch (ttsError) {
        console.error("Failed to generate TTS:", ttsError);
        setCurrentSubtitle(answer);
        setTimeout(() => setCurrentSubtitle(""), 8000);
      }

    } catch (error: any) {
      console.error(error);
      setCurrentSubtitle("I'm sorry, I couldn't process that request.");
      setTimeout(() => setCurrentSubtitle(""), 4000);
    } finally {
      setIsAsking(false);
      setActiveEngine(null);
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        padding: '32px',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.1)',
        width: '500px',
        maxWidth: '90%',
        color: 'white',
        fontFamily: '"Inter", sans-serif',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ margin: '0 0 16px 0', color: '#60A5FA' }}>Ask Manohar a Question</h2>
        <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#94A3B8' }}>
          Questions remaining: {MAX_QUESTIONS - questionsAskedCount}
        </p>

        {questionsAskedCount >= MAX_QUESTIONS ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#F87171' }}>
            You have reached the limit of 5 questions.
            <br/><br/>
            <button
              onClick={() => setIsAskQuestionModalOpen(false)}
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: '#CBD5E1' }}>Your Question</label>
              <textarea 
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="What projects are you most proud of?"
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  color: 'white',
                  resize: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', alignItems: 'center' }}>
              {isAsking && activeEngine && (
                <span style={{ fontSize: '12px', color: '#94A3B8', marginRight: 'auto' }}>
                  Thinking...
                </span>
              )}
              <button
                type="button"
                onClick={() => setIsAskQuestionModalOpen(false)}
                style={{
                  backgroundColor: 'transparent',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAsking || !question.trim()}
                style={{
                  backgroundColor: (isAsking || !question.trim()) ? '#475569' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: (isAsking || !question.trim()) ? 'not-allowed' : 'pointer'
                }}
              >
                {isAsking ? 'Thinking...' : 'Ask'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
