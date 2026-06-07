import Transaction from "../models/transaction.schema.js"; // Import the new model

export const updateStock = async (req, res) => {
    try {
        const { productId } = req.params;
        const { amount, note } = req.body;

        const product = await Product.findById(productId);
        const warehouse = await Warehouse.findById(product.warehouse);

      
        product.quantity += amount;
        warehouse.currentStockLevel += amount;

        // 2. CREATE THE TRANSACTION LOG (The Professional Part)
        await Transaction.create({
            product: productId,
            warehouse: product.warehouse,
            manager: req.user.id,
            type: amount > 0 ? "IN" : "OUT",
            amount: Math.abs(amount), // Store as positive number
            note: note || (amount > 0 ? "Restock" : "Sale")
        });

        await product.save();
        await warehouse.save();

        res.status(200).json({ 
            success: true, 
            message: "Stock updated and transaction logged." 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};