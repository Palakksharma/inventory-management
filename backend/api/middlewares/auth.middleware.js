
import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
    try {
        let token;

        // 1. Check for token in Headers (Axios/Postman standard)
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        } 
        // 2. Fallback to Cookie
        else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized: No token provided",
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        // Attach the user data (id, role, etc.) to the request object
        req.user = decoded;
        next();

    } catch (err) {
        return res.status(401).json({
            message: "Token expired or invalid",
        });
    }
};

// This stays the same - it allows any logged-in user (Admin or Driver)
export const isUser = async (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.status(401).json({ message: "Not authorized as a user" });
    }
};

// Keep your isAdmin for routes that ONLY managers should touch
export const isAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied: Admin only",
            });
        }
        next(); 
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};