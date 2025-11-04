// models/Sell.js
import mongoose from "mongoose";

const sellSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    money: { type: Number, required: true },
  },
  { timestamps: true }
);

const Sell = mongoose.model("Sell", sellSchema);
export default Sell;
