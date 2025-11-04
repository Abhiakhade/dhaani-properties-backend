// routes/property.js
import express from "express";
import mongoose from "mongoose";
import Property from "../models/Property.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// --------------------- POST NEW PROPERTY LISTING (PROTECTED) ---------------------
router.post("/list", protect, async (req, res) => {
  const {
    sellerName,
    phoneNumber,
    propertyType,
    bhk,
    city,
    areaSqFt,
    expectedPrice,
    description,
    imagePaths,
    listingType, // ✅ FIXED: use listingType here
  } = req.body;

  const userId = req.user.id;

  if (
    !userId ||
    !propertyType ||
    !city ||
    !areaSqFt ||
    !expectedPrice ||
    !description ||
    !listingType // ✅ Check the correct variable
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required property fields." });
  }

  try {
    const newProperty = new Property({
      user: userId,
      listingType, // ✅ Save Buy / Rent / Sell
      propertyType,
      bhk,
      city,
      areaSqFt,
      expectedPrice,
      description,
      sellerName,
      phoneNumber,
      imagePaths,
      status: "pending",
    });

    const savedProperty = await newProperty.save();

    res.status(201).json({
      success: true,
      message: "Property created successfully and awaiting approval.",
      _id: savedProperty._id,
    });
  } catch (err) {
    console.error("Error creating property:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error saving property." });
  }
});

// --------------------- GET ALL PROPERTIES ---------------------
router.get("/", async (req, res) => {
  try {
    const { listingType } = req.query;
let filter = {};
if (listingType) filter.$or = [{ listingType }, { type: listingType }];


    const properties = await Property.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, properties });
  } catch (err) {
    console.error("Error fetching properties:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error fetching properties" });
  }
});

// --------------------- GET PROPERTY BY ID ---------------------
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid property ID" });
  }

  try {
    const property = await Property.findById(id).populate("user", "email");
    if (!property)
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });

    res.status(200).json({ success: true, property });
  } catch (err) {
    console.error("Error fetching property:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error fetching property" });
  }
});

//----------------------
// ✅ Get only SellProperty.jsx submissions (status: "pending")
router.get("/sell-property", async (req, res) => {
  try {
    const sellProperties = await Property.find({ status: "pending" }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      properties: sellProperties,
    });
  } catch (error) {
    console.error("Error fetching sell properties:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching sell properties",
    });
  }
});



export default router;
