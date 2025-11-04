// server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// --------------------- ROUTES (your existing imports) ---------------------
// keep these paths as you already have them
import authRoutes from "./routes/auth.js";
import likedRoutes from "./routes/likedRoutes.js";
import userRoutes from "./routes/user.js";
import propertyRoutes from "./routes/property.js";
import adminAuthRoutes from "./routes/adminAuth.js";
import adminRoutes from "./routes/admin.js";
import sellRoutes from "./routes/sell.js";
import sellPropertyRoutes from "./routes/sellProperty.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --------------------- CORS ---------------------
// You can set ALLOW_ALL_ORIGINS=true in .env to allow everything during dev
const allowAll = process.env.ALLOW_ALL_ORIGINS === "true";

const allowedPatterns = [
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https?:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/,       // 10.x.x.x local network
  /^https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/,     // 192.168.x.x local network
  /^https?:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+(:\d+)?$/, // 172.16-31.x.x
  /\.ngrok-free\.app$/,
  /\.ngrok-free\.dev$/,
  /\.ngrok\.io$/,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (allowAll) return callback(null, true);
      // allow requests with no origin (e.g., curl, mobile apps, same-origin)
      if (!origin) return callback(null, true);

      const allowed = allowedPatterns.some((rx) => rx.test(origin));
      if (allowed) return callback(null, true);

      console.warn(`🚫 Blocked CORS request from: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// --------------------- BODY + STATIC ---------------------
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --------------------- REGISTER API ROUTES ---------------------
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/liked", likedRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/sell", sellRoutes);
app.use("/api/sell-property", sellPropertyRoutes);

// Admin routes (keep order)
app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin", adminRoutes);

// --------------------- HEALTH CHECK ---------------------
app.get("/health", (req, res) => res.status(200).json({ message: "🚀 Server running" }));

// --------------------- DATABASE ---------------------
if (!process.env.MONGO_URL) {
  console.error("⚠️ Missing MONGO_URL in .env!");
}

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Failed:", err.message));

// --------------------- SERVE FRONTEND (ONLY FOR NON-API REQUESTS) ---------------------
// Path to frontend build (adjust if your frontend build dir is elsewhere)
const frontendBuildPath = path.join(__dirname, "../Properties");

// Serve static files if build exists
app.use(express.static(frontendBuildPath));

// IMPORTANT: only send index.html for non-API routes and non-static requests.
// This avoids path-to-regexp issues with '*' and avoids catching API routes.
app.use((req, res, next) => {
  const url = req.originalUrl || req.url;

  // If request starts with /api or /uploads, skip to next (API/static)
  if (url.startsWith("/api/") || url.startsWith("/uploads/")) return next();

  // If request accepts HTML, return index.html (SPA)
  if (req.accepts && req.accepts("html")) {
    return res.sendFile(path.join(frontendBuildPath, "index.html"), (err) => {
      if (err) next(err);
    });
  }

  // otherwise continue (let 404 handler handle it)
  next();
});

// --------------------- 404 + ERROR HANDLERS ---------------------
app.use((req, res) => {
  res.status(404).json({ success: false, message: "❌ Route not found" });
});

app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack || err.message || err);
  res.status(500).json({
    success: false,
    message: "❌ Internal Server Error",
    error: err.message || String(err),
  });
});

// --------------------- START ---------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} — http://localhost:${PORT}`);
});
