
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./api/routes/auth.routes.js";
import warehouseRoutes from "./api/routes/warehouse.routes.js";
import productRoutes from "./api/routes/product.routes.js";
import transactionRoutes from "./api/routes/transaction.routes.js";
import fleetRoutes from "./api/routes/fleet.routes.js";
import shippingRoutes from "./api/routes/shipping.routes.js";
import chatRoutes from "./api/routes/chat.routes.js";
import cookieParser from "cookie-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, same-origin)
        if (!origin || origin.startsWith("http://localhost:") || origin.startsWith("https://")) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,               // Essential for Cookies/Sessions
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"] // Essential for 'protect' middleware
}));

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/products", productRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/fleet", fleetRoutes);
app.use("/api/shipping", shippingRoutes);
app.use('/api/chat', chatRoutes); 

// Serve frontend static assets in production
if (process.env.NODE_ENV === "production") {
    const buildPath = path.join(__dirname, "../frontend/build");
    app.use(express.static(buildPath));
    app.get("*", (req, res) => {
        res.sendFile(path.join(buildPath, "index.html"));
    });
}

export default app;