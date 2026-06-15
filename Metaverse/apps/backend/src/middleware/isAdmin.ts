import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/config.js";


export function isAdmin(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    const token = header?.split(" ")[1];

    if(!token) {
        return res.status(401).json({
            message: "Auth token is missing"
        })
    }

    try {
        const decode = jwt.verify(token, JWT_SECRET) as {role: string, userId: string};
        if(decode.role !== "admin") {
            return res.status(401).json({ "message": "Unauthorised" })
        }
        
        (req as any).userId = decode.userId;
        next();
        
    } catch (error) {
        console.log("Error in 'isAdmin' middleware: ", error);
        return res.status(401).json({
            message: "Unauthorised"
        })
    }
}