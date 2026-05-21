/**
 * WhatsApp Notification Service
 * يدعم 3 مزودين:
 *   - ultramsg  → WA_PROVIDER=ultramsg  WA_INSTANCE_ID=xxxxx  WA_TOKEN=xxxxxx
 *   - meta      → WA_PROVIDER=meta      WA_PHONE_ID=xxxxx     WA_TOKEN=xxxxxx
 *   - twilio    → WA_PROVIDER=twilio    TWILIO_SID=xxx        TWILIO_TOKEN=xxx  TWILIO_WA_FROM=whatsapp:+14155238886
 *
 * لو مفيش WA_TOKEN → بيطبع في الـ console بس (وضع التطوير)
 */

import axios from "axios";

const PROVIDER = process.env.WA_PROVIDER || "ultramsg";

/**
 * @param {string} to   - رقم الهاتف (مع كود الدولة، مثلاً: 201012345678)
 * @param {string} message
 */
export const sendWhatsApp = async (to, message) => {
  const phone = String(to).replace(/[^0-9]/g, "");
  if (!phone) return;

  if (!process.env.WA_TOKEN) {
    console.log(`[WhatsApp-DEV] to=${phone} | ${message.slice(0, 80)}...`);
    return { dev: true };
  }

  try {
    if (PROVIDER === "ultramsg") {
      const res = await axios.post(
        `https://api.ultramsg.com/${process.env.WA_INSTANCE_ID}/messages/chat`,
        { token: process.env.WA_TOKEN, to: phone, body: message },
        { timeout: 8000 }
      );
      return res.data;
    }

    if (PROVIDER === "meta") {
      const res = await axios.post(
        `https://graph.facebook.com/v19.0/${process.env.WA_PHONE_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: phone,
          type: "text",
          text: { body: message },
        },
        {
          headers: { Authorization: `Bearer ${process.env.WA_TOKEN}` },
          timeout: 8000,
        }
      );
      return res.data;
    }

    if (PROVIDER === "twilio") {
      const { default: FormData } = await import("form-data");
      const form = new FormData();
      form.append("From", process.env.TWILIO_WA_FROM || "whatsapp:+14155238886");
      form.append("To", `whatsapp:+${phone}`);
      form.append("Body", message);
      const res = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_SID}/Messages.json`,
        form,
        {
          auth: { username: process.env.TWILIO_SID, password: process.env.TWILIO_TOKEN },
          timeout: 8000,
        }
      );
      return res.data;
    }
  } catch (err) {
    console.error(`[WhatsApp] Failed to send to ${phone}:`, err.response?.data || err.message);
  }
};

// ─── رسائل جاهزة ─────────────────────────────────────────────────────────────

export const WA_MESSAGES = {
  newLead: ({ name, phone, projectName, message }) =>
    `🏢 *طلب استفسار جديد*\n\n👤 الاسم: ${name}\n📞 الهاتف: ${phone}\n🏗️ المشروع: ${projectName || "غير محدد"}\n💬 الرسالة: ${message || "—"}\n\n_الصرح للتطوير العقاري_`,

  unitBooked: ({ clientName, unitNumber, projectName, price }) =>
    `✅ *حجز وحدة جديد*\n\n👤 العميل: ${clientName}\n🏠 الوحدة: ${unitNumber}\n🏗️ المشروع: ${projectName}\n💰 السعر: ${Number(price).toLocaleString("ar-EG")} ج.م\n\n_الصرح للتطوير العقاري_`,

  unitSold: ({ clientName, unitNumber, projectName }) =>
    `🎉 *تم بيع وحدة*\n\n👤 العميل: ${clientName}\n🏠 الوحدة: ${unitNumber}\n🏗️ المشروع: ${projectName}\n\n_الصرح للتطوير العقاري_`,

  newContract: ({ contractNumber, partyA, value }) =>
    `📄 *عقد جديد*\n\n📋 رقم العقد: ${contractNumber}\n👤 الطرف الأول: ${partyA}\n💰 القيمة: ${Number(value || 0).toLocaleString("ar-EG")} ج.م\n\n_الصرح للتطوير العقاري_`,

  welcome: ({ name }) =>
    `مرحباً ${name} 👋\nشكراً لتواصلك مع *الصرح للتطوير العقاري*.\nسيتواصل معك أحد مستشارينا في أقرب وقت. 🏢`,
};
