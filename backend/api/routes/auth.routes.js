import express from "express";
// import { signup } from "../controllers/auth.controller";
import { signin, signup } from "../controllers/auth.controller.js";

const router = express.Router();

// http methods
// This handles: POST http://localhost:5000/api/auth/signup
router.post("/signup", signup);

// This handles: POST http://localhost:5000/api/auth/signin
router.post("/signin", signin);

export default router;