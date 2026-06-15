import { Router } from "express";
import { CreateSpaceSchema } from "../validators/index.js";
import { isUser } from "../middleware/isUser.js";
import { createSpace } from "../controller/space.controller.js";


const spaceRouter: Router = Router();

spaceRouter.post("/", isUser, createSpace)

spaceRouter.delete("/element", () => {

})

spaceRouter.delete("/:spaceId", () => {
    
})

spaceRouter.get("/all", () => {

})

spaceRouter.post("/element", () => {

})

spaceRouter.get("/:spaceId", () => {
    
})

export default spaceRouter;