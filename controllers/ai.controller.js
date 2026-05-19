/**
 * AI Assistant — proxy to Groq (free tier, Llama models)
 * GROQ_API_KEY env variable required
 */

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL   = "llama-3.3-70b-versatile"; // free, fast, 70B params

const SYSTEM_PROMPTS = {
  general: `أنت مساعد ذكي لشركة الصرح للتطوير العقاري. أجب دائماً باللغة العربية بشكل واضح ومفيد.
أنت تساعد فريق العمل في مهامهم اليومية. كن محترفاً وموجزاً.`,

  accounting: `أنت مساعد محاسبي متخصص لشركة الصرح للتطوير العقاري.
تخصصاتك: تحليل البيانات المالية، شرح الأرقام، إعداد التقارير، المعادلات المحاسبية.
أجب دائماً باللغة العربية بشكل دقيق ومفيد. إذا طُلب منك تحليل أرقام، قدم تحليلاً احترافياً.`,

  legal: `أنت مساعد قانوني لشركة الصرح للتطوير العقاري.
تخصصاتك: مراجعة العقود، تصنيف القضايا، صياغة الاستشارات القانونية، متابعة المواعيد القانونية.
تنبيه: ردودك للمساعدة وليست استشارة قانونية رسمية.
أجب دائماً باللغة العربية.`,

  inventory: `أنت مساعد متخصص في المخازن والمشتريات لشركة الصرح للتطوير العقاري.
تخصصاتك: إدارة المخزون، أوامر الشراء، الموردين، تتبع الحركات المخزنية.
أجب دائماً باللغة العربية.`,

  sales: `أنت مساعد مبيعات لشركة الصرح للتطوير العقاري.
تخصصاتك: المشاريع العقارية، الوحدات السكنية، العملاء المحتملين، أسعار العقارات.
أجب دائماً باللغة العربية.`,
};

export const chat = async (req, res) => {
  try {
    const { message, context = "general", history = [] } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: "الرسالة مطلوبة" });

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      // Graceful fallback if no API key configured
      return res.json({
        success: true,
        reply: "⚠️ خدمة الذكاء الاصطناعي غير مفعّلة بعد. يرجى إضافة GROQ_API_KEY في الإعدادات.",
      });
    }

    const systemPrompt = SYSTEM_PROMPTS[context] || SYSTEM_PROMPTS.general;

    // Build messages: system + last 10 history + current
    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: message.trim() },
    ];

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        max_tokens: 1024,
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "عذراً، لم أتمكن من الرد.";

    res.json({ success: true, reply });
  } catch (err) {
    console.error("AI chat error:", err.message);
    res.status(500).json({ success: false, message: `فشل الذكاء الاصطناعي: ${err.message}` });
  }
};

// Analyze uploaded data (accounting sheet rows)
export const analyzeData = async (req, res) => {
  try {
    const { data, sheetName, question } = req.body;
    if (!data || !Array.isArray(data)) return res.status(400).json({ success: false, message: "البيانات مطلوبة" });

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.json({
        success: true,
        reply: "⚠️ خدمة الذكاء الاصطناعي غير مفعّلة. أضف GROQ_API_KEY.",
      });
    }

    // Summarize data to avoid token limits
    const summary = data.slice(0, 50).map((row) =>
      Object.entries(row.cells || {})
        .filter(([k]) => !k.startsWith("_"))
        .map(([k, v]) => `${k}:${v}`)
        .join(", ")
    ).join("\n");

    const prompt = `أنا سأزودك ببيانات من جدول "${sheetName || "بيانات"}" (أول 50 سطر):

${summary}

السؤال: ${question || "حلل هذه البيانات وأعطني ملاحظات مهمة"}

قدم تحليلاً مفيداً باللغة العربية.`;

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPTS.accounting },
          { role: "user", content: prompt },
        ],
        max_tokens: 1500,
        temperature: 0.5,
      }),
    });

    if (!response.ok) throw new Error(`Groq API error: ${response.status}`);
    const data2 = await response.json();
    const reply = data2.choices?.[0]?.message?.content || "لم يتمكن النظام من التحليل.";

    res.json({ success: true, reply });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
