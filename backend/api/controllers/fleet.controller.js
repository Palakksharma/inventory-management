import { Fleet } from "../models/fleet.schema.js";

export const addVehicle = async(req , res) =>{
    try {
        const vehicle = await Fleet.create({
            ...req.body,
            manager: req.user.id
        });
        res.status(201).json({ success: true, vehicle });

        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
export const getAllVehicles = async (req, res) => {
    try {
        const vehicles = await Fleet.find();
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};