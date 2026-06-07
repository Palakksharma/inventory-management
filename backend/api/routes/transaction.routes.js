import express from "express";
// Go up one level (..), then into controllers
import { getInventoryHistory } from "../controllers/transaction.controller.js"; 
// Go up one level (..), then into middleware
import { protect } from "../middlewares/auth.middleware.js"; 

const router = express.Router();

router.get("/history", protect, getInventoryHistory);

export default router;