import jwt from "jsonwebtoken";
import User from "../models/auth.model.js";

export const protectRouter = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, error: "Unauthorized : No token provided" });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);

    if (!verified) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized : Invalid token",
      });
    }

    const user = await User.findById(verified.userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
