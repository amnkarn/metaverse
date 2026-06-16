import { Request, Response } from "express";
import { AddElementSchema, CreateSpaceSchema, DeleteElementSchema } from "../validators/index.js";
import { prismaClient } from "@repo/db/client";


export const createSpace = async (req: Request, res: Response) => {
    const parsedData = CreateSpaceSchema.safeParse(req.body);
    if(!parsedData.success) {
        return res.status(400).json({
            message: "Validation error"
        })
    }
    //console.log(parsedData.data)

    try {
        if(!parsedData.data.mapId) {
            const space =  await prismaClient.space.create({
                data: {
                    name: parsedData.data.name,
                    width: Number(parsedData.data.dimensions.split("x")[0]),
                    height: Number(parsedData.data.dimensions.split("x")[1]),
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

        //console.log("space creater id: ", space.createrId);
        //console.log("user id: ", (req as any).userId);
        //console.log("req reached before delete call");

        if(space.createrId !== (req as any).userId) {
            return res.status(403).json({
                message: "Unauthorised"
            })
        }

        await prismaClient.space.delete({
            where: {
                id: spaceId as string,
            }
        })
        //console.log("req reached after delete call");

        res.status(200).json({ message: "space deleted" })
        
    } catch (error) {
        console.log("Error in deleteSpace controller: ", error);
        res.status(500).json("Sommething went wrong");
    }
}

export const findSpace = async (req: Request, res: Response) => {
    const spaceId = req.params.spaceId as string;
    if(!spaceId) {
        return res.status(400).json({
            message: "spaceId is missing"
        })
    }

    try {
        const space = await prismaClient.space.findUnique({
            where: {
                id: spaceId,
            }, include: {
                elements: {
                    include: {
                        element: true
                    }
                }
            }
        })

        if(space?.createrId !== (req as any).userId) {
            return res.status(403).json({
                message: "Unauthorised"
            })
        }

        return res.status(200).json({
            dimension: `${space?.height}x${space?.width}`,
            elements: space?.elements.map(e => ({
                id: e.id,
                element: {
                    id: e.element.id,
                    imageUrl: e.element.imageUrl,
                    height: e.element.height,
                    width: e.element.width,
                    static: e.element.static,
                },
                x: e.x,
                y: e.y,
            }))
        })

    } catch (error) {
        console.log("Error in findSpace controller: ", error);
        res.status(500).json("Sommething went wrong");
    }
}

export const allSpaces = async (req: Request, res: Response) => {
    console.log("req reached to allSpaces controller")
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

export const createSpaceElement = async (req: Request, res: Response) => {
    const parsedData = AddElementSchema.safeParse(req.body);
    if(!parsedData.success) {
        return res.status(400).json({
            message: "Validation error"
        })
    }

    try {
        const space = await prismaClient.space.findUnique({
            where: {
                id: parsedData.data.spaceId,
                createrId: (req as any).userId,
            }, select: {
                width: true,
                height: true
            }
        })

        if(!space) {
            return res.status(400).json({
                message: "Invalid sapce"
            })
        }

        const element = await prismaClient.spaceElement.create({
            data: {
                elementId: parsedData.data.elelmentId,
                spaceId: parsedData.data.spaceId,
                x: parsedData.data.x,
                y: parsedData.data.y
            }
        })
        
        res.status(200).json({
            message: "Element added",
        })

    } catch (error) {
        console.log("Error in createElement controller: ", error);
        res.status(500).json("Sommething went wrong");
    }
}

export const deleteElement = async (req: Request, res: Response) => {
    const parsedData = DeleteElementSchema.safeParse(req.body);
    if(!parsedData.success) {
        return res.status(400).json({
            message: "Validation error"
        })
    }

    try {
        const element = await prismaClient.spaceElement.findUnique({
            where: {
                id: parsedData.data.id,
            }, select: {
                space: true
            }
        })

        if(!element) {
            return res.status(403).json({
                message: "Invalid element"
            })
        }

        if(element.space.createrId !== (req as any).userId) {
            return res.status(403).json({
                messasge: "Unauthorised"
            })
        }

        await prismaClient.spaceElement.delete({
            where: {
                id: parsedData.data.id
            }
        })

        res.status(200).json({
            message: "Successfully deleted"
        })

    } catch (error) {
        console.log("Error in deleteElement controller: ", error);
        res.status(500).json("Sommething went wrong");
    }
}