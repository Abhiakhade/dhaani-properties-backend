import mongoose from "mongoose";

const likedPropertySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  propertyId: { type: String, required: true },
  title: String,
  price: String,
  location: String,
  image: String,
  likedAt: { type: Date, default: Date.now },
});

export default mongoose.model("LikedProperty", likedPropertySchema);
