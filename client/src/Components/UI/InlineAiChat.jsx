/**
 * InlineAiChat — AI chat panel embedded directly in a page.
 * Collapsible strip pinned to the bottom of the page content area.
 */
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Bot, User, Loader2, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const WELCOME = (ctx) => ({
  role: "assistant",
  content:
    ctx === "accounting"
      ? "مرحباً! أنا مساعدك في تحليل البيانات المحاسبية. اسألني عن المجاميع، الفروق، أو أي استفسار مالي."
      : ctx === "sales"
      ? "مرحباً! يمكنني مساعدتك في تحليل بيانات العملاء والمبيعات."
      : ctx === "legal"
      ? "مرحباً! يمكنني مساعدتك في الاستفسارات القانونية والعقود."
      : ctx === "inventory"
      ? "مرحباً! يمكنني مساعدتك في تحليل بيانات المخزون والمشتريات."
      : "مرحباً! أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟",
});

const QUICK = {
  accounting: ["ما إجمالي المبالغ؟", "ما الفرق بين الوارد والصادر؟", "حلل هذه البيانات"],
  sales:      ["كم عدد العملاء الجدد؟", "ما أكثر المشاريع طلباً؟", "تحليل حالة العملاء"],
  legal:      ["ما مواعيد انتهاء العقود القريبة؟", "صياغة بند قانوني", "شرح بند في العقد"],
  inventory:  ["ما الأصناف منخفضة المخزون؟", "تحليل المشتريات", "تقرير الحركة"],
  general:    ["كيف أستخدم هذه الصفحة؟", "اشرح لي الأرقام", "ما الخطوة التالية؟"],
};

export default function InlineAiChat({ context = "general", pageData = null }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME(context)]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const quick = QUICK[context] || QUICK.general;

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        inputRef.current?.focus();
      }, 150);
    }
  }, [open, messages]);

  const sendMessage = async (text) => {
    const t = (text || input).trim();
    if (!t || loading) return;
    const userMsg = { role: "user", content: t };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const history = updated.slice(-8).map((m) => ({ role: m.role, content: m.content }));
      const r = await api.post("/ai/chat", {
        message: t,
        context,
        history,
        pageData: pageData ? JSON.stringify(pageData).slice(0, 2000) : undefined,
      });
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

  const reset = () => setMessages([WELCOME(context)]);

  const ctxColors = {
    accounting: "bg-blue-600",
    sales:      "bg-[#2d5d89]",
    legal:      "bg-purple-700",
    inventory:  "bg-orange-600",
    general:    "bg-[#2d5d89]",
  };
  const headerBg = ctxColors[context] || ctxColors.general;

  return (
    <div className="mt-4 rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-white">
      {/* Collapse Toggle Bar */}
      <button
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center gap-3 px-4 py-3 ${headerBg} text-white transition-opacity hover:opacity-90`}
      >
        <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1 text-right">
          <p className="font-bold text-sm">المساعد الذكي</p>
          <p className="text-xs text-white/70">اسأل AI عن بيانات هذه الصفحة</p>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 1 && (
            <span className="text-xs bg-white/20 rounded-full px-2 py-0.5">{messages.length - 1} رسائل</span>
          )}
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </button>

      {/* Chat Body */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {/* Messages */}
            <div className="h-64 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center ${
                    msg.role === "user" ? `${headerBg} text-white` : "bg-white border border-gray-200"
                  }`}>
                    {msg.role === "user"
                      ? <User className="w-3.5 h-3.5" />
                      : <Bot className="w-3.5 h-3.5 text-gray-500" />
                    }
                  </div>
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? `${headerBg} text-white rounded-tr-sm`
                      : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-3 py-2 flex items-center gap-2 shadow-sm">
                    <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />
                    <span className="text-xs text-gray-400">جاري التفكير...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick chips */}
            <div className="flex gap-1.5 px-4 py-2 flex-wrap border-t border-gray-100 bg-white">
              {quick.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  disabled={loading}
                  className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-600 hover:border-[#2d5d89] hover:text-[#2d5d89] transition-colors disabled:opacity-40"
                >
                  {q}
                </button>
              ))}
              <button
                onClick={reset}
                className="mr-auto text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
                title="مسح المحادثة"
              >
                <RotateCcw className="w-3 h-3" />
                مسح
              </button>
            </div>

            {/* Input */}
            <div className="flex gap-2 px-4 py-3 border-t border-gray-100 bg-white">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                rows={1}
                placeholder="اكتب سؤالك هنا..."
                className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]/30 focus:border-[#2d5d89] max-h-24"
                style={{ minHeight: "40px" }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className={`w-10 h-10 flex-shrink-0 rounded-xl text-white flex items-center justify-center transition-colors disabled:opacity-50 self-end ${headerBg}`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
