import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

function createPrismaClient() {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("Missing DATABASE_URL for Prisma connection");
  }
  let connectionString = raw;
  try {
    const u = new URL(raw);
    const host = (u.hostname || "").toLowerCase();
    const sslmode = (u.searchParams.get("sslmode") || "").toLowerCase();
    if (sslmode && /^(prefer|require|verify-ca)$/.test(sslmode)) {
      if (host && host !== "localhost" && host !== "127.0.0.1") {
        u.searchParams.set("sslmode", "verify-full");
        connectionString = u.toString();
      }
    }
  } catch {}
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export default prisma;
