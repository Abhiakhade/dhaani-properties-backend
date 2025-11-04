import express from "express";
import User from "../models/User.js";
import Property from "../models/Property.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// routes/user.js
router.get("/all", async (req, res) => {
  const users = await User.find();
  res.json({ success: true, users });
});

// GET liked properties
router.get("/liked-properties", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("likedProperties");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ likedProperties: user.likedProperties });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST like a property
router.post("/like-property/:propertyId", authMiddleware, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.likedProperties.includes(propertyId)) {
      user.likedProperties.push(propertyId);
      await user.save();
    }

    const updatedUser = await User.findById(req.userId).populate("likedProperties");
    res.json({ message: "Property liked successfully", likedProperties: updatedUser.likedProperties });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Unlike a property
router.post("/unlike/:propertyId", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const propertyId = req.params.propertyId;

    if (!user) return res.status(404).json({ message: "User not found" });

    user.likedProperties = user.likedProperties.filter(
      (id) => id.toString() !== propertyId
    );
    await user.save();

    const likedProperties = await User.findById(req.userId).populate("likedProperties");

    res.json({ likedProperties: likedProperties.likedProperties });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
