import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config"

const connectionString = process.env.DATABASE_URL;
if(!connectionString || connectionString === "undefined") {
    throw new Error("connection string is required");
}

const adapter = new PrismaPg({ connectionString });
export const prismaClient = new PrismaClient({ adapter });