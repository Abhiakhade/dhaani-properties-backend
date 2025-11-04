import express from "express";
import LikedProperty from "../models/LikedProperty.js";

const router = express.Router();

// Save liked property
router.post("/", async (req, res) => {
  try {
    const { userId, propertyId, title, price, location, image } = req.body;
    const existing = await LikedProperty.findOne({ userId, propertyId });
    if (existing) return res.json({ message: "Already liked!" });

    const liked = await LikedProperty.create({ userId, propertyId, title, price, location, image });
    res.json({ message: "Property liked successfully", liked });
  } catch (error) {
    res.status(500).json({ message: "Error liking property", error });
  }
});

// Fetch liked properties by user
router.get("/:userId", async (req, res) => {
  try {
    const liked = await LikedProperty.find({ userId: req.params.userId });
    res.json(liked);
  } catch (error) {
    res.status(500).json({ message: "Error fetching liked properties", error });
  }
});

export default router;
