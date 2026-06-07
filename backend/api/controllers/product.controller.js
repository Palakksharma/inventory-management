
import Product from "../models/product.schema.js";
import { Warehouse } from "../models/warehouse.schema.js";
import Transaction from "../models/transaction.schema.js";
import { Shipping } from "../models/shipping.schema.js"; 
import { v2 as cloudinary } from 'cloudinary';
import { Activity } from "../models/activity.schema.js";
// 1. CREATE PRODUCT
export const createProduct = async (req, res) => {
    try {
        const { title, price, costPrice, category, quantity, warehouseId } = req.body;

        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            imageUrls = await Promise.all(
                req.files.map(async (file) => {
                    const result = await cloudinary.uploader.upload(file.path, {
                        folder: "mern_inventory",
                    });
                    return result.secure_url;
                })
            );
        }

        const warehouse = await Warehouse.findById(warehouseId);
        if (!warehouse) {
            return res.status(404).json({ message: "the warehouse doesn't exist!" });
        }

        const qtyNum = Number(quantity) || 0;
        const totalAfterAdding = (warehouse.currentStockLevel || 0) + qtyNum;

        if (totalAfterAdding > warehouse.totalCapacity) {
            return res.status(400).json({
                message: `Warehouse Full! Space left : ${warehouse.totalCapacity - warehouse.currentStockLevel}`
            });
        }

        const product = await Product.create({
            title,
            price: Number(price) || 0,
            costPrice: Number(costPrice) || 0,
            category,
            quantity: qtyNum,
            warehouse: warehouseId,
            images: imageUrls, 
            manager: req.user.id
        });

        warehouse.currentStockLevel = totalAfterAdding;
        await warehouse.save();

        res.status(201).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. UPDATE STOCK
export const updateStock = async (req, res) => {
    try {
        const { productId } = req.params;
        const { amount, note } = req.body;
        const amountNum = Number(amount) || 0;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        const warehouse = await Warehouse.findById(product.warehouse);
        
        if (product.quantity + amountNum < 0) {
            return res.status(400).json({ message: "Not enough stock in hand" });
        }

        if (amountNum > 0 && (warehouse.currentStockLevel + amountNum > warehouse.totalCapacity)) {
            return res.status(400).json({ message: "No room in warehouse for this stock!" });
        }

        await Transaction.create({
            product: productId,
            warehouse: product.warehouse,
            manager: req.user.id,
            type: amountNum > 0 ? "IN" : "OUT",
            amount: Math.abs(amountNum),
            priceAtTransaction: product.price,
            note: note || (amountNum > 0 ? "Restock" : "Sale"),
        });

        product.quantity += amountNum;
        warehouse.currentStockLevel += amountNum;

        await product.save();
        await warehouse.save();

        res.status(200).json({
            message: "Stock updated successfully",
            newProductQuantity: product.quantity,
            newWarehouseLevel: warehouse.currentStockLevel,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. WAREHOUSE REPORT
export const getWarehouseReport = async (req, res) => {
    try {
        const report = await Product.aggregate([
            {
                $addFields: {
                    priceNum: { $convert: { input: "$price", to: "double", onError: 0, onNull: 0 } },
                    costNum: { $convert: { input: "$costPrice", to: "double", onError: 0, onNull: 0 } },
                    qtyNum: { $convert: { input: "$quantity", to: "double", onError: 0, onNull: 0 } }
                }
            },
            {
                $group: {
                    _id: "$warehouse",
                    totalProducts: { $sum: 1 },
                    totalItems: { $sum: "$qtyNum" },
                    totalValue: { $sum: { $multiply: ["$priceNum", "$qtyNum"] } },
                    totalExpense: { $sum: { $multiply: ["$costNum", "$qtyNum"] } }
                }
            },
            {
                $lookup: {
                    from: "warehouses",
                    localField: "_id",
                    foreignField: "_id",
                    as: "warehouseDetails"
                }
            },
            { $unwind: "$warehouseDetails" },
            {
                $project: {
                    _id: 0,
                    warehouseName: "$warehouseDetails.name",
                    location: "$warehouseDetails.location",
                    capacity: "$warehouseDetails.totalCapacity",
                    currentStock: "$warehouseDetails.currentStockLevel",
                    inventoryValue: "$totalValue",
                    totalExpense: "$totalExpense",
                    totalProfit: { $subtract: ["$totalValue", "$totalExpense"] },
                    uniqueProductTypes: "$totalProducts"
                }
            }
        ]);

        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. DASHBOARD STATS (Restored original Top Stores Logic)
export const getDashboardStats = async (req, res) => {
    try {
        const outofStockCount = await Product.countDocuments({ quantity: 0 });
        
        // Total Orders = Manual Sales + Shipping Orders
        const manualSalesCount = await Transaction.countDocuments({ type: "OUT" });
        const shipmentCount = await Shipping.countDocuments();
        const totalOrders = manualSalesCount + shipmentCount;

        // Total Revenue across all warehouses
        const warehouses = await Warehouse.find({});
        const totalRevenue = warehouses.reduce((acc, curr) => acc + (curr.totalProfit || 0), 0);

        // RESTORED: Your original Top 10 Stores Sales logic
        const topStores = await Transaction.aggregate([
            { $match: { type: "OUT" } }, 
            {
                $group: {
                    _id: "$warehouse", 
                    totalRevenue: { 
                        $sum: { $multiply: ["$amount", "$priceAtTransaction"] } 
                    }, 
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { totalRevenue: -1 } }, 
            { $limit: 10 }, 
            {
                $lookup: {
                    from: "warehouses", 
                    localField: "_id",
                    foreignField: "_id",
                    as: "details"
                }
            },
            { $unwind: "$details" },
            {
                $project: {
                    _id: 0,
                    warehouseName: "$details.name",
                    revenue: "$totalRevenue",
                    orders: "$orderCount"
                }
            }
        ]);

        res.status(200).json({
            success: true,
            outofStockCount,
            totalOrders,
            totalRevenue, 
            topStores
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 5. GET PRODUCTS
export const getProducts = async (req, res) => {
    try {
        const { search } = req.query;
        let filter = {};
        if (search) {
            filter.title = { $regex: search, $options: "i" };
        }
        const products = await Product.find(filter)
            .populate("warehouse", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 6. DELETE PRODUCT
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        const warehouse = await Warehouse.findById(product.warehouse);
        if (warehouse) {
            warehouse.currentStockLevel -= product.quantity;
            await warehouse.save();
        }

        await Product.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Product deleted and warehouse updated" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 7. UPDATE PRODUCT
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedProduct = await Product.findByIdAndUpdate(
            id, 
            req.body, 
            { new: true, runValidators: true }
        );

        if (!updatedProduct) return res.status(404).json({ message: "Product not found" });

        res.status(200).json({ success: true, updatedProduct });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getSystemActivities = async (req, res) => {
    try {
        const feedHistory = await Activity.find()
            .sort({ createdAt: -1 })
            .limit(15)
            .lean();

        res.status(200).json({ success: true, data: feedHistory });
    } catch (error) {
        console.error("❌ Error fetching activity logs:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};