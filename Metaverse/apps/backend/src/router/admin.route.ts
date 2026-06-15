import { Router } from "express";
import { createElement, updateElement } from "../controller/admin.controller.js";
import { isAdmin } from "../middleware/isAdmin.js";


const adminRouter: Router = Router();

adminRouter.post("/element", isAdmin, createElement)

adminRouter.put("/element/:elementId", updateElement)

adminRouter.post("/avatar", () => {

})

adminRouter.post("/map", () => {

})



export default adminRouter;