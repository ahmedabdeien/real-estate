import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Bot, User, Loader2 } from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const WELCOME_MSG = {
  role: "assistant",
  content: "مرحباً! أنا مساعدك الذكي. يمكنني مساعدتك في الحسابات، تحليل البيانات، والإجابة على أسئلتك.",
};

export default function AiAssistant() {
  const location = useLocation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState("general");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const getAvailableContexts = () => {
    const pages = user?.allowedPages || [];
    const isAdmin = user?.role === "admin" || pages.includes("*");
    const contexts = [{ key: "general", label: "عام" }];
    if (isAdmin || pages.includes("accounting") || pages.includes("accounting-beni-suef")) {
      contexts.push({ key: "accounting", label: "حسابات" });
    }
    if (isAdmin || pages.includes("legal")) {
      contexts.push({ key: "legal", label: "قانوني" });
    }
    if (isAdmin || pages.includes("warehouse") || pages.includes("purchasing")) {
      contexts.push({ key: "inventory", label: "مخازن" });
    }
    if (isAdmin || pages.includes("projects") || pages.includes("units") || pages.includes("leads")) {
      contexts.push({ key: "sales", label: "مبيعات" });
    }
    return contexts;
  };

  // Auto-select context based on current page
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("accounting")) setContext("accounting");
    else if (path.includes("legal")) setContext("legal");
    else if (path.includes("warehouse") || path.includes("purchasing")) setContext("inventory");
    else if (path.includes("projects") || path.includes("units") || path.includes("leads")) setContext("sales");
    else setContext("general");
  }, [location.pathname]);

  const availableContexts = getAvailableContexts();

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const history = updated.slice(-6).map((m) => ({ role: m.role, content: m.content }));
      const r = await api.post("/ai/chat", { message: text, context, history });
      setMessages([...updated, { role: "assistant", content: r.data.reply || r.data.message || "..." }]);
    } catch (err) {
      setMessages([...updated, {
        role: "assistant",
        content: err.response?.data?.message || "عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-2xl bg-[#2d5d89] text-white shadow-lg hover:bg-[#245079] transition-colors flex items-center justify-center"
            title="المساعد الذكي"
          >
            <Sparkles className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 left-6 z-50 w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 bg-[#2d5d89] text-white flex-shrink-0">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">المساعد الذكي</p>
                <p className="text-xs text-white/60">مدعوم بالذكاء الاصطناعي</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Context Selector */}
            <div className="flex gap-1.5 px-3 py-2 bg-gray-50 border-b border-gray-100 flex-shrink-0 flex-wrap">
              {availableContexts.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setContext(c.key)}
                  className={`flex-1 text-xs font-medium py-1.5 rounded-lg transition-all min-w-[48px] ${
                    context === c.key
                      ? "bg-[#2d5d89] text-white"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs ${
                    msg.role === "user" ? "bg-[#2d5d89]" : "bg-gray-200"
                  }`}>
                    {msg.role === "user"
                      ? <User className="w-3.5 h-3.5" />
                      : <Bot className="w-3.5 h-3.5 text-gray-600" />
                    }
                  </div>
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#2d5d89] text-white rounded-tr-sm"
                      : "bg-gray-100 text-gray-800 rounded-tl-sm"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-2 flex-row">
                  <div className="flex-shrink-0 w-7 h-7 rounded-xl bg-gray-200 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-gray-600" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2 flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />
                    <span className="text-xs text-gray-400">جاري التفكير...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2 px-3 py-3 border-t border-gray-100 flex-shrink-0">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="اكتب رسالتك..."
                className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]/30 focus:border-[#2d5d89] max-h-24"
                style={{ minHeight: "40px" }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="w-10 h-10 flex-shrink-0 rounded-xl bg-[#2d5d89] text-white flex items-center justify-center hover:bg-[#245079] transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-end"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
