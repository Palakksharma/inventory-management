// import mongoose from "mongoose";

// const productSchema = new mongoose.Schema({
//     title:{
//         type:String,
//         required: true
//     },
  
//     description:{
//         type: String
//     },
//     price:{
//         type:Number,
//         required:true
//     },
//     quantity:{
//         type:Number,
//         required: true,
//     default: 0

//     },
//     category: {
//     type: String,
//     enum: ['electronics', 'furniture', 'clothing', 'Other'], // Helps with categorization
//     default: 'Other'
// },

//     costPrice:{
//         type:String,

//     },
//     images: {
//     type: [String], 
//     default: []
// },

// manager: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Auth",
//     },
//     warehouse: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Warehouse", 
//     }
// }, { timestamps: true });
  
// const Product = mongoose.model("Product", productSchema);
// export default Product;
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String
    },
    price: {
        type: Number,
        required: true,
        min: [0, "Price cannot be negative"]
    },
    costPrice: {
        type: Number, // Industry Upgrade: Changed from String to Number for active financial logic
        required: true,
        default: 0
    },
    quantity: {
        type: Number,
        required: true,
        default: 0,
        min: [0, "Stock cannot fall below zero"]
    },
    category: {
        type: String,
        enum: ['electronics', 'furniture', 'clothing', 'Other'],
        default: 'Other'
    },
    images: {
        type: [String], 
        default: []
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth",
    },
    warehouse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Warehouse",
        index: true // Industry Upgrade: Adds a database index for blazing fast inventory querying
    }
}, { timestamps: true });
  
const Product = mongoose.model("Product", productSchema);
export default Product;