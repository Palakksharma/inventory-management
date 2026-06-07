import Transaction from "../models/transaction.schema.js";
import {Auth} from "../models/auth.schema.js";
export const getInventoryHistory = async (req, res) => {
    try {
        // .populate() is the "Magic" that turns IDs into real names
        const history = await Transaction.find()
            .populate("product", "title")
            .populate("warehouse", "name")
            .populate("manager", "userName")
            .sort({ createdAt: -1 }); // Newest first

        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};