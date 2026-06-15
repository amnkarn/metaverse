import { Router } from "express";
import { isUser } from "../middleware/isUser.js";
import { 
    allSpaces, 
    createElement, 
    createSpace, 
    deleteElement, 
    deleteSpace, 
    findSpace
} from "../controller/space.controller.js";


const spaceRouter: Router = Router();

spaceRouter.post("/", isUser, createSpace)

spaceRouter.delete("/:spaceId", isUser, deleteSpace)

spaceRouter.get("/:spaceId", isUser, findSpace)

spaceRouter.get("/all", isUser, allSpaces)

spaceRouter.post("/element", isUser, createElement)

spaceRouter.delete("/element", isUser, deleteElement)


export default spaceRouter;