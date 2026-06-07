import express from "express";
import { createShipment, getAllShipments,  updateShipmentStatus } from "../controllers/shipping.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();


router.post("/create", protect, createShipment);
router.get("/all", protect, getAllShipments);
router.patch("/:id/status", protect, updateShipmentStatus);


export default router;