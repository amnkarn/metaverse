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
                height: true,
                width: true
            }
        })

        if(!map) {
            return res.status(400).json({
                message: "Map not found"
            })
        }

        let spaceId;

        await prismaClient.$transaction(async () => {
            const space = await prismaClient.space.create({
                data: {
                    name: parsedData.data.name,
                    width: map.width,
                    height: map.width,
                    createrId: (req as any).userId,
                }
            })
            spaceId = space.id;

            await prismaClient.spaceElement.createMany({
                data: map.mapElements.map(e => ({
                    spaceId: space.id,
                    elementId: e.elementsId,
                    x: e.x!,
                    y: e.y!,
                }))
            })

        })

        console.log("space created");
        return res.status(200).json({
            "spaceId": spaceId,
        })

    } catch (error) {
        console.log("Error in createSpace controller: ", error);
        res.status(500).json("Sommething went wrong");
    }
}

export const deleteSpace = async (req: Request, res: Response) => {
    const spaceId = req.params.spaceId;
    if(!spaceId) {
        return res.status(400).json({
            message: "space id is required"
        })
    }

    try {
        const space = await prismaClient.space.findUnique({
            where: {
                id: spaceId as string,
            }
        })

        if(!space) {
            return res.status(400).json({
                message: "Space not found"
            })
        }

        if(space.createrId !== (req as any).userID) {
            return res.status(403).json({
                message: "Unauthorised"
            })
        }

        await prismaClient.space.delete({
            where: {
                id: spaceId as string,
            }
        })

        res.status(200).json({ message: "space deleted" })
        
    } catch (error) {
        console.log("Error in deleteSpace controller: ", error);
        res.status(500).json("Sommething went wrong");
    }
}

export const allSpaces = async (req: Request, res: Response) => {

    try {
        const allSpaces = await prismaClient.space.findMany({
            where: {
                createrId: (req as any).userId,
            }
        })

        return res.status(200).json({
            "spaces": allSpaces.map(e => ({
                "id": e.id,
                "name": e.name,
                "dimension": `${e.height}x${e.width}`,
                "thumbnail": e.thumbnnail
            }))
        })

    } catch (error) {
        console.log("Error in allSpaces controller: ", error);
        res.status(500).json("Sommething went wrong");
    }
}