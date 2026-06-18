import { WebSocketServer } from "ws";
import { User } from "./user.js";

const wss = new WebSocketServer({ port: 3001 });
console.log("ws server is running");


wss.on("connection", (ws, req) => {
    let user: User | undefined;
    
    ws.on("message", (data) => {
        user = new User(ws);
    })

    ws.on("close", () => {
        user?.destroy();
    })

})