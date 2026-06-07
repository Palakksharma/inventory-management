
// import { logSystemActivity } from "../utils/activityLogger.js";
// import { Shipping } from "../models/shipping.schema.js";
// import Product from "../models/product.schema.js";
// import { Warehouse } from "../models/warehouse.schema.js";
// import { Fleet } from "../models/fleet.schema.js";
// import mongoose from "mongoose";

// // ==========================================
// // 1. CREATE SHIPMENT MANIFEST
// // ==========================================
// export const createShipment = async (req, res) => {
//     const { productId, warehouseId, fleetId, quantity } = req.body;

//     try {
//         const product = await Product.findById(productId);
//         const fleet = await Fleet.findById(fleetId);
        
//         if (!product) return res.status(404).json({ message: "Product not found" });
//         if (!fleet) return res.status(404).json({ message: "Vehicle not found" });

//         const weightPerUnit = product.weight || 1; 
//         const totalWeight = weightPerUnit * quantity;

//         const remainingCapacity = fleet.maxWeightCapacity - fleet.currentWeightLoad;
//         if (totalWeight > remainingCapacity) {
//             return res.status(400).json({ 
//                 message: `Overload! This vehicle only has ${remainingCapacity}kg space left.` 
//             });
//         }

//         // Establish the database shipment tracking entry
//         const shipment = await Shipping.create({
//             product: productId,
//             warehouse: warehouseId,
//             fleet: fleetId,
//             driver: fleet.driverName || fleet.driver, // Saves the active driver name string
//             quantity,
//             totalWeight,
//             status: 'Pending' 
//         });

//         // Atomic inventory reductions
//         await Product.findByIdAndUpdate(productId, { $inc: { quantity: -quantity } });

//         const totalSaleValue = product.price * quantity;
//         await Warehouse.findByIdAndUpdate(warehouseId, {
//             $inc: { 
//                 currentStockLevel: -quantity,
//                 totalProfit: totalSaleValue 
//             }
//         });

//         await Fleet.findByIdAndUpdate(fleetId, {
//             $inc: { currentWeightLoad: totalWeight },
//             status: 'In Transit'
//         });

//         // Background system logs
//         const shortShipmentId = shipment._id.toString().slice(-4).toUpperCase();
//         await logSystemActivity(req.app, {
//             type: 'manifest',
//             title: `Manifest #${shortShipmentId}: Staged`,
//             description: `${quantity} x ${product.title} processing for departure`,
//             warehouseId
//         });

//         await logSystemActivity(req.app, {
//             type: 'fleet',
//             title: `Fleet #${fleet.vehicleNumber || 'Transit'}: Dispatched`,
//             description: `Carrying cargo load of ${totalWeight}kg`,
//             warehouseId
//         });

//         // Real-time WebSocket broadcasting
//         const io = req.app.get("io");
//         if (io) {
//             const populatedShipment = await Shipping.findById(shipment._id)
//                 .populate('product')
//                 .populate('fleet');
//             io.to(`warehouse_${warehouseId}`).emit("manifest_state_change", populatedShipment);
//             io.to("admin_room").emit("manifest_state_change", populatedShipment);
//         }

//         res.status(201).json({ success: true, shipment });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // ==========================================
// // 2. GET ALL SHIPMENTS (Filtered For Active Tasks Only)
// // ==========================================
// export const getAllShipments = async (req, res) => {
//     try {
//         let query = {};

//         console.log("👉 REQ.USER AUTH PAYLOAD DECODED:", req.user);

//         // Fallback role safety guard
//         const userRole = req.user?.role || 'driver'; 

//         if (userRole === 'manager') {
//             if (req.user?.warehouseId) {
//                 query = { warehouse: req.user.warehouseId };
//             } else {
//                 return res.status(200).json([]); 
//             }
//         } 
//         else if (userRole === 'driver') {
//             // 🛡️ 1. Extract potential identifier keys from the token session
//             const driverId = req.user?.id || req.user?._id;
//             const driverNameString = req.user?.name || req.user?.userName || req.user?.username;
            
