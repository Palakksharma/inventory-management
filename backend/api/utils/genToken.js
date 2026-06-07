// import jwt from "jsonwebtoken";

// export const genToken = async (id,role,warehouse) => {
//     return await jwt.sign({ id,role }, process.env.JWT_SECRET, {
//         expiresIn: "7d",
//     });
// };
import jwt from "jsonwebtoken";

export const genToken = async (id, role, warehouse) => {

    return await jwt.sign(
        { id, role, warehouseId: warehouse }, 
        process.env.JWT_SECRET, 
        { expiresIn: "7d" }
    );
};