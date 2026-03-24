import React, { useState, useRef, useEffect } from 'react';

const SYSTEM_PROMPT = `You are HEX — the AI support assistant for HEH (Hostile Environment Healthcare) Help Desk platform. You are sharp, professional, and efficient. You help users with:

1. Navigating the helpdesk (how to submit issues, give feedback)
2. Explaining what HEH Healthcare does — providing medical support in hostile/conflict/disaster environments
3. Ticket and response time information:
   - Critical priority: 1-2 hours
   - High priority: 4-8 hours
   - Medium priority: 24 hours
   - Low priority: 48-72 hours
4. Issue categories: Technical, Medical Supply, Equipment, Logistics, Safety, Other
5. Feedback service types: Field Medical Support, Emergency Response, Equipment & Supplies, Training & Briefing, Operational Coordination, Other
6. General FAQ about the platform

Keep responses concise, helpful, and professional. Use bullet points when listing things. If someone has an urgent medical emergency, always tell them to contact emergency services immediately. If you cannot answer something, guide them to submit a ticket via the Issues page. Never make up specific contact numbers or addresses. Always stay in character as HEX.`;

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: `Hello! I'm **HEX**, your AI support assistant for HEH Healthcare Help Desk.\n\nI can help you with:\n- Submitting issues or feedback\n- Understanding response times\n- Navigating the platform\n- Any questions about our services\n\nHow can I assist you today?`
};

const SUGGESTED_QUESTIONS = [
  "How do I submit an issue?",
  "What are the response times?",
  "What services does HEH offer?",
  "How do I track my ticket?"
];

// ✅ Points to your backend proxy on port 5000
const PROXY_URL = 'http://localhost:5000/api/chat';

