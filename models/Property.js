// // models/Property.js
// import mongoose from "mongoose";

// const propertySchema = new mongoose.Schema(
//   // {
//   //   title: { type: String, required: true },
//   //   price: { type: String, required: true },
//   //   area: { type: String },
//   //   location: { type: String, required: true },
//   //   description: { type: String },
//   //   images: [{ type: String }],
//   //   sellerName: { type: String },
//   //   sellerPhone: { type: String },
//   //   sellerEmail: { type: String },
//   //   status: { type: String, default: "pending" }, // pending | approved | rejected
//   // },
//   {
//     // 🏠 Basic Info
//     title: { type: String, required: true },
//     price: { type: String, required: true },
//     area: { type: String },
//     location: { type: String, required: true }, // maps to SellProperty.address or city
//     description: { type: String },
//     images: [{ type: String }],
//     // type: { type: String },
//     // beds: { type: String },
//     // parking: { type: String },


//     // 👤 Seller Info
//     sellerName: { type: String },
//     sellerPhone: { type: String },
//     sellerEmail: { type: String },

//     // 🏢 Additional Info from SellProperty
//     propertyType: { type: String }, // e.g. Apartment, Plot, Villa
//     bhk: { type: String },
//     city: { type: String },
//     address: { type: String },

//     // ⚙️ Metadata
//     status: { type: String, default: "pending" }, // pending | approved | rejected
//     source: { type: String, default: "sell_submission" }, // from SellProperty or admin
//     approvedBy: { type: String, default: null },
//     approvedAt: { type: Date, default: null },
//   },
//   { timestamps: true }
// );

// const Property = mongoose.model("Property", propertySchema);
// export default Property;

import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    // 🏠 Basic Property Info
    title: { type: String, required: true },
    price: { type: String, required: true },
    area: { type: String },
    location: { type: String, required: true }, // maps to SellProperty.address or city
    description: { type: String },
    images: [{ type: String }],

    // 🏢 Property Specifications
    propertyType: { type: String }, // e.g. Flat, Plot, Villa
    type: { type: String }, // e.g. Residential / Commercial
    bhk: { type: String },
    beds: { type: String },
    parking: { type: String },
    city: { type: String },
    address: { type: String },

    // 👤 Seller Information
    sellerName: { type: String },
    sellerPhone: { type: String },
    sellerEmail: { type: String },

    // ⚙️ Metadata
    status: { 
      type: String, 
      enum: ["pending", "approved", "rejected"], 
      default: "pending" 
    },
    source: { type: String, default: "sell_submission" }, // from SellProperty or admin
    approvedBy: { type: String, default: null },
    approvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const Property = mongoose.model("Property", propertySchema);
export default Property;
