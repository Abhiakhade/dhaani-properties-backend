import express from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import verifyAdminToken from "../middleware/verifyAdminToken.js";

const router = express.Router();

// 🟢 REGISTER ADMIN
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin)
      return res.status(400).json({ success: false, message: "Admin already exists" });

    const newAdmin = new Admin({ name, email, password });
    await newAdmin.save();

    res.status(201).json({ success: true, message: "Admin registered successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// 🟢 LOGIN ADMIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin)
      return res.status(400).json({ success: false, message: "Invalid credentials" });

    const isMatch = await admin.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// 🟢 GET CURRENT ADMIN INFO (Protected)
router.get("/me", verifyAdminToken, async (req, res) => {
  try {
    res.status(200).json({ success: true, admin: req.admin });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

export default router;
