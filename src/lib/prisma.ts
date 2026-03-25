import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

// Proxy to make Prisma truly lazy (doesn't instantiate until property access)
const prisma = new Proxy({} as PrismaClient, {
  get: (target, prop) => {
    if (!globalThis.prismaGlobal) {
      globalThis.prismaGlobal = prismaClientSingleton();
    }
    return (globalThis.prismaGlobal as any)[prop];
  }
});

export default prisma;

if (process.env.NODE_ENV !== "production") {
    // Note: we don't want to instantiate here either
}