const renderMessage = (content) => {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- /gm, '• ')
    .replace(/\n/g, '<br/>');
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
      }, 100);
    }
  }, [messages, isOpen]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages.map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const reply = data.content?.[0]?.text || 'Sorry, I could not get a response. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('API error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠ ${err.message || 'Something went wrong. Please try again.'}`
      }]);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => setMessages([WELCOME_MESSAGE]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Exo+2:wght@300;400;600;700&display=swap');
        :root {
          --hex-bg: #0a0f1a; --hex-border: #1e3a5f;
          --hex-accent: #00d4ff; --hex-accent2: #00ff9d;
          --hex-danger: #ff4757; --hex-text: #c8dff0;
          --hex-muted: #5a7a99; --hex-bot-bg: #091520;
          --hex-glow: 0 0 12px rgba(0,212,255,0.3);
        }
        .hex-toggle {
          position: fixed; bottom: 28px; right: 28px; z-index: 9999;
          display: flex; align-items: center; gap: 10px;
          background: linear-gradient(135deg, #0a1628, #0f2040);
          border: 1px solid var(--hex-accent); color: var(--hex-accent);
          padding: 13px 20px; border-radius: 50px; cursor: pointer;
          font-family: 'Share Tech Mono', monospace; font-size: 13px;
          letter-spacing: 1.5px;
          box-shadow: var(--hex-glow), inset 0 1px 0 rgba(0,212,255,0.1);
          transition: all 0.2s ease;
        }
        .hex-toggle:hover { box-shadow: 0 0 20px rgba(0,212,255,0.5); transform: translateY(-2px); }
        .hex-toggle.open { padding: 13px 18px; border-color: var(--hex-danger); color: var(--hex-danger); box-shadow: 0 0 12px rgba(255,71,87,0.3); }
        .hex-pulse { width: 8px; height: 8px; background: var(--hex-accent2); border-radius: 50%; animation: hexPulse 1.8s ease-in-out infinite; }
        @keyframes hexPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }
        .hex-window {
          position: fixed; bottom: 95px; right: 28px;
          width: 390px; height: 580px; z-index: 9998;
          background: var(--hex-bg); border: 1px solid var(--hex-border);
          border-radius: 16px; display: flex; flex-direction: column; overflow: hidden;
          box-shadow: 0 24px 60px rgba(0,0,0,0.7), var(--hex-glow);
          transform: translateY(20px) scale(0.97); opacity: 0; pointer-events: none;
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
          font-family: 'Exo 2', sans-serif;
        }
        .hex-window.open { transform: translateY(0) scale(1); opacity: 1; pointer-events: all; }
        .hex-window::before {
          content:''; position:absolute; inset:0; pointer-events:none; z-index:1; border-radius:16px;
          background: repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,212,255,0.012) 2px,rgba(0,212,255,0.012) 4px);
        }
        .hex-header {
          background: linear-gradient(135deg,#0a1628,#0d1f3a); border-bottom: 1px solid var(--hex-border);
          padding: 14px 16px; display: flex; align-items: center; justify-content: space-between;
          position: relative; z-index: 2;
        }
        .hex-header::after { content:''; position:absolute; bottom:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,var(--hex-accent),transparent); }
        .hex-header-left { display:flex; align-items:center; gap:12px; }
        .hex-avatar { width:38px; height:38px; background:linear-gradient(135deg,#0a2040,#0f3060); border:1.5px solid var(--hex-accent); border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:18px; position:relative; box-shadow:0 0 10px rgba(0,212,255,0.2); }
        .hex-avatar-dot { position:absolute; bottom:-2px; right:-2px; width:9px; height:9px; background:var(--hex-accent2); border-radius:50%; border:1.5px solid var(--hex-bg); }
        .hex-title { color:#fff; font-weight:700; font-size:14px; letter-spacing:0.5px; }
        .hex-subtitle { color:var(--hex-muted); font-size:11px; font-family:'Share Tech Mono',monospace; letter-spacing:0.5px; }
        .hex-subtitle.typing { color:var(--hex-accent2); }
        .hex-header-actions { display:flex; gap:4px; }
        .hex-hbtn { background:transparent; border:1px solid transparent; color:var(--hex-muted); width:30px; height:30px; border-radius:7px; cursor:pointer; font-size:13px; display:flex; align-items:center; justify-content:center; transition:all 0.15s; }
        .hex-hbtn:hover { background:rgba(0,212,255,0.08); border-color:var(--hex-border); color:var(--hex-accent); }
        .hex-hbtn.close:hover { background:rgba(255,71,87,0.1); border-color:rgba(255,71,87,0.3); color:var(--hex-danger); }
        .hex-messages { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:12px; position:relative; z-index:2; }
        .hex-messages::-webkit-scrollbar { width:4px; }
        .hex-messages::-webkit-scrollbar-thumb { background:var(--hex-border); border-radius:4px; }
        .hex-msg { display:flex; gap:8px; animation:msgIn 0.2s ease; }
        @keyframes msgIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .hex-msg.user { flex-direction:row-reverse; }
        .hex-msg-avatar { width:28px; height:28px; background:linear-gradient(135deg,#0a2040,#0f3060); border:1px solid var(--hex-accent); border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:13px; flex-shrink:0; margin-top:2px; }
        .hex-bubble { max-width:78%; padding:10px 14px; border-radius:12px; font-size:13.5px; line-height:1.55; color:var(--hex-text); }
        .hex-msg.assistant .hex-bubble { background:var(--hex-bot-bg); border:1px solid var(--hex-border); border-top-left-radius:4px; }
        .hex-msg.user .hex-bubble { background:linear-gradient(135deg,#0d2440,#0f2a50); border:1px solid rgba(0,212,255,0.2); border-top-right-radius:4px; color:#d0eaf8; }
        .hex-typing { display:flex; gap:5px; padding:12px 16px; align-items:center; }
        .hex-typing span { width:7px; height:7px; background:var(--hex-accent); border-radius:50%; animation:typingDot 1.2s ease-in-out infinite; opacity:0.4; }
        .hex-typing span:nth-child(2){animation-delay:0.2s} .hex-typing span:nth-child(3){animation-delay:0.4s}
        @keyframes typingDot { 0%,80%,100%{transform:translateY(0);opacity:0.4} 40%{transform:translateY(-5px);opacity:1} }
        .hex-suggestions { padding:4px 16px 12px; display:flex; flex-wrap:wrap; gap:7px; position:relative; z-index:2; }
        .hex-suggestion { background:rgba(0,212,255,0.06); border:1px solid rgba(0,212,255,0.2); color:var(--hex-accent); padding:6px 11px; border-radius:20px; font-size:11.5px; cursor:pointer; font-family:'Exo 2',sans-serif; font-weight:500; transition:all 0.15s; }
        .hex-suggestion:hover { background:rgba(0,212,255,0.15); border-color:var(--hex-accent); box-shadow:0 0 8px rgba(0,212,255,0.2); }
        .hex-input-area { padding:12px 14px; border-top:1px solid var(--hex-border); background:linear-gradient(0deg,#090e18,#0a1220); display:flex; gap:8px; align-items:center; position:relative; z-index:2; }
        .hex-input-area::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(0,212,255,0.4),transparent); }
        .hex-input { flex:1; background:rgba(255,255,255,0.04); border:1px solid var(--hex-border); border-radius:10px; color:var(--hex-text); padding:10px 14px; font-size:13.5px; font-family:'Exo 2',sans-serif; outline:none; transition:border-color 0.2s; }
        .hex-input::placeholder{color:var(--hex-muted)}
        .hex-input:focus{border-color:rgba(0,212,255,0.4);box-shadow:0 0 0 3px rgba(0,212,255,0.06)}
        .hex-input:disabled{opacity:0.5}
        .hex-send { width:40px; height:40px; background:linear-gradient(135deg,#005f8f,#007ab8); border:1px solid var(--hex-accent); border-radius:10px; color:#fff; cursor:pointer; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all 0.15s; flex-shrink:0; }
        .hex-send:hover:not(:disabled){background:linear-gradient(135deg,#007ab8,#0090d0);box-shadow:0 0 14px rgba(0,212,255,0.4);transform:translateY(-1px)}
        .hex-send:disabled{opacity:0.4;cursor:not-allowed}
        .hex-spinner { width:14px; height:14px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; }
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <button className={`hex-toggle ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <>✕ CLOSE</> : <><span>⚕</span><span>HEX AI</span><span className="hex-pulse"/></>}
      </button>

      <div className={`hex-window ${isOpen ? 'open' : ''}`}>
        <div className="hex-header">
          <div className="hex-header-left">
            <div className="hex-avatar">⚕<span className="hex-avatar-dot"/></div>
            <div>
              <div className="hex-title">HEX Assistant</div>
              <div className={`hex-subtitle ${isTyping ? 'typing' : ''}`}>{isTyping ? 'Typing...' : 'AI · ONLINE'}</div>
            </div>
          </div>
          <div className="hex-header-actions">
            <button onClick={clearChat} className="hex-hbtn" title="Clear">↺</button>
            <button onClick={() => setIsOpen(false)} className="hex-hbtn close">✕</button>
          </div>
        </div>

        <div className="hex-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`hex-msg ${msg.role}`}>
              {msg.role === 'assistant' && <div className="hex-msg-avatar">⚕</div>}
              <div className="hex-bubble" dangerouslySetInnerHTML={{ __html: renderMessage(msg.content) }}/>
            </div>
          ))}
          {isTyping && (
            <div className="hex-msg assistant">
              <div className="hex-msg-avatar">⚕</div>
              <div className="hex-bubble hex-typing"><span/><span/><span/></div>
            </div>
          )}
          <div ref={messagesEndRef}/>
        </div>

        {messages.length === 1 && (
          <div className="hex-suggestions">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button key={i} className="hex-suggestion" onClick={() => sendMessage(q)}>{q}</button>
            ))}
          </div>
        )}

        <div className="hex-input-area">
          <input
            ref={inputRef} type="text" value={input}
            onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Ask HEX anything..." className="hex-input"
            disabled={loading} maxLength={500}
          />
          <button className="hex-send" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
            {loading ? <span className="hex-spinner"/> : '➤'}
          </button>
        </div>
      </div>
    </>
  );
}