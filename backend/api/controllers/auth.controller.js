
import { Auth } from "../models/auth.schema.js";
import { genToken } from "../utils/genToken.js";


export const signup = async (req, res) => {
    try {
        const { userName, email, password, phone, role, } = req.body;

        const userExists = await Auth.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await Auth.create({
            userName,
            email,
            password,
            phone,
            role,
            role: role || "driver",
           warehouse: req.body.warehouseId
        });

        if (user) {
           const token = await genToken(user._id, user.role, user.warehouse);

            // Set cookie so the user is logged in immediately after signup
            return res.status(201).cookie("token", token, {
                httpOnly: true,
                secure: false,
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            }).json({
                _id: user._id,
                userName: user.userName,
                role: user.role, 
                warehouseId: user.warehouseId,
               
                token: token,
                message: "User Registered Successfully!"

            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password ) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await Auth.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Password is incorrect" });
        }


        const token = await genToken(user._id, user.role , user.warehouse? user.warehouse : null);

        if (!token) {
            return res.status(400).json({ message: "Token generation failed" });
        }

        
        return res.status(200).cookie("token", token, {
            httpOnly: true,
            secure: false, 
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        }).json({
            id: user._id,
         
            message: "Signin successful",
            role: user.role,
            token: token
        });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};