import jwt from "jsonwebtoken";


export default async function generateToken(userId: string, userRole: string) {
    const token = await jwt.sign({
        userId: userId,
        role: userRole
    }, process.env.JWT_SECRET!)

    return token;
}