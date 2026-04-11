import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader, Shield, Minimize2 } from 'lucide-react';
import axios from 'axios';

const chatApi = axios.create({ baseURL: 'http://localhost:8080/api', timeout: 15000 });

const SUGGESTIONS = [
  'How do I stop a DDoS attack?',
  'How to remove ransomware?',
  'What is a zero-day exploit?',
  'How to identify phishing emails?',
  'What ports are dangerous to leave open?',
];

function Message({ msg }) {
  const isBot = msg.role === 'bot';
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', justifyContent: isBot ? 'flex-start' : 'flex-end' }}>
      {isBot && (
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(88,166,255,0.15)', border: '1px solid rgba(88,166,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
          <Bot size={14} style={{ color: '#58a6ff' }} />
        </div>
      )}
      <div style={{
        maxWidth: '78%',
        padding: '10px 14px',
        borderRadius: isBot ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
        background: isBot ? '#1c2333' : 'linear-gradient(135deg, #1f6feb, #388bfd)',
        border: isBot ? '1px solid #30363d' : 'none',
        fontSize: 13,
        lineHeight: 1.65,
        color: '#e6edf3',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {msg.text}
        <p style={{ fontSize: 10, color: isBot ? '#484f58' : 'rgba(255,255,255,0.5)', margin: '6px 0 0', textAlign: 'right' }}>
          {msg.time}
        </p>
      </div>
      {!isBot && (
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(63,185,80,0.15)', border: '1px solid rgba(63,185,80,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
          <User size={14} style={{ color: '#3fb950' }} />
        </div>
      )}
    </div>
  );
}

export default function Chatbot() {
  const [open, setOpen]       = useState(false);
  const [input, setInput]     = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "Hi! I'm Aucxion's security assistant. Ask me anything about cybersecurity — how to fix attacks, prevent threats, secure your system, or understand vulnerabilities.",
      time: now(),
    }
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');

    setMessages(prev => [...prev, { role: 'user', text: msg, time: now() }]);
    setLoading(true);

    try {
      const res = await chatApi.post('/chat', { message: msg });
      setMessages(prev => [...prev, { role: 'bot', text: res.data.reply, time: now() }]);
    } catch (err) {
      const errMsg = err?.code === 'ERR_NETWORK'
        ? "Cannot reach the backend. Make sure Spring Boot is running on port 8080."
        : "Something went wrong. Please try again.";
      setMessages(prev => [...prev, { role: 'bot', text: errMsg, time: now() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
            width: 52, height: 52, borderRadius: '50%',
            background: 'linear-gradient(135deg, #1f6feb, #388bfd)',
            border: '2px solid rgba(88,166,255,0.4)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(31,111,235,0.4)',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          title="Security Assistant"
        >
          <Shield size={22} style={{ color: '#fff' }} />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          width: 380, height: 560,
          background: '#161b22', border: '1px solid #30363d',
          borderRadius: 14, display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease',
        }}>
          {/* Header */}
          <div style={{ padding: '14px 16px', background: '#1c2333', borderBottom: '1px solid #30363d', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #1f6feb, #388bfd)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={16} style={{ color: '#fff' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3', margin: 0 }}>Security Assistant</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3fb950' }} />
                <p style={{ fontSize: 11, color: '#8b949e', margin: 0 }}>Powered by Aucxion AI</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b949e', padding: 4, borderRadius: 6, display: 'flex' }}>
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {messages.map((m, i) => <Message key={i} msg={m} />)}

            {loading && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(88,166,255,0.15)', border: '1px solid rgba(88,166,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={14} style={{ color: '#58a6ff' }} />
                </div>
                <div style={{ padding: '10px 14px', background: '#1c2333', border: '1px solid #30363d', borderRadius: '4px 12px 12px 12px', display: 'flex', gap: 5, alignItems: 'center' }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#58a6ff', opacity: 0.7, animation: `pulse ${0.8 + i * 0.15}s ease-in-out infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions (only when no user messages yet) */}
          {messages.length === 1 && (
            <div style={{ padding: '0 14px 10px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => send(s)} style={{
                  padding: '5px 10px', borderRadius: 20, fontSize: 11, cursor: 'pointer',
                  background: 'rgba(88,166,255,0.08)', border: '1px solid rgba(88,166,255,0.2)',
                  color: '#58a6ff', transition: 'all 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(88,166,255,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(88,166,255,0.08)'}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '12px 14px', borderTop: '1px solid #30363d', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about threats, attacks, fixes..."
              rows={1}
              style={{
                flex: 1, background: '#1c2333', border: '1px solid #30363d',
                borderRadius: 8, padding: '9px 12px', color: '#e6edf3',
                fontSize: 13, resize: 'none', outline: 'none', fontFamily: 'inherit',
                lineHeight: 1.5, maxHeight: 80, overflowY: 'auto',
              }}
              onFocus={e => e.target.style.borderColor = '#388bfd'}
              onBlur={e => e.target.style.borderColor = '#30363d'}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              style={{
                width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                background: input.trim() && !loading ? 'linear-gradient(135deg, #1f6feb, #388bfd)' : '#1c2333',
                border: `1px solid ${input.trim() && !loading ? 'rgba(88,166,255,0.3)' : '#30363d'}`,
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
            >
              {loading ? <Loader size={14} style={{ color: '#484f58' }} className="spin" /> : <Send size={14} style={{ color: input.trim() ? '#fff' : '#484f58' }} />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
