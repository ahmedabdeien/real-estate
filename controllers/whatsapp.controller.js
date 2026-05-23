import {
  getStatus,
  connectWhatsApp,
  disconnectWhatsApp,
  sendWhatsApp,
  addListener,
  removeListener,
} from "../services/whatsapp.service.js";
import {
  getAutomationSettings,
  saveAutomationSettings,
  bulkSend,
  isCronRunning,
} from "../services/waAutomation.service.js";

// GET /api/whatsapp/status
export const waStatus = (req, res) => {
  const { status, statusMessage, qr } = getStatus();
  res.json({ success: true, status, statusMessage, qr });
};

// POST /api/whatsapp/connect
export const waConnect = async (req, res) => {
  try {
    await connectWhatsApp();
    res.json({ success: true, message: "جارٍ الاتصال — انتظر QR Code" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/whatsapp/disconnect
export const waDisconnect = async (req, res) => {
  try {
    await disconnectWhatsApp();
    res.json({ success: true, message: "تم قطع الاتصال" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/whatsapp/test
export const waTest = async (req, res) => {
  try {
    const { phone, message } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: "phone مطلوب" });
    await sendWhatsApp(phone, message || "اختبار إشعار من الصرح للتطوير العقاري");
    res.json({ success: true, message: "تم إرسال الرسالة" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/whatsapp/events  (Server-Sent Events — live status updates)
export const waEvents = (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Send current state immediately
  const { status, statusMessage, qr } = getStatus();
  res.write(`data: ${JSON.stringify({ status, statusMessage, qr })}\n\n`);

  const send = (data) => {
    try { res.write(`data: ${JSON.stringify(data)}\n\n`); } catch {}
  };

  addListener(send);
  req.on("close", () => removeListener(send));
};

// GET /api/whatsapp/automation
export const waGetAutomation = async (req, res) => {
  try {
    const settings = await getAutomationSettings();
    res.json({ success: true, settings, cronRunning: isCronRunning() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/whatsapp/automation
export const waUpdateAutomation = async (req, res) => {
  try {
    const { settings } = req.body;
    if (!settings) return res.status(400).json({ success: false, message: "settings مطلوب" });
    await saveAutomationSettings(settings);
    res.json({ success: true, message: "تم حفظ إعدادات الأتومايشن" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/whatsapp/bulk
export const waBulk = async (req, res) => {
  try {
    const { phones, message } = req.body;
    if (!phones?.length) return res.status(400).json({ success: false, message: "phones مطلوب" });
    if (!message?.trim()) return res.status(400).json({ success: false, message: "message مطلوب" });

    // Start bulk send in background (don't await — respond immediately)
    const results = await bulkSend({ phones, message, delayMs: 2500 });
    res.json({ success: true, message: "تم الإرسال", results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