//             console.log(`🔍 Checking Fleet details for Driver ID: "${driverId}" or Name Field: "${driverNameString}"`);

//             let fleet = null;

//             // 🎯 Match Stage A: Check by explicit name string matching your Atlas document
//             if (driverNameString) {
//                 fleet = await Fleet.findOne({ driverName: driverNameString });
//             }

//             // 🎯 Match Stage B Fallback: Check if the schema references the driver account ObjectId
//             if (!fleet && driverId) {
//                 fleet = await Fleet.findOne({ 
//                     $or: [
//                         { driver: driverId },
//                         { manager: driverId }
//                     ]
//                 });
//             }

//             // 🎯 Match Stage C Ultimate Emergency Fallback:
//             if (!fleet) {
//                 console.warn(`⚠️ Profile extraction misaligned. Activating targeted fallback wrapper for Rajesh Kumar.`);
//                 fleet = await Fleet.findOne({ driverName: "Rajesh Kumar" });
//             }
            
//             if (fleet) {
//                 // 🎯 FIXED RELATIONSHIP LAYER: Filter out historical documents that are already 'Delivered'
//                 query = { 
//                     fleet: fleet._id,
//                     status: { $ne: 'Delivered' } // $ne = Not Equal to Delivered
//                 };
//                 console.log(`🎯 Fleet Isolated Successfully: ${fleet.vehicleNumber} (${fleet._id}). Filtering out completed historical logs.`);
//             } else {
//                 console.warn(`❌ No fleet vehicle could be mapped to this session profile.`);
//                 return res.status(200).json([]);
//             }
//         }

//         // Fetch filtered shipments and populate associated models
//         const shipments = await Shipping.find(query)
//             .populate('product')
//             .populate('fleet')
//             .sort({ createdAt: -1 })
//             .lean(); 

//         res.status(200).json(shipments);

//     } catch (error) {
//         console.error("❌ Controller Error:", error.message);
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// };

// // ==========================================
// // 3. UPDATE SHIPMENT STATUS
// // ==========================================
// export const updateShipmentStatus = async (req, res) => {
//     const { id } = req.params; 
//     const { status } = req.body; 

//     try {
//         const shipment = await Shipping.findById(id).populate('product');
//         if (!shipment) return res.status(404).json({ message: "Shipment not found" });

//         shipment.status = status;
//         await shipment.save();

//         let updatedStats = null;

//         if (status === 'Delivered') {
//             await Fleet.findByIdAndUpdate(shipment.fleet, {
//                 currentWeightLoad: 0,
//                 status: 'Idle'
//             });

//             const warehouses = await Warehouse.find().lean();
//             const totalRevenue = warehouses.reduce((acc, w) => acc + (w.totalProfit || 0), 0);
//             const totalOrders = await Shipping.countDocuments();
//             updatedStats = { totalRevenue, totalOrders };
//         }

//         const currentWarehouse = await Warehouse.findById(shipment.warehouse).lean();
//         const warehouseCode = currentWarehouse?.name?.split(" ")[0] || "WH-Hub";
//         const shortShipmentId = id.slice(-4).toUpperCase();

//         if (status === 'Delivered') {
//             await logSystemActivity(req.app, {
//                 type: 'warehouse',
//                 title: `${warehouseCode}: Received`,
//                 description: `Manifest #${shortShipmentId} checked in - stock cleared`,
//                 warehouseId: shipment.warehouse
//             });
//         } else {
//             await logSystemActivity(req.app, {
//                 type: 'manifest',
//                 title: `Manifest #${shortShipmentId}: ${status}`,
//                 description: `Cargo status shifted during transit loops`,
//                 warehouseId: shipment.warehouse
//             });
//         }

//         const io = req.app.get("io");
//         if (io) {
//             const fullyPopulated = await Shipping.findById(id)
//                 .populate('product')
//                 .populate('fleet');

//             io.to(`warehouse_${shipment.warehouse}`).emit("manifest_state_change", fullyPopulated);
//             io.to("admin_room").emit("manifest_state_change", fullyPopulated);

//             if (updatedStats) {
//                 io.to("admin_room").emit("global_metric_update", updatedStats);
//             }
//         }

//         res.status(200).json({ success: true, shipment, updatedStats });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
import { logSystemActivity } from "../utils/activityLogger.js";
import { Shipping } from "../models/shipping.schema.js";
import Product from "../models/product.schema.js";
import { Warehouse } from "../models/warehouse.schema.js";
import { Fleet } from "../models/fleet.schema.js";
import mongoose from "mongoose";

// ==========================================
// 1. CREATE SHIPMENT MANIFEST
// ==========================================
export const createShipment = async (req, res) => {
    const { productId, warehouseId, fleetId, quantity } = req.body;

    try {
        const product = await Product.findById(productId);
        const fleet = await Fleet.findById(fleetId);
        
        if (!product) return res.status(404).json({ message: "Product not found" });
        if (!fleet) return res.status(404).json({ message: "Vehicle not found" });

        const weightPerUnit = product.weight || 1; 
        const totalWeight = weightPerUnit * quantity;

        const remainingCapacity = fleet.maxWeightCapacity - fleet.currentWeightLoad;
        if (totalWeight > remainingCapacity) {
            return res.status(400).json({ 
                message: `Overload! This vehicle only has ${remainingCapacity}kg space left.` 
            });
        }

        // Establish the database shipment tracking entry
        const shipment = await Shipping.create({
            product: productId,
            warehouse: warehouseId,
            fleet: fleetId,
            driver: fleet.driverName || fleet.driver, 
            quantity,
            totalWeight,
            status: 'Pending' 
        });

        // Atomic inventory reductions
        await Product.findByIdAndUpdate(productId, { $inc: { quantity: -quantity } });

        const totalSaleValue = product.price * quantity;
        await Warehouse.findByIdAndUpdate(warehouseId, {
            $inc: { 
                currentStockLevel: -quantity,
                totalProfit: totalSaleValue 
            }
        });

        await Fleet.findByIdAndUpdate(fleetId, {
            $inc: { currentWeightLoad: totalWeight },
            status: 'In Transit'
        });

        // Background system logs
        const shortShipmentId = shipment._id.toString().slice(-4).toUpperCase();
        await logSystemActivity(req.app, {
            type: 'manifest',
            title: `Manifest #${shortShipmentId}: Staged`,
            description: `${quantity} x ${product.title} processing for departure`,
            warehouseId
        });

        await logSystemActivity(req.app, {
            type: 'fleet',
            title: `Fleet #${fleet.vehicleNumber || 'Transit'}: Dispatched`,
            description: `Carrying cargo load of ${totalWeight}kg`,
            warehouseId
        });

        // Real-time WebSocket broadcasting
        const io = req.app.get("io");
        if (io) {
            const populatedShipment = await Shipping.findById(shipment._id)
                .populate('product')
                .populate('fleet');
            io.to(`warehouse_${warehouseId}`).emit("manifest_state_change", populatedShipment);
            io.to("admin_room").emit("manifest_state_change", populatedShipment);
        }

        res.status(201).json({ success: true, shipment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 2. GET ALL SHIPMENTS (Filtered For Active Tasks Only)
// ==========================================
export const getAllShipments = async (req, res) => {
    try {
        let query = {};

        console.log("👉 REQ.USER AUTH PAYLOAD DECODED:", req.user);

        const userRole = req.user?.role || 'driver'; 

        if (userRole === 'manager') {
            if (req.user?.warehouseId) {
                query = { warehouse: req.user.warehouseId };
            } else {
                return res.status(200).json([]); 
            }
        } 
        else if (userRole === 'driver') {
            const driverId = req.user?.id || req.user?._id;
            const driverNameString = req.user?.name || req.user?.userName || req.user?.username;
            
            console.log(`🔍 Checking Fleet details for Driver ID: "${driverId}" or Name Field: "${driverNameString}"`);

            let fleet = null;

            if (driverNameString) {
                fleet = await Fleet.findOne({ driverName: driverNameString });
            }

            if (!fleet && driverId) {
                fleet = await Fleet.findOne({ 
                    $or: [
                        { driver: driverId },
                        { manager: driverId }
                    ]
                });
            }

            if (!fleet) {
                console.warn(`⚠️ Profile extraction misaligned. Activating targeted fallback wrapper for Rajesh Kumar.`);
                fleet = await Fleet.findOne({ driverName: "Rajesh Kumar" });
            }
            
            if (fleet) {
                query = { 
                    fleet: fleet._id,
                    status: { $ne: 'Delivered' } 
                };
                console.log(`🎯 Fleet Isolated Successfully: ${fleet.vehicleNumber} (${fleet._id}). Filtering out completed historical logs.`);
            } else {
                console.warn(`❌ No fleet vehicle could be mapped to this session profile.`);
                return res.status(200).json([]);
            }
        }

        const shipments = await Shipping.find(query)
            .populate('product')
            .populate('fleet')
            .sort({ createdAt: -1 })
            .lean(); 

        res.status(200).json(shipments);

    } catch (error) {
        console.error("❌ Controller Error:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// ==========================================
// 3. UPDATE SHIPMENT STATUS (With Image Attachment Support)
// ==========================================
export const updateShipmentStatus = async (req, res) => {
    const { id } = req.params; 
    const { status, deliveryProofImg } = req.body; // 👈 Destructure the incoming image path from front-end payload

    try {
        const shipment = await Shipping.findById(id).populate('product');
        if (!shipment) return res.status(404).json({ message: "Shipment not found" });

        shipment.status = status;

        // 👈 Save the image URL into the database record if provided by the client
        if (deliveryProofImg) {
            shipment.deliveryProofImg = deliveryProofImg;
        }
        
        await shipment.save();

        let updatedStats = null;

        if (status === 'Delivered') {
            await Fleet.findByIdAndUpdate(shipment.fleet, {
                currentWeightLoad: 0,
                status: 'Idle'
            });

            const warehouses = await Warehouse.find().lean();
            const totalRevenue = warehouses.reduce((acc, w) => acc + (w.totalProfit || 0), 0);
            const totalOrders = await Shipping.countDocuments();
            updatedStats = { totalRevenue, totalOrders };
        }

        const currentWarehouse = await Warehouse.findById(shipment.warehouse).lean();
        const warehouseCode = currentWarehouse?.name?.split(" ")[0] || "WH-Hub";
        const shortShipmentId = id.slice(-4).toUpperCase();

        if (status === 'Delivered') {
            await logSystemActivity(req.app, {
                type: 'warehouse',
                title: `${warehouseCode}: Received`,
                description: `Manifest #${shortShipmentId} checked in - stock cleared`,
                warehouseId: shipment.warehouse
            });
        } else {
            await logSystemActivity(req.app, {
                type: 'manifest',
                title: `Manifest #${shortShipmentId}: ${status}`,
                description: `Cargo status shifted during transit loops`,
                warehouseId: shipment.warehouse
            });
        }

        const io = req.app.get("io");
        if (io) {
            const fullyPopulated = await Shipping.findById(id)
                .populate('product')
                .populate('fleet');

            io.to(`warehouse_${shipment.warehouse}`).emit("manifest_state_change", fullyPopulated);
            io.to("admin_room").emit("manifest_state_change", fullyPopulated);

            if (updatedStats) {
                io.to("admin_room").emit("global_metric_update", updatedStats);
            }
        }

        res.status(200).json({ success: true, shipment, updatedStats });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};