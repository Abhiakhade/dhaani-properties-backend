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

// --------------------- PATH SETUP ---------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------- APP ---------------------
const app = express();

// =====================================================
// CORS CONFIGURATION
// =====================================================

const allowedOrigins = [
  "http://localhost:5173",

  // Add your actual Vercel frontend URL here later.
  // Example:
  // "https://dhaani-properties.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // such as Postman, curl, server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      // Allow localhost
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // TEMPORARY:
      // Allow deployed frontend while testing CORS.
      // Once your exact Vercel URL is known, remove this
      // and use the strict configuration below.
      if (origin.includes(".vercel.app") || origin.includes(".vercel.sh")) {
        return callback(null, true);
      }

      console.log("❌ CORS blocked:", origin);

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization", "Accept"],

    optionsSuccessStatus: 204,
  }),
);

// Explicitly handle preflight requests
app.options("*", cors());

// =====================================================
// BODY PARSER
// =====================================================

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// =====================================================
// STATIC UPLOADS
// =====================================================

// ⚠️ Local Render storage is temporary.
// For production, use Cloudinary / AWS S3 / Cloudflare R2.
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
// ROOT ROUTE
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
  });
});

// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "❌ Route not found",
    path: req.originalUrl,
  });
});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack || err.message);

  // Handle CORS errors
  if (err.message?.startsWith("CORS blocked")) {
    return res.status(403).json({
      success: false,
      message: "CORS error",
      error: err.message,
    });
  }

  res.status(500).json({
    success: false,
    message: "❌ Internal Server Error",
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
    console.log("=================================");
    console.log("🚀 Starting Dhaani Properties API");
    console.log("=================================");

    // -------------------------------
    // Check MongoDB URL
    // -------------------------------

    if (!process.env.MONGO_URL) {
      console.error("❌ MONGO_URL is missing");
      process.exit(1);
    }

    console.log("⏳ Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URL);

    console.log("✅ MongoDB Connected");

    // -------------------------------
    // Start server
    // -------------------------------

    app.listen(PORT, () => {
      console.log("---------------------------------");
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log("---------------------------------");
    });
  } catch (error) {
    console.error("❌ Server startup error:");
    console.error(error.message);

    process.exit(1);
  }
};

// =====================================================
// START
// =====================================================

startServer();
