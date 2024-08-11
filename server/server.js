import express from "express";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import path from "path";

import productRouter from "./routes/product.router.js";
import authRouter from "./routes/auth.router.js";
import userRouter from "./routes/user.router.js";
import { connectMongoDB } from "./config/db.js";
import cookieParser from "cookie-parser";

dotenv.config();

// ^ environment variables for cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const __dirname = path.resolve();

app.use(express.json({ limit: "5mb" })); // for parsing request body
app.use(cookieParser());

app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use("/api/user", productRouter);
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/client/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  connectMongoDB();
  console.log(`Your server is running on ${PORT}`);
});
