// import express from "express";
// import { createProduct ,updateStock,getWarehouseReport,getDashboardStats,getProducts,  deleteProduct, updateProduct} from "../controllers/product.controller.js";
// import { protect, isUser } from "../middlewares/auth.middleware.js";
// import upload from "../middlewares/multer.js";

// const router = express.Router();


// router.post("/add-stock", protect, isUser, upload.array("images", 5), createProduct);
// router.patch("/update-stock/:productId", protect, updateStock);
// router.get("/warehouse-report", getWarehouseReport);
// router.get("/dashboard/stats", protect, getDashboardStats)
// router.get("/", getProducts);
// router.delete("/:id", deleteProduct);
// router.put("/:id", updateProduct);
// router.get("/activities", getSystemActivities);

// export default router;
import express from "express";
import { 
  createProduct, updateStock, getWarehouseReport, 
  getDashboardStats, getProducts, deleteProduct, updateProduct,
  getSystemActivities // 👈 1. IMPORT ADDED HERE
} from "../controllers/product.controller.js";
import { protect, isUser } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.post("/add-stock", protect, isUser, upload.array("images", 5), createProduct);
router.patch("/update-stock/:productId", protect, updateStock);
router.get("/warehouse-report", getWarehouseReport);
router.get("/dashboard/stats", protect, getDashboardStats);
router.get("/", getProducts);
router.delete("/:id", deleteProduct);
router.put("/:id", updateProduct);


router.get("/activities", getSystemActivities);

export default router;