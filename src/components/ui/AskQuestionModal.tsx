import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { KNOWLEDGE_BASE } from '../../data/achievements';

const buildPrompt = (question: string) => 
  `${KNOWLEDGE_BASE}\n\nVisitor's Question: "${question}"\n\nAnswer concisely in 2-3 sentences, speaking exactly as Manohar Tej.`;

async function askGroq(question: string, apiKey: string): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: buildPrompt(question) }]
    })
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq Error ${res.status}: ${errText}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

async function askOpenAI(question: string, apiKey: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: buildPrompt(question) }]
    })
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI Error ${res.status}: ${errText}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

async function askOpenRouter(question: string, apiKey: string): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://manohartej.com', 
      'X-Title': 'Manohar Tej Portfolio'
    },
    body: JSON.stringify({
      // We use the auto-routing FREE model provided by OpenRouter!
      model: 'openrouter/free',
      messages: [{ role: 'user', content: buildPrompt(question) }]
    })
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter Error ${res.status}: ${errText}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

async function askAnthropic(question: string, apiKey: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 150,
      messages: [{ role: 'user', content: buildPrompt(question) }]
    })
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic Error ${res.status}: ${errText}`);
  }
  const data = await res.json();
  return data.content[0].text;
}

async function askGemini(question: string, apiKey: string): Promise<string> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(question) }] }]
    })
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini Error ${res.status}: ${errText}`);
  }
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

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
  const groqKey = import.meta.env.VITE_GROQ_API_KEY || "";
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY || "";
  const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY || "";
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
  const openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY || "";

  const MAX_QUESTIONS = 5;

  if (!isAskQuestionModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    if (questionsAskedCount >= MAX_QUESTIONS) {
      alert("You have already asked 5 questions!");
      return;
    }

    if (!groqKey && !openaiKey && !anthropicKey && !geminiKey && !openRouterKey) {
      alert("The developer has not configured any AI API keys yet.");
      return;
    }

    setIsAsking(true);
    let answer = "";
    const apiErrors: string[] = [];

    try {
      // 0. Try OpenRouter FIRST (Unlimited Free tokens via :free models)
      if (openRouterKey && !answer) {
        try {
          setActiveEngine("OpenRouter");
          answer = await askOpenRouter(question, openRouterKey);
        } catch (e: any) {
          console.warn("OpenRouter failed, falling back...", e);
          apiErrors.push(e.message || "OpenRouter Error");
        }
      }

      // 1. Try Groq (Fastest)
      if (groqKey && !answer) {
        try {
          setActiveEngine("Groq");
          answer = await askGroq(question, groqKey);
        } catch (e: any) {
          console.warn("Groq failed, falling back...", e);
          apiErrors.push(e.message || "Groq Error");
        }
      }

      // 2. Try OpenAI
      if (openaiKey && !answer) {
        try {
          setActiveEngine("ChatGPT");
          answer = await askOpenAI(question, openaiKey);
        } catch (e: any) {
          console.warn("OpenAI failed, falling back...", e);
          apiErrors.push(e.message || "OpenAI Error");
        }
      }

      // 3. Try Anthropic
      if (anthropicKey && !answer) {
        try {
          setActiveEngine("Claude");
          answer = await askAnthropic(question, anthropicKey);
        } catch (e: any) {
          console.warn("Anthropic failed, falling back...", e);
          apiErrors.push(e.message || "Anthropic Error");
        }
      }

      // 4. Try Gemini
      if (geminiKey && !answer) {
        try {
          setActiveEngine("Gemini");
          answer = await askGemini(question, geminiKey);
        } catch (e: any) {
          console.warn("Gemini failed...", e);
          apiErrors.push(e.message || "Gemini Error");
        }
      }

      if (!answer) {
        throw new Error(`All provided APIs failed. Details: ${apiErrors.join(" | ")}`);
      }
      
      // Close modal, increment counter
      setIsAskQuestionModalOpen(false);
      incrementQuestionsAsked();
      setQuestion("");
      
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
      alert(error.message || "Failed to get answer.");
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
