/**
 * WhatsApp Service — Powered by Baileys (100% Free, No API Costs)
 * ================================================================
 * Uses WhatsApp Web protocol via @whiskeysockets/baileys
 * Auth state stored in MongoDB so sessions survive server restarts
 *
 * Setup: go to /admin/whatsapp → scan QR code with your phone
 *
 * IMPORTANT: Baileys is dynamically imported ONLY when connectWhatsApp()
 * is called — never at module load time — so this file is safe to import
 * from lead/contact controllers without crashing the server on startup.
 */

// ─── State ────────────────────────────────────────────────────────────────────
let sock = null;
let qrDataUrl = null;
let status = "disconnected"; // disconnected | connecting | qr_ready | connected
let statusMessage = "لم يتم الاتصال بعد";

const listeners = new Set(); // SSE clients

function broadcast(data) {
  for (const send of listeners) {
    try { send(data); } catch { listeners.delete(send); }
  }
}

// ─── Connect ─────────────────────────────────────────────────────────────────
export async function connectWhatsApp() {
  status = "connecting";
  statusMessage = "جارٍ الاتصال...";
  broadcast({ status, statusMessage });

  // Lazy-load Baileys only when actually connecting
  const { makeWASocket, DisconnectReason, fetchLatestBaileysVersion } =
    await import("@whiskeysockets/baileys");
  const { Boom } = await import("@hapi/boom");
  const QRCode = (await import("qrcode")).default;
  const { useMongoAuthState } = await import("./waMongoAuth.js");

  const { state, saveCreds, clearSession } = await useMongoAuthState();
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    browser: ["الصرح للعقارات", "Chrome", "1.0"],
    getMessage: async () => ({ conversation: "" }),
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      try {
        qrDataUrl = await QRCode.toDataURL(qr);
        status = "qr_ready";
        statusMessage = "امسح الـ QR Code بهاتفك";
        broadcast({ status, statusMessage, qr: qrDataUrl });
      } catch {}
    }

    if (connection === "close") {
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const shouldReconnect = code !== DisconnectReason.loggedOut;
      status = "disconnected";
      statusMessage = shouldReconnect ? "انقطع الاتصال — جارٍ إعادة الاتصال..." : "تم تسجيل الخروج";
      qrDataUrl = null;
      broadcast({ status, statusMessage });

      if (shouldReconnect) {
        setTimeout(connectWhatsApp, 3000);
      } else {
        // Clean session on logout
        const { useMongoAuthState: getAuth } = await import("./waMongoAuth.js");
        const { clearSession: clear } = await getAuth();
        await clear().catch(() => {});
      }
    }

    if (connection === "open") {
      status = "connected";
      qrDataUrl = null;
      statusMessage = `متصل: ${sock.user?.name || sock.user?.id || ""}`;
      broadcast({ status, statusMessage });
      console.log("[WhatsApp] Connected ✅", sock.user?.id);
    }
  });
}

// ─── Send ─────────────────────────────────────────────────────────────────────
export async function sendWhatsApp(to, message) {
  if (!to) return;
  const phone = String(to).replace(/[^0-9]/g, "");
  if (!phone) return;

  if (status !== "connected" || !sock) {
    console.log(`[WhatsApp-OFFLINE] to=${phone}: ${message.slice(0, 60)}...`);
    return { offline: true };
  }

  try {
    const jid = phone.includes("@") ? phone : `${phone}@s.whatsapp.net`;
    const result = await sock.sendMessage(jid, { text: message });
    return result;
  } catch (err) {
    console.error("[WhatsApp] send error:", err.message);
  }
}

// ─── Getters ─────────────────────────────────────────────────────────────────
export const getStatus = () => ({ status, statusMessage, qr: qrDataUrl });
export const addListener = (fn) => listeners.add(fn);
export const removeListener = (fn) => listeners.delete(fn);
export const disconnectWhatsApp = async () => {
  try { await sock?.logout?.(); } catch {}
  try {
    const { useMongoAuthState } = await import("./waMongoAuth.js");
    const { clearSession } = await useMongoAuthState();
    await clearSession();
  } catch {}
  sock = null; status = "disconnected"; statusMessage = "تم قطع الاتصال";
  broadcast({ status, statusMessage });
};

// ─── Message Templates ───────────────────────────────────────────────────────
export const WA_MESSAGES = {
  newLead: ({ name, phone, projectName, message }) =>
    `🏢 *طلب استفسار جديد*\n\n👤 الاسم: ${name}\n📞 الهاتف: ${phone}\n🏗️ المشروع: ${projectName || "غير محدد"}\n💬 الرسالة: ${message || "—"}\n\n_الصرح للتطوير العقاري_`,

  unitBooked: ({ clientName, unitNumber, projectName, price }) =>
    `✅ *حجز وحدة جديد*\n\n👤 العميل: ${clientName}\n🏠 الوحدة: ${unitNumber}\n🏗️ المشروع: ${projectName}\n💰 السعر: ${Number(price || 0).toLocaleString("ar-EG")} ج.م\n\n_الصرح للتطوير العقاري_`,

  unitSold: ({ clientName, unitNumber, projectName }) =>
    `🎉 *تم بيع وحدة*\n\n👤 العميل: ${clientName}\n🏠 الوحدة: ${unitNumber}\n🏗️ المشروع: ${projectName}\n\n_الصرح للتطوير العقاري_`,

  newContract: ({ contractNumber, partyA, value }) =>
    `📄 *عقد جديد*\n\n📋 رقم العقد: ${contractNumber}\n👤 الطرف الأول: ${partyA}\n💰 القيمة: ${Number(value || 0).toLocaleString("ar-EG")} ج.م\n\n_الصرح للتطوير العقاري_`,

  welcome: ({ name }) =>
    `مرحباً ${name} 👋\nشكراً لتواصلك مع *الصرح للتطوير العقاري*.\nسيتواصل معك أحد مستشارينا في أقرب وقت. 🏢`,

  paymentReminder: ({ clientName, amount, dueDate }) =>
    `💰 *تذكير بالدفعة*\n\n👤 العميل: ${clientName}\n💵 المبلغ: ${Number(amount).toLocaleString("ar-EG")} ج.م\n📅 تاريخ الاستحقاق: ${dueDate}\n\n_الصرح للتطوير العقاري_`,
};
