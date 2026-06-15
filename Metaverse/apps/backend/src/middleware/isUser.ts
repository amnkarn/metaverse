import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/config.js";


export function isUser(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    const token = header?.split(" ")[1];

    if(!token) {
        return res.status(401).json({
            message: "Auth token is missing"
        })
    }

    try {
        const decode = jwt.verify(token, JWT_SECRET) as {role: string, userId: string};
        (req as any).userId = decode.userId;
        next();
        
    } catch (error) {
        console.log("Error in 'isUser' middleware: ", error);
        return res.status(401).json({
            message: "Unauthorised"
        })
    }
}