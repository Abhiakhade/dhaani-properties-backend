import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// --------------------- ROUTES ---------------------
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
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://your-frontend.vercel.app", // 🔥 replace with your real frontend URL
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

// --------------------- MIDDLEWARE ---------------------
app.use(express.json());

// ⚠️ TEMP: local uploads (not safe on Render long-term)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --------------------- API ROUTES ---------------------
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/liked", likedRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/sell", sellRoutes);
app.use("/api/sell-property", sellPropertyRoutes);

// Admin routes
app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin", adminRoutes);

// --------------------- HEALTH CHECK ---------------------
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

app.get("/health", (req, res) => {
  res.status(200).json({ message: "🚀 Server running" });
});

// --------------------- 404 HANDLER ---------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "❌ Route not found",
  });
});

// --------------------- ERROR HANDLER ---------------------
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack || err.message);

  res.status(500).json({
    success: false,
    message: "❌ Internal Server Error",
    error: err.message,
  });
});

// --------------------- START SERVER (WITH DB CONNECTION) ---------------------
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log("🔍 Starting server...");
    console.log("🔍 MONGO_URL:", process.env.MONGO_URL);

    if (!process.env.MONGO_URL) {
      console.error("❌ MONGO_URL missing");
      process.exit(1);
    }

    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URL);

    console.log("✅ MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  }
};

startServer();