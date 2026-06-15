import { Router } from "express";
import { signin, signup } from "../controller/auth.controller.js";
import spaceRouter from "./space.route.js";
import userRouter from "./user.route.js";
import adminRouter from "./admin.route.js";


const indexRouter: Router = Router();

indexRouter.post("/signup", signup);

indexRouter.post("/signin", signin);

//indexRouter.get("/elements", );

//indexRouter.get("/avatars", );

indexRouter.use("/user", userRouter);

indexRouter.use("/space", spaceRouter);

//indexRouter.use("/admin", adminRouter);

export default indexRouter;