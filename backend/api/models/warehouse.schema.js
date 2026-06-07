import mongoose from "mongoose";
const warehouseSchema = new mongoose.Schema({
    name:{
        type:String,
        required: [true, "Warehouse name is required"],
        unique:true
    },
    location:{
        type:String,
        required:[true, "Location is rerquired"]

    },
    totalCapacity:{
        type:Number,
        required:true,
        default:1000 // total units this warehouse can hold
    },

    currentStockLevel:{
        type:Number,
        default:0  // we will update this auto later
    },
    totalProfit: { 
        type: Number,
        default: 0
    },
    manager:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User"
    },
},
    { timestamps: true });

export const Warehouse = mongoose.model("Warehouse", warehouseSchema);
//mongoose ek model dega named warehoused based on  warehouseSchema