import React, { useState, useRef, useEffect } from 'react';
import { FaWandMagicSparkles, FaXmark, FaPaperPlane, FaRobot } from 'react-icons/fa6';
import { aiAPI } from '../../api/services';

export default function AiChatWidget() {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'مرحباً! أنا مساعدك العقاري الذكي. كيف يمكنني مساعدتك اليوم؟' }
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const res = await aiAPI.chat({ messages: next });
      setMessages(m => [...m, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'عذراً، حدث خطأ. حاول مرة أخرى.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-110"
        style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}
        title="المساعد العقاري الذكي"
      >
        {open
          ? <FaXmark className="text-white text-xl" />
          : <FaWandMagicSparkles className="text-white text-xl" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 left-6 z-50 flex flex-col rounded-2xl shadow-2xl overflow-hidden"
          style={{ width: 340, height: 480, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
            <FaRobot className="text-white text-lg" />
            <div>
              <p className="text-white font-bold text-sm">المساعد العقاري</p>
              <p className="text-purple-200 text-xs">مدعوم بالذكاء الاصطناعي</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div
                  className="max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed"
                  style={m.role === 'user'
                    ? { background: 'var(--color-bg)', color: 'var(--color-text-dark)', border: '1px solid var(--color-border)' }
                    : { background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: '#fff' }
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-end">
                <div className="px-3 py-2 rounded-2xl text-sm"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: '#fff' }}>
                  <span className="animate-pulse">جاري الكتابة...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 flex gap-2" style={{ borderTop: '1px solid var(--color-border)' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="اكتب سؤالك..."
              className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
              style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-dark)' }}
            />
            <button onClick={send} disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40 transition-all"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
              <FaPaperPlane className="text-white text-xs" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
