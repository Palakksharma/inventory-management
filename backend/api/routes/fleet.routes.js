import express from "express";
import { addVehicle, getAllVehicles } from "../controllers/fleet.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/add", protect, addVehicle);
router.get("/all", protect, getAllVehicles);

export default router;