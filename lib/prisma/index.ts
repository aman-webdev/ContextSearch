import { PrismaClient } from "../generated/prisma"

const initPrismaClient = () => {
    return new PrismaClient()
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof initPrismaClient>;
} & typeof global;


const prisma : PrismaClient = globalThis.prismaGlobal ?? initPrismaClient();

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;

export default prisma