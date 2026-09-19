import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// =====================================================
// ROUTES
// =====================================================

import authRoutes from "./routes/auth.js";
import likedRoutes from "./routes/likedRoutes.js";
import userRoutes from "./routes/user.js";
import propertyRoutes from "./routes/property.js";
import adminAuthRoutes from "./routes/adminAuth.js";
import adminRoutes from "./routes/admin.js";
import sellRoutes from "./routes/sell.js";
import sellPropertyRoutes from "./routes/sellProperty.js";

// =====================================================
// PATH SETUP
// =====================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =====================================================
// APP
// =====================================================

const app = express();

// =====================================================
// CORS
// =====================================================
//
// TEMPORARY DEBUG CONFIGURATION
//
// We are intentionally using origin: "*" here to determine
// whether the deployed frontend/backend problem is CORS.
//
// IMPORTANT:
// Do NOT use credentials: true with origin: "*".
//
// Once everything works, we will restrict this to your
// actual Vercel domain.
// =====================================================

app.use(
  cors({
    origin: "*",

    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization", "Accept"],

    optionsSuccessStatus: 204,
  }),
);

// =====================================================
// BODY PARSER
// =====================================================

app.use(
  express.json({
    limit: "10mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  }),
);

// =====================================================
// STATIC UPLOADS
// =====================================================
//
// ⚠️ Render local storage is temporary.
// Later we should move property images to Cloudinary,
// AWS S3, or another persistent storage service.
// =====================================================

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =====================================================
// API ROUTES
// =====================================================

app.use("/api/auth", authRoutes);

app.use("/api/user", userRoutes);

app.use("/api/liked", likedRoutes);

app.use("/api/properties", propertyRoutes);

app.use("/api/sell", sellRoutes);

app.use("/api/sell-property", sellPropertyRoutes);

// =====================================================
// ADMIN ROUTES
// =====================================================

app.use("/api/admin", adminAuthRoutes);

app.use("/api/admin", adminRoutes);

// =====================================================
// ROOT
// =====================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Dhaani Properties API is running 🚀",
  });
});

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server running 🚀",

    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",

    timestamp: new Date().toISOString(),
  });
});

// =====================================================
// API TEST ROUTE
// =====================================================

app.get("/api/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API connection successful 🚀",
  });
});

// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack || err.message);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",

    error:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : err.message,
  });
});

// =====================================================
// DATABASE + SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log("======================================");

    console.log("🚀 Starting Dhaani Properties API");

    console.log("======================================");

    // -----------------------------------
    // Environment check
    // -----------------------------------

    if (!process.env.MONGO_URL) {
      console.error("❌ MONGO_URL is missing");

      process.exit(1);
    }

    if (!process.env.JWT_SECRET) {
      console.warn("⚠️ JWT_SECRET is missing");
    }

    console.log("⏳ Connecting to MongoDB...");

    // -----------------------------------
    // MongoDB
    // -----------------------------------

    await mongoose.connect(process.env.MONGO_URL);

    console.log("✅ MongoDB Connected");

    // -----------------------------------
    // Start Express
    // -----------------------------------

    app.listen(PORT, () => {
      console.log("--------------------------------------");

      console.log(`🚀 Server running on port ${PORT}`);

      console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);

      console.log("🌍 CORS: TEMPORARILY OPEN");

      console.log("--------------------------------------");
    });
  } catch (error) {
    console.error("❌ Server startup failed:");

    console.error(error.message);

    process.exit(1);
  }
};

// =====================================================
// START
// =====================================================

startServer();
