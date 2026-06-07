import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import mongoose from "mongoose"; 
import dotenv from "dotenv";
import { setupSocket } from "./api/socket/socket.js"; 

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);


const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:5173"], // Covers standard React and Vite dev ports
        credentials: true,
    },
});

setupSocket(io);

app.set("io", io);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("📦 Inventory Database Connected Successfully");
        server.listen(PORT, () => {
            console.log(`🚀 Industry Server Online & Broadcasting on Port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("🚨 Database Connection Critical Error:", err);
    });