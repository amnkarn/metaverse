import express, { Application } from "express";
import { prismaClient } from "@repo/db/client";

const app: Application = express();

app.get("/test", async (req, res) => {
    const user = await prismaClient.user.create({
        data: {
            username: Math.random().toString(),
            password: Math.random().toString(),
        }
    })

    console.log("user created");
    console.log(user);
    res.status(201).json(user);
})


export default app;