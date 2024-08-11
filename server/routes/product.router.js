import express from "express";
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from "../controllers/product.controller.js";
import { protectRouter } from "../middleware/protectRouter.js";

const router = express.Router();

router.route("/product/create").post(protectRouter, createProduct);
router.route("/product/:id").delete(protectRouter, deleteProduct);
router.route("/product/update/:id").put(protectRouter, updateProduct);

export default router;
