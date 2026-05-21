import {
  getStatus,
  connectWhatsApp,
  disconnectWhatsApp,
  sendWhatsApp,
  addListener,
  removeListener,
} from "../services/whatsapp.service.js";

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
    await sendWhatsApp(phone, message || "🏢 اختبار إشعار من الصرح للتطوير العقاري ✅");
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

  req.on("close", () => {
    removeListener(send);
  });
};
