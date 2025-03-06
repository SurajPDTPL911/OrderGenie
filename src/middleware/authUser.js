import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const authenticate = async (req, res, next) => {
   
    const authHeader = req.header("Authorization");

    if(!authHeader){
        return res.status(400).json({message: "Access Denied: No token provided"});
    }

    const token = authHeader.split(" ")[1];

    if(!token){
        return res.status(400).json({message: "Access Denied: Token format is wrong"});
    }

    try {
        const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decode;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
}