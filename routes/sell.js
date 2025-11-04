// routes/sell.js
import express from "express";
import Sell from "../models/Sell.js";

const router = express.Router();

// POST: Add Sell Property Data
router.post("/", async (req, res) => {
  try {
    const { name, money } = req.body;

    if (!name || !money) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const newSell = new Sell({ name, money });
    await newSell.save();

    res.status(201).json({ success: true, message: "Data saved successfully", sell: newSell });
  } catch (error) {
    console.error("Error saving sell data:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET: Fetch all sell records (optional)
router.get("/", async (req, res) => {
  try {
    const sells = await Sell.find().sort({ createdAt: -1 });
    res.json({ success: true, sells });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
