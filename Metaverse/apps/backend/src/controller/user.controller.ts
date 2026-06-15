import { Request, Response } from "express"
import { UpdateMetaDataSchema } from "../validators/index.js"
import { prismaClient } from "@repo/db/client";



export const updateMetaData = async (req: Request, res: Response) => {
    const parsedData = UpdateMetaDataSchema.safeParse(req.body);
    if(!parsedData.success) {
        return res.send(400).json({
            message: "Validation error"
        })
    }

    try {
        const userId = (req as any).userId;

        await prismaClient.user.update({
            where: {
                id: userId
            }, data: {
                avatarId: parsedData.data.avatarId,
            }
        })

        return res.status(200);
        
    } catch (error) {
        console.log("Error in updateMetaData conroller: ", error);
        return res.status(403)
    }
}


export const getBulkMetaData = async (req: Request, res: Response) => {
    const userIdString = (req.query.ids ?? "[]") as string;
    const userIds = userIdString?.slice(1, userIdString.length - 2).split(",");    
    console.log(userIds)

    try {
        const metaData = await prismaClient.user.findMany({
            where: {
                id: {
                    in: userIds
                }
            }, select: {
                avatar: true,
                id: true
            }
        })

        return res.json({
            avatar: metaData.map(md => ({
                userId: md.id,
                avatarId: md.avatar?.imageUrl
            }))
        })

    } catch (error) {
        console.log("Error in getBulkMetaData: ", error);
        return res.status(500).json({
            message: "Something went wrong"
        })
    }
}