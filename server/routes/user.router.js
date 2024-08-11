import express from "express";

import { searchProduct, updateUser } from "../controllers/user.controller.js";
import { protectRouter } from "../middleware/protectRouter.js";

const router = express.Router();

router.route("/search").get(protectRouter, searchProduct);
router.route("/update").post(protectRouter, updateUser);

export default router;
