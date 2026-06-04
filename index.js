import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import compression from "compression";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync, appendFileSync, mkdirSync } from "fs";

import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import projectRouter from "./routes/project.route.js";
import unitRouter from "./routes/unit.route.js";
import leadRouter from "./routes/lead.route.js";
import blogRouter from "./routes/blog.route.js";
import contentRouter from "./routes/content.route.js";
import careerRouter from "./routes/career.route.js";
import mediaRouter from "./routes/media.route.js";
import settingsRouter from "./routes/settings.route.js";
import dashboardRouter from "./routes/dashboard.route.js";
import activityRouter from "./routes/activity.route.js";
import searchRouter from "./routes/search.route.js";
import taskRouter from "./routes/task.route.js";
import notificationRouter from "./routes/notification.route.js";
import accountingRouter from "./routes/accounting.route.js";
import advancedAccountingRouter from "./routes/advanced-accounting.route.js";
import warehouseRouter from "./routes/warehouse.route.js";
import purchasingRouter from "./routes/purchasing.route.js";
import legalRouter from "./routes/legal.route.js";
import aiRouter from "./routes/ai.route.js";
import roleConfigRouter from "./routes/roleConfig.route.js";
import whatsappRouter from "./routes/whatsapp.route.js";
import budgetRouter from "./routes/budget.route.js";
import { seedDefaultRoles } from "./controllers/roleConfig.controller.js";
import recurringTransactionRouter from "./routes/recurringTransaction.route.js";
import { processRecurring } from "./controllers/recurringTransaction.controller.js";

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Logging ─────────────────────────────────────────────────────────────────
const isProduction = process.env.NODE_ENV === "production";

// Simple structured logger
const logger = {
  info:  (...args) => console.log( `[${new Date().toISOString()}] INFO `, ...args),
  warn:  (...args) => console.warn(`[${new Date().toISOString()}] WARN `, ...args),
  error: (...args) => console.error(`[${new Date().toISOString()}] ERROR`, ...args),
};

// HTTP request logging via morgan
const morganFormat = isProduction
  ? ':remote-addr :method :url :status :res[content-length] - :response-time ms'
  : 'dev';

app.use(morgan(morganFormat, {
  skip: (req) => req.url === "/health" || req.url === "/api/health",
  stream: {
    write: (msg) => {
      const trimmed = msg.trim();
      // Warn on slow (>2s) or error responses
      const status = parseInt(trimmed.match(/\s(\d{3})\s/)?.[1] || "0");
      if (status >= 500)      logger.error("HTTP", trimmed);
      else if (status >= 400) logger.warn ("HTTP", trimmed);
      else                    logger.info ("HTTP", trimmed);
    },
  },
}));

// Log failed auth attempts and suspicious activity
app.use((req, _res, next) => {
  const suspicious = ["/etc/passwd", "../", "wp-admin", ".env", "phpinfo", "cmd.exe"];
  if (suspicious.some(s => req.url.includes(s))) {
    logger.warn("SUSPICIOUS REQUEST", req.method, req.url, "from", req.ip);
  }
  next();
});

export { logger };

// Security
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:", "https:", "blob:"],
        "script-src": ["'self'", "'unsafe-inline'", "https://apis.google.com"],
        "connect-src": ["'self'", "https:", "wss:"],
        "frame-src": ["'self'", "https:"],
        "media-src": ["'self'", "https:", "blob:"],
        "object-src": ["'none'"],
      },
    },
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// Sanitize against NoSQL injection
app.use(mongoSanitize());
// Prevent HTTP Parameter Pollution
app.use(hpp());
// Gzip compression
app.use(compression());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "محاولات كثيرة، حاول بعد 15 دقيقة" },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// General API rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { success: false, message: "طلبات كثيرة، حاول بعد قليل" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", generalLimiter);

// DB
mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("MongoDB is connected!!");
    seedDefaultRoles();
    // Auto-connect WhatsApp — lazy import so server still starts if Baileys fails
    setTimeout(() => {
      import("./services/whatsapp.service.js")
        .then(({ connectWhatsApp }) => connectWhatsApp())
        .catch((err) => console.warn("[WhatsApp] Auto-connect skipped:", err.message));
    }, 5000);

    // Start WhatsApp reminder cron (respects settings from DB)
    setTimeout(() => {
      import("./services/waAutomation.service.js")
        .then(({ startReminderCron }) => startReminderCron())
        .catch((err) => console.warn("[WA-Cron] Start skipped:", err.message));
    }, 8000);

    // Start recurring transactions cron — daily at 08:00
    setTimeout(async () => {
      try {
        const cron = await import("node-cron");
        cron.default.schedule("0 8 * * *", () => {
          processRecurring().catch((e) => console.error("[RecurringCron]", e.message));
        });
        console.log("[RecurringCron] Scheduled daily at 08:00");
      } catch (err) {
        console.warn("[RecurringCron] Schedule skipped:", err.message);
      }
    }, 10000);
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
// Build allowed origins from env (comma-separated) + dev defaults
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  ...(process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").flatMap((o) => {
        const h = o.trim().replace(/^https?:\/\//, "");
        return [`https://${h}`, `http://${h}`];
      })
    : []),
];

const isAllowedOrigin = (origin) => {
  if (!origin) return true; // server-to-server or same-origin
  if (allowedOrigins.includes(origin)) return true;
  // Allow any Vercel deployment URL for this project
  if (/^https:\/\/real-estate[\w-]*\.vercel\.app$/.test(origin)) return true;
  // Allow any subdomain of elsarh.co
  if (/^https?:\/\/([\w-]+\.)?elsarh\.co$/.test(origin)) return true;
  return false;
};

app.use(
  cors({
    origin: (origin, cb) => {
      if (isAllowedOrigin(origin)) return cb(null, true);
      cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/projects", projectRouter);
app.use("/api/units", unitRouter);
app.use("/api/leads", leadRouter);
app.use("/api/blogs", blogRouter);
app.use("/api/content", contentRouter);
app.use("/api/careers", careerRouter);
app.use("/api/media", mediaRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/activity", activityRouter);
app.use("/api/search", searchRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/accounting", accountingRouter);
app.use("/api/accounting-cs", advancedAccountingRouter);

// Advanced Accounting (Node.js implementation — same API as C#)
app.use("/api/warehouse", warehouseRouter);
app.use("/api/purchasing", purchasingRouter);
app.use("/api/legal", legalRouter);
app.use("/api/ai", aiRouter);
app.use("/api/roles", roleConfigRouter);
app.use("/api/whatsapp", whatsappRouter);
app.use("/api/budgets", budgetRouter);
app.use("/api/recurring-transactions", recurringTransactionRouter);

// Serve frontend only if client/dist exists (monolith mode)
const distPath = path.join(__dirname, "./client/dist");
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
}

// Health check endpoint
app.get("/api/health", (_req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

// Global error handler — hides stack traces in production
app.use((err, req, res, _next) => {
  logger.error(`${req.method} ${req.url} →`, err.message, err.stack?.split("\n")[1]?.trim() || "");
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    success: false,
    message: isProduction && status === 500 ? "حدث خطأ في الخادم" : (err.message || "Internal Server Error"),
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is running on port ${port}!!`));
