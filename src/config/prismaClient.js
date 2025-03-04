import  prisma  from '@prisma/client';

const prismaClient = new prisma.PrismaClient();

export const initDb = async () => {
    try {
        await prismaClient.$connect();
        console.log("Database connected successfully");
    } catch (err) {
        console.log("Database connection failed", err);
    }
}

export default prismaClient;
