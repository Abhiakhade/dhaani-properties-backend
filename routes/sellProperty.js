// routes/sellProperty.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import SellProperty from "../models/SellProperty.js";
import Property from "../models/Property.js";

const router = express.Router();

// ---------- MULTER SETUP ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/";
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) cb(null, true);
    else cb(new Error("Only image files are allowed (JPG, PNG, WEBP)"));
  },
});

// ---------- ROUTES ----------

// 🧾 POST - User submits property
router.post("/", upload.array("images", 5), async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      city,
      propertyType,
      type,
      bhk,
      beds,
      parking,
      area,
      price,
      description,
    } = req.body;

    // Validate all required fields
    if (
      !name ||
      !phone ||
      !address ||
      !city ||
      !propertyType ||
      !type ||
      !bhk ||
      !beds ||
      !parking ||
      !area ||
      !price ||
      !description
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required (please fill in every field).",
      });
    }

    // Create image URLs
    const imagePaths = (req.files || []).map(
      (file) => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`
    );

    // Create new SellProperty document
    const newProperty = new SellProperty({
      name,
      phone,
      address,
      city,
      propertyType,
      type,
      bhk,
      beds,
      parking,
      area,
      price,
      description,
      images: imagePaths,
      status: "pending",
    });

    await newProperty.save();

    res.status(201).json({
      success: true,
      message: "✅ Property submitted successfully! Awaiting admin review.",
      property: newProperty,
    });
  } catch (error) {
    console.error("Error saving property:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🧭 GET - All SellProperty submissions (for admin dashboard)
router.get("/", async (req, res) => {
  try {
    const properties = await SellProperty.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, properties });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ PUT - Approve a property (move to main Property collection)
router.put("/approve/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find submission
    const submission = await SellProperty.findById(id);
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    if (submission.status === "approved") {
      return res.status(400).json({ success: false, message: "Already approved" });
    }

    // Create new property in main Property collection
    const propertyData = {
      title: `${submission.propertyType} in ${submission.city}`,
      price: submission.price,
      area: submission.area,
      location: submission.address,
      description: submission.description,
      images: submission.images || [],
      sellerName: submission.name,
      sellerPhone: submission.phone,
      propertyType: submission.propertyType,
      bhk: submission.bhk,
      city: submission.city,
      address: submission.address,
      type: submission.type,
      beds: submission.beds,
      parking: submission.parking,
      status: "approved",
      source: "sell_submission",
      approvedAt: new Date(),
    };

    const newProperty = new Property(propertyData);
    await newProperty.save();

    // Update SellProperty status
    submission.status = "approved";
    await submission.save();

    res.status(200).json({
      success: true,
      message: "✅ Property approved and added to main Property collection.",
      property: newProperty,
    });
  } catch (error) {
    console.error("Error approving property:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ❌ DELETE - Reject & Remove a property submission
router.delete("/reject/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await SellProperty.findById(id);
    if (!submission) {
      return res
        .status(404)
        .json({ success: false, message: "Submission not found" });
    }

    await SellProperty.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "❌ Property rejected and deleted successfully.",
    });
  } catch (error) {
    console.error("Error rejecting property:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
