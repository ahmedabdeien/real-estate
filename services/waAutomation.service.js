/**
 * WhatsApp Automation Service
 * ============================
 * Handles: scheduled installment reminders, bulk messaging, automation settings
 * Uses node-cron for scheduling (runs daily at 8am Cairo time)
 */

import cron from "node-cron";
import { sendWhatsApp } from "./whatsapp.service.js";

let cronJob = null;

// ─── Default automation settings ─────────────────────────────────────────────
export const DEFAULT_AUTOMATION = {
  newLead: {
    enabled: true,
    notifyAdmin: true,
    welcomeClient: true,
    adminMsg: "استفسار جديد من {name} | هاتف: {phone} | المشروع: {project}",
    clientMsg: "مرحباً {name}، شكراً لتواصلك مع الصرح للتطوير العقاري. سيتواصل معك أحد مستشارينا في أقرب وقت.",
  },
  booking: {
    enabled: true,
    notifyAdmin: true,
    notifyClient: true,
    adminMsg: "تم حجز وحدة {unit} في مشروع {project} للعميل {client}",
    clientMsg: "مرحباً {client}، تم تأكيد حجزك للوحدة {unit} في مشروع {project}. سنتواصل معك لاستكمال الإجراءات.",
  },
  reminder: {
    enabled: false,
    daysBefore: 3,
    msg: "تذكير: لديك دفعة بقيمة {amount} ج.م مستحقة بتاريخ {date}. يرجى السداد في الموعد المحدد. الصرح للتطوير العقاري",
  },
};

// ─── Load settings from DB ────────────────────────────────────────────────────
async function loadSettings() {
  try {
    const Settings = (await import("../models/settings.model.js")).default;
    const doc = await Settings.findOne({ key: "wa_automation" });
    if (!doc) return DEFAULT_AUTOMATION;
    return { ...DEFAULT_AUTOMATION, ...doc.value };
  } catch {
    return DEFAULT_AUTOMATION;
  }
}

// ─── Save settings to DB ──────────────────────────────────────────────────────
export async function saveAutomationSettings(settings) {
  const Settings = (await import("../models/settings.model.js")).default;
  await Settings.findOneAndUpdate(
    { key: "wa_automation" },
    { key: "wa_automation", value: settings, group: "whatsapp", label: "إعدادات أتومايشن الواتساب" },
    { upsert: true, new: true }
  );
  // Restart cron with new settings
  startReminderCron();
}

export async function getAutomationSettings() {
  return loadSettings();
}

// ─── Format message template ──────────────────────────────────────────────────
export function formatMsg(template, vars = {}) {
  let msg = template || "";
  Object.entries(vars).forEach(([k, v]) => {
    msg = msg.replace(new RegExp(`\\{${k}\\}`, "g"), v ?? "—");
  });
  return msg;
}

// ─── Trigger: New Lead ────────────────────────────────────────────────────────
export async function triggerNewLead({ name, phone, projectName, adminPhone }) {
  try {
    const cfg = await loadSettings();
    if (!cfg.newLead?.enabled) return;

    const vars = { name, phone, project: projectName || "غير محدد" };

    if (cfg.newLead.notifyAdmin && adminPhone) {
      const msg = formatMsg(cfg.newLead.adminMsg, vars);
      await sendWhatsApp(adminPhone, `*استفسار جديد*\n\n${msg}\n\n_الصرح للتطوير العقاري_`);
    }

    if (cfg.newLead.welcomeClient && phone) {
      const msg = formatMsg(cfg.newLead.clientMsg, { ...vars, name });
      await sendWhatsApp(phone, msg);
    }
  } catch (err) {
    console.error("[WA-Auto-Lead]", err.message);
  }
}

// ─── Trigger: Booking / Reservation ──────────────────────────────────────────
export async function triggerBooking({ clientName, clientPhone, unitNumber, projectName, adminPhone }) {
  try {
    const cfg = await loadSettings();
    if (!cfg.booking?.enabled) return;

    const vars = { client: clientName, unit: unitNumber, project: projectName };

    if (cfg.booking.notifyAdmin && adminPhone) {
      const msg = formatMsg(cfg.booking.adminMsg, vars);
      await sendWhatsApp(adminPhone, `*تأكيد حجز*\n\n${msg}\n\n_الصرح للتطوير العقاري_`);
    }

    if (cfg.booking.notifyClient && clientPhone) {
      const msg = formatMsg(cfg.booking.clientMsg, vars);
      await sendWhatsApp(clientPhone, msg);
    }
  } catch (err) {
    console.error("[WA-Auto-Booking]", err.message);
  }
}

// ─── Bulk Send ────────────────────────────────────────────────────────────────
export async function bulkSend({ phones, message, delayMs = 2000 }) {
  const results = { sent: 0, failed: 0, offline: 0, errors: [] };

  for (const phone of phones) {
    try {
      const r = await sendWhatsApp(phone, message);
      if (r?.offline) {
        results.offline++;
      } else {
        results.sent++;
      }
    } catch (err) {
      results.failed++;
      results.errors.push({ phone, error: err.message });
    }
    // Delay to avoid WhatsApp ban
    if (phones.indexOf(phone) < phones.length - 1) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  return results;
}

// ─── Reminder Cron (daily at 8:00 AM) ────────────────────────────────────────
export async function startReminderCron() {
  if (cronJob) { cronJob.stop(); cronJob = null; }

  const cfg = await loadSettings();
  if (!cfg.reminder?.enabled) {
    console.log("[WA-Cron] Reminders disabled — cron not started");
    return;
  }

  // Run daily at 08:00 Cairo time (UTC+2 = 06:00 UTC)
  cronJob = cron.schedule("0 6 * * *", async () => {
    console.log("[WA-Cron] Running installment reminder check...");
    await runReminderJob(cfg);
  });

  console.log("[WA-Cron] Reminder cron started (daily 08:00 Cairo)");
}

// ─── Reminder Job Logic ───────────────────────────────────────────────────────
async function runReminderJob(cfg) {
  try {
    const Purchasing = (await import("../models/purchasing.model.js")).default;
    const daysBefore = cfg.reminder?.daysBefore || 3;
    const msgTemplate = cfg.reminder?.msg || DEFAULT_AUTOMATION.reminder.msg;

    const now = new Date();
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + daysBefore);

    // Find items with dueDate in the next N days that are not paid
    const start = new Date(targetDate); start.setHours(0, 0, 0, 0);
    const end   = new Date(targetDate); end.setHours(23, 59, 59, 999);

    const items = await Purchasing.find({
      dueDate: { $gte: start, $lte: end },
      paymentStatus: { $ne: "paid" },
    }).lean();

    console.log(`[WA-Cron] Found ${items.length} reminders to send`);

    for (const item of items) {
      const phone = item.supplierPhone || item.phone;
      if (!phone) continue;

      const msg = formatMsg(msgTemplate, {
        amount: Number(item.totalAmount || item.amount || 0).toLocaleString("ar-EG"),
        date: item.dueDate
          ? new Date(item.dueDate).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })
          : "—",
        name: item.supplierName || item.name || "عميل",
        ref: item.referenceNumber || item._id.toString().slice(-6),
      });

      await sendWhatsApp(phone, msg);
      await new Promise((r) => setTimeout(r, 3000)); // 3s delay between messages
    }
  } catch (err) {
    console.error("[WA-Cron] Error:", err.message);
  }
}

// ─── Export cron control ──────────────────────────────────────────────────────
export const stopReminderCron = () => { cronJob?.stop(); cronJob = null; };
export const isCronRunning    = () => !!cronJob;
