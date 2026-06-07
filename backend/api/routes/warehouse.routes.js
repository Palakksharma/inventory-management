import express from "express";
import { createWarehouse, getWarehouses } from "../controllers/warehouse.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.post("/create", protect, createWarehouse)
router.get("/all", protect, getWarehouses);
export default router;