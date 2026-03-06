import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

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
  content: `Hello! I'm **HEX**, your AI support assistant for HEH Healthcare Help Desk.

I can help you with:
- Submitting issues or feedback
- Understanding response times
- Navigating the platform
- Any questions about our services

How can I assist you today?`
};

const SUGGESTED_QUESTIONS = [
  "How do I submit an issue?",
  "What are the response times?",
  "What services does HEH offer?",
  "How do I track my ticket?"
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiInput, setShowApiInput] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [tempKey, setTempKey] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem('heh_groq_apikey');
    if (stored) setApiKey(stored);
    else setShowApiInput(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const saveApiKey = () => {
    if (!tempKey.trim()) return;
    localStorage.setItem('heh_groq_apikey', tempKey.trim());
    setApiKey(tempKey.trim());
    setShowApiInput(false);
    setTempKey('');
  };

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    if (!apiKey) { setShowApiInput(true); return; }

    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 1000,
          temperature: 0.7,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...newMessages.map(m => ({
              role: m.role === 'assistant' ? 'assistant' : 'user',
              content: m.content
            }))
          ]
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'API error');
      }

      const reply = data.choices?.[0]?.message?.content
        || 'Sorry, I could not get a response. Please try again.';

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);

    } catch (err) {
      console.error('Groq error:', err);
      let errorMsg = 'Something went wrong. Please try again.';
      if (err.message?.includes('401') || err.message?.includes('invalid_api_key')) {
        errorMsg = 'Invalid API key. Please re-enter your Groq API key.';
        setShowApiInput(true);
      } else if (err.message?.includes('429')) {
        errorMsg = 'Rate limit reached. Please wait a moment and try again.';
      } else if (err.message?.includes('decommissioned')) {
        errorMsg = 'Model unavailable. Please contact support.';
      }
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠ ${errorMsg}` }]);
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

  const renderMessage = (content) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^• /gm, '<span class="bullet">•</span> ')
      .replace(/^- /gm, '<span class="bullet">•</span> ')
      .replace(/\n/g, '<br/>');
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle AI Assistant"
      >
        {isOpen ? (
          <span className="toggle-icon">✕</span>
        ) : (
          <>
            <span className="toggle-icon">⚕</span>
            <span className="toggle-label">HEX AI</span>
            <span className="toggle-pulse"></span>
          </>
        )}
      </button>

      {/* Chat Window */}
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>

        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <div className="chatbot-avatar">
              <span>⚕</span>
              <span className="avatar-status"></span>
            </div>
            <div>
              <h3>HEX Assistant</h3>
              <span className="chatbot-status">
                {isTyping ? 'Typing...' : 'AI • Online'}
              </span>
            </div>
          </div>
          <div className="chatbot-header-actions">
            <button onClick={clearChat} className="header-btn" title="Clear chat">↺</button>
            <button onClick={() => setShowApiInput(true)} className="header-btn" title="API Key">🔑</button>
            <button onClick={() => setIsOpen(false)} className="header-btn close-btn">✕</button>
          </div>
        </div>

        {/* API Key Panel */}
        {showApiInput && (
          <div className="api-key-panel">
            <p>🔑 Enter your <strong>Groq API Key</strong> to activate HEX</p>
            <p className="api-note">
              Get one FREE at{' '}
              <a href="https://console.groq.com" target="_blank" rel="noreferrer">
                console.groq.com
              </a>
              {' '}— no credit card needed
            </p>
            <div className="api-key-input-row">
              <input
                type="password"
                placeholder="gsk_..."
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') saveApiKey(); }}
                className="api-key-input"
                autoFocus
              />
              <button onClick={saveApiKey} className="api-key-save">
                Save
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="chatbot-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`}>
              {msg.role === 'assistant' && (
                <div className="message-avatar">⚕</div>
              )}
              <div
                className="message-bubble"
                dangerouslySetInnerHTML={{ __html: renderMessage(msg.content) }}
              />
            </div>
          ))}

          {isTyping && (
            <div className="message assistant">
              <div className="message-avatar">⚕</div>
              <div className="message-bubble typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="suggested-questions">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button key={i} className="suggestion-btn" onClick={() => sendMessage(q)}>
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="chatbot-input-area">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask HEX anything..."
            className="chatbot-input"
            disabled={loading || showApiInput}
            maxLength={500}
          />
          <button
            className="chatbot-send"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim() || showApiInput}
          >
            {loading ? <span className="send-spinner"></span> : '➤'}
          </button>
        </div>

      </div>
    </>
  );
};

export default Chatbot;