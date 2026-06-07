import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    product:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    warehouse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Warehouse",
        required: true
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth",
        required: true
    },
    type: {
        type: String,
        enum: ["IN", "OUT"], // IN for restock, OUT for sales/removal
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    note: {
        type: String,
        default: "Regular stock adjustment"
    },

  priceAtTransaction: {
    type : Number,
    required: true,
    default:0
  }




}, { timestamps: true });

export default mongoose.model("Transaction", transactionSchema);

