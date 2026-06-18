import WebSocket from "ws";
import { prismaClient } from "@repo/db/client"
import { RoomManager } from "./RoomManager.js";
import { OutgoingMessage } from "./types.js";
import jwt, {JwtPayload} from "jsonwebtoken";
import "dotenv/config"

function getRandomString(length: number) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}


export class User {
    public id: string;
    public userId?: string;
    private spaceId?: string;
    private x: number;
    private y: number;
    private ws: WebSocket;

    constructor(ws: WebSocket) {
        this.id = getRandomString(10);
        this.x = 0;
        this.y = 0;
        this.ws = ws;
        this.initHandler();
    }

    initHandler() {
        this.ws.on("message", async (data) => {
            const parsedData = JSON.parse(data.toString());
            
            switch(parsedData.type) {
                case "join":
                    const spaceId = parsedData.payload.spaceId;
                    const token = parsedData.payload.token;
                    const decodeToken = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
                    const userId = decodeToken.userId;
                    this.userId = userId;
                    if(!userId) {
                        this.ws.close();
                        return;
                    }

                    const space = await prismaClient.space.findUnique({
                        where: {
                            id: spaceId,
                        }
                    })
                    if(!space) {
                        this.ws.close();
                        return;
                    }
                    this.spaceId = spaceId;
                    const room = RoomManager.getInstance();
                    room.addUser(spaceId, this);

                    this.x = Math.floor(Math.random() * space.height);
                    this.y = Math.floor(Math.random() * space.width);

                    this.send({
                        type: "space-joined",
                        payload: {
                            spawn: {
                                x: this.x,
                                y: this.y    
                            },
                            users: room.rooms.get(spaceId)?.map((u) => {
                                {
                                    id: u.id
                                }
                            })
                        }
                    })

                    room.broadcast({
                        type: "user-join",
                        payload: {
                            userId: this.userId,
                            x: this.x,
                            y: this.y
                        }
                    }, this, spaceId)

                    break;

                case "move":
                    const moveX = parsedData.payload.x;
                    const moveY = parsedData.payload.y;
                    const xDisplacement = Math.abs(this.x - moveX);
                    const yDisplacement = Math.abs(this.y - moveY);

                    if((xDisplacement === 1 && yDisplacement === 0) || (xDisplacement === 0 && yDisplacement === 1) ) {
                        this.x += xDisplacement;
                        this.y += yDisplacement;

                        RoomManager.getInstance().broadcast({
                            type: "move",
                            payload: {
                                x: moveX,
                                y: moveY
                            }
                        }, this, this.spaceId!)
                        return;
                    }

                    this.send({
                        type: "movement-rejected",
                        payload: {
                            x: this.x,
                            y: this.y,
                        }
                    })

                    break;

                default: 
            }

        })
    }

    send(payload: OutgoingMessage) {
        this.ws.send(JSON.stringify(payload));
    }
}