import {Warehouse} from "../models/warehouse.schema.js";

export const createWarehouse = async (req, res) => {
    try {
        const { name, location, totalCapacity } = req.body;

        // Check if warehouse already exists
        const existing = await Warehouse.findOne({ name });
        if (existing) return res.status(400).json({ message: "Warehouse already exists" });

        const warehouse = await Warehouse.create({
            name,
            location,
            totalCapacity,
            manager: req.user.id // Linked to the person who created it
        });

        res.status(201).json({ success: true, warehouse });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getWarehouses = async (req, res) => {
    try {
        const warehouses = await Warehouse.find();
        res.status(200).json(warehouses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};