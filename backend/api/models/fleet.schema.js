// import mongoose from "mongoose";

// const fleetSchema = new mongoose.Schema({
//     vehicleNumber:{
//         type:String,
//         required: true,
//         unique: true,
//     },

//     vehicleType:{
//         type: String ,
//         enum :[ 'Truck', 'Van', 'Bike'],
//         default: 'Truck'
//     },

//     driverName: {
//         type: String,
//         required: true
//     },

//     driverPhone:{
//         type : 'String'
//     },

//     maxWeightCapacity:{
//         type: Number,
//         required: true
//     },

//     currentWeightLoad:{
//         type: Number,
//         default: 0
//     },
//     status: { 
//         type: String, 
//         enum: ['Idle', 'In Transit', 'Maintenance'], 
//         default: 'Idle' 
//     },
//     manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
// }, { timestamps: true });

// export const Fleet = mongoose.model("Fleet", fleetSchema);
import mongoose from "mongoose";

const fleetSchema = new mongoose.Schema({
    vehicleNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true // Industry standard: prevents accidental white-space errors
    },
    vehicleType: {
        type: String,
        enum: ['Truck', 'Van', 'Bike'],
        default: 'Truck'
    },
    // Industry Upgrade: Link this directly to the authenticated user account of the driver
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth", // Adjust to match your login model name
        required: true
    },
    driverName: {
        type: String,
        required: true
    },
    driverPhone: {
        type: String, // Corrected syntax: removed string quotation marks
        required: true
    },
    maxWeightCapacity: {
        type: Number,
        required: true,
        min: [0, "Capacity cannot be negative"] // Defensive validation
    },
    currentWeightLoad: {
        type: Number,
        default: 0,
        min: [0, "Weight load cannot be negative"]
    },
    status: { 
        type: String, 
        enum: ['Idle', 'In Transit', 'Maintenance'], 
        default: 'Idle' 
    },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "Auth" }
}, { timestamps: true });

export const Fleet = mongoose.model("Fleet", fleetSchema);