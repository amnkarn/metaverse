import { Request, Response } from "express";
import { CreateSpaceSchema } from "../validators/index.js";
import { prismaClient } from "@repo/db/client";


export const createSpace = async (req: Request, res: Response) => {
    const parsedData = CreateSpaceSchema.safeParse(req.body);
    if(!parsedData.success) {
        return res.status(400).json({
            message: "Validation error"
        })
    }

    try {
        if(!parsedData.data.mapId) {
            const space =  await prismaClient.space.create({
                data: {
                    name: parsedData.data.name,
                    width: Number(parsedData.data.dimension.split("x")[0]),
                    height: Number(parsedData.data.dimension.split("x")[1]),
                    createrId: (req as any).userId,
                }
            })

            return res.status(200).json({
                spaceId: space.id
            })
        }

        // if mapId is given
        const map = await prismaClient.map.findUnique({
            where: {
                id: parsedData.data.mapId,
            }, select: {
                mapElements: true,
            }
        })

        if(!map) {
            return res.status(400).json({
                message: "Map not found"
            })
        }

        //all elms on map should exists

        const space = await prismaClient.space.create({
            data: {
                name: parsedData.data.name,
                width: Number(parsedData.data.dimension.split("x")[0]),
                height: Number(parsedData.data.dimension.split("x")[1]),
                createrId: (req as any).userId,
                elements: {
                    
                }
            }
        })

    } catch (error) {
        console.log("Error in createSpace controller: ", error);
        res.status(500).json("Sommething went wrong");
    }
}