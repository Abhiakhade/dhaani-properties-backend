// models/SellProperty.js
import mongoose from "mongoose";

const sellPropertySchema = new mongoose.Schema(
  {
    // 👤 Seller Details
    name: { type: String, required: true },
    phone: { type: String, required: true },

    // 📍 Property Location
    address: { type: String, required: true },
    city: { type: String, required: true },

    // 🏠 Property Details
    propertyType: { type: String, required: true }, // e.g., House, Flat
    type: { type: String, required: true }, // e.g., Residential / Commercial
    bhk: { type: String, required: true },
    beds: { type: Number, required: true },
    parking: { type: String, required: true }, // Yes / No
    area: { type: Number, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },

    // 🖼️ Images
    images: [{ type: String }],

    // ⚙️ Status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const SellProperty = mongoose.model("SellProperty", sellPropertySchema);
export default SellProperty;
