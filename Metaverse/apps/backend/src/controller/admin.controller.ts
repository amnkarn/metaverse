import { Request, Response } from "express";
import { createElementSchema, UpdateElementSchema } from "../validators/index.js";
import { prismaClient } from "@repo/db/client";


export const createElement = async (req: Request, res: Response) => {
    const parsedData = createElementSchema.safeParse(req.body);
    if(!parsedData.success) {
        return res.status(400).json({
            message: "Validation error"
        })
    }

    try {
        const element = await prismaClient.element.create({
            data: {
                height: parsedData.data.height,
                width: parsedData.data.width,
                imageUrl: parsedData.data.imageUrl,
                static: parsedData.data.static
            }
        })

        return res.status(200).json({
            id: element.id
        })

    } catch (error) {
        console.log("Error in createElement controller: ", error);
        res.status(500).json("Sommething went wrong");
    }

    const userId = (req as any).userId;
}

export const updateElement = async (req: Request, res: Response) => {
    const parsedData = UpdateElementSchema.safeParse(req.body);
    if(!parsedData.success) {
        return res.status(400).json({
            message: "Validation error"
        })
    }

    try {
        const element = await prismaClient.element.findUnique({
            where: {
                id: req.params.elementId as string
            }
        })

        if(!element) {
            return res.status(400).json({ message: "Invalid element id" })
        }

        //if(element)

        await prismaClient.element.update({
            where: {
                id: req.params.elelmentId as string,
            }, data: {
                imageUrl: parsedData.data.imageUrl
            }
        })

        return res.status(200).json({
            messasge: "Element updated"
        })

    } catch (error) {
        console.log("Error in updateElement controller: ", error);
        res.status(500).json("Sommething went wrong");
    }
}