import { Router } from "express";
import { isUser } from "../middleware/isUser.js";
import { allSpaces, createSpace, deleteSpace } from "../controller/space.controller.js";


const spaceRouter: Router = Router();

spaceRouter.post("/", isUser, createSpace)

spaceRouter.delete("/:spaceId", isUser, deleteSpace)

spaceRouter.get("/:spaceId", () => {
    
})

spaceRouter.get("/all", isUser, allSpaces)

spaceRouter.post("/element", () => {

})

spaceRouter.delete("/element", () => {

})


export default spaceRouter;