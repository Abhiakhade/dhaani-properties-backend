import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const verifyAdminToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ success: false, message: "No token provided" });

    const token = authHeader.split(" ")[1];
    if (!token)
      return res.status(401).json({ success: false, message: "Invalid token format" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin)
      return res.status(404).json({ success: false, message: "Admin not found" });

    req.admin = admin;
    next();
  } catch (error) {
    console.error("verifyAdminToken error:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired, please login again" });
    }
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

export default verifyAdminToken;
