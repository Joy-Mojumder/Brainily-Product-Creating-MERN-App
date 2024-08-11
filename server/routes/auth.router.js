import express from "express";
import {
  signup,
  login,
  logout,
  getMe,
} from "../controllers/auth.controller.js";
import { protectRouter } from "../middleware/protectRouter.js";

const router = express.Router();

// all auth routes
router.route("/me").get(protectRouter, getMe);
router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").post(logout);

export default router;
