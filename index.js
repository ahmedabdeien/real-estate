import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

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

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
      },
    },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  })
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "محاولات كثيرة، حاول بعد 15 دقيقة" },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// DB
mongoose
  .connect(process.env.MONGO)
  .then(() => console.log("MongoDB is connected!!"))
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
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
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

// Serve frontend only if client/dist exists (monolith mode)
const distPath = path.join(__dirname, "./client/dist");
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
}

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is running on port ${port}!!`));
