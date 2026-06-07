import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
    // Determines the icon type or bullet color ('manifest', 'fleet', 'warehouse')
    type: {
        type: String,
        enum: ['manifest', 'fleet', 'warehouse'],
        required: true
    },
    // The main headline text (e.g., "Manifest #5521: Shipped")
    title: {
        type: String,
        required: true,
        trim: true
    },
    // The descriptive subtext (e.g., "11 bags assigned to Ludhiana Main Hub")
    description: {
        type: String,
        required: true,
        trim: true
    },
    // Track which warehouse facility this log belongs to (optional, for segregation)
    warehouse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Warehouse"
    }
}, { timestamps: true }); // Automatically gives us createdAt and updatedAt timestamps

export const Activity = mongoose.model("Activity", activitySchema);