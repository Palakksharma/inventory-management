import { Activity } from "../models/activity.schema.js";

export const logSystemActivity = async (app, { type, title, description, warehouseId = null }) => {
    try {
        // 1. Persist the log inside MongoDB
        const logEntry = await Activity.create({
            type,
            title,
            description,
            warehouse: warehouseId
        });

        // 2. Fetch the initialized Socket.io instance from Express app state
        const io = app.get("io");
        if (io) {
            // Broadcast the fresh database log entry directly to the Admin Panel room
            io.to("admin_room").emit("new_global_activity", logEntry);

            // If it belongs to a specific warehouse, send it to that local manager too
            if (warehouseId) {
                io.to(`warehouse_${warehouseId}`).emit("new_global_activity", logEntry);
            }
        }

        return logEntry;
    } catch (error) {
        console.error("🚨 System Activity Logging Failed:", error.message);
    }
};