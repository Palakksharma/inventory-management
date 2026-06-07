// import mongoose from "mongoose";

// const shippingSchema = new mongoose.Schema({
//     product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
//     warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
//     fleet: { type: mongoose.Schema.Types.ObjectId, ref: "Fleet", required: true },
//     quantity: { type: Number, required: true },
//     totalWeight: { type: Number, required: true },
//     status: { 
//         type: String, 
//         enum: ['Pending', 'In Transit','Ready for Pickup', 'Delivered'], 
//         default: 'Pending' 
//     },
//     shippedDate: { type: Date, default: Date.now }
// }, { timestamps: true });

// export const Shipping = mongoose.model("Shipping", shippingSchema);
import mongoose from "mongoose";

const shippingSchema = new mongoose.Schema({
    product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Product", 
        required: true 
    },
    warehouse: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Warehouse", 
        required: true,
        index: true // Industry standard: optimized for quick manager queries
    },
    fleet: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Fleet", 
        required: true,
        index: true // Optimized for quick driver assignment queries
    },
    quantity: { 
        type: Number, 
        required: true,
        min: [1, "Quantity must be at least 1"]
    },
    totalWeight: { 
        type: Number, 
        required: true,
        min: [0, "Weight cannot be negative"]
    },
    status: {
        type: String,
        enum: [
            'Pending',           // Admin created, waiting for manager actions
            'Ready for Pickup',   // Manager packed, waiting for driver to pick up
            'In Transit',         // Driver has picked it up and is on the road
            'Delivered',         // Successfully dropped off 
            'Disputed'           // Industry Upgrade: Manager flags payload issues (broken/missing cargo)
        ],
        default: 'Pending'
    },
    
    // 🚚 Enterprise Proof of Delivery (Cloudinary Upload Target)
    deliveryProofImg: {
        type: String, // Stores the secure URL string returned from Cloudinary CDN
        default: ""
    },
    
    // ⚠️ Incident & Exception Management Pipeline
    discrepancyLog: {
        isDisputed: { type: Boolean, default: false },
        reason: { 
            type: String, 
            enum: ['None', 'Damaged Cargo', 'Incorrect Quantity', 'Missing Items', 'Delayed'], 
            default: 'None' 
        },
        comments: { type: String, default: "" },
        reportedAt: { type: Date }
    },

    shippedDate: { type: Date, default: Date.now }
}, { timestamps: true });

export const Shipping = mongoose.model("Shipping", shippingSchema);