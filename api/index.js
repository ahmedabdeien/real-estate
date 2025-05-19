import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouter from "./routes/user.route.js";
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';
import contactRouter from './routes/contact.route.js';
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

// Setup
dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// MongoDB connection
mongoose.connect(process.env.MONGO)
    .then(() => {
        console.log('MongoDB is connected!!');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

// Middlewares
app.use(express.json());
app.use(cors({
  origin: ["https://elsarhegypt.com", "https://www.elsarhegypt.com"],
  credentials: true
}));
app.use(cookieParser());

// Routes
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/listing", listingRouter);
app.use('/api/contact', contactRouter);

// Serve frontend
app.use(express.static(path.join(__dirname, "./client/dist")));
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "./client/dist/index.html"));
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    });
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}!!`);
});
