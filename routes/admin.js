// backend/routes/admin.js
import express from "express";
import verifyAdminToken from "../middleware/verifyAdminToken.js"; // ✅ FIXED (no curly braces)
import Admin from "../models/Admin.js";

const router = express.Router();

// ✅ GET /api/admin/me — fetch logged-in admin info
router.get("/me", verifyAdminToken, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select("-password");
    if (!admin)
      return res.status(404).json({ success: false, message: "Admin not found" });

    res.status(200).json({ success: true, admin });
  } catch (err) {
    console.error("Admin /me error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Example: Protected Admin Dashboard route
router.get("/dashboard", verifyAdminToken, async (req, res) => {
  res.status(200).json({
    success: true,
    message: `Welcome, ${req.admin.name}!`,
  });
});

export default router;
