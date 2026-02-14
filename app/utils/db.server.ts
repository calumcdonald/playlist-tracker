import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

declare global {
  var __db__: PrismaClient;
}

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL,
});

// This prevents multiple instances of Prisma Client in development
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({ adapter });
} else {
  if (!global.__db__) {
    global.__db__ = new PrismaClient({ adapter });
  }
  prisma = global.__db__;
  prisma.$connect();
}

export { prisma };
