import dns from "dns";
import mongoose from "mongoose";

try {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
} catch {
  /* ignore */
}

let cached: typeof mongoose | null = null;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached) return cached;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is missing");

  try {
    cached = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 12000,
      family: 4,
    });
    console.log("[DB] Connected to MongoDB Atlas");
    return cached;
  } catch (atlasError) {
    console.error("[DB] Atlas failed:", (atlasError as Error).message);

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect().catch(() => undefined);
    }

    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const fs = await import("fs");
    const path = await import("path");
    const dbPath = path.join(process.cwd(), ".data", "mongo");
    fs.mkdirSync(dbPath, { recursive: true });

    const mongod = await MongoMemoryServer.create({
      instance: {
        dbName: "payment_entry",
        dbPath,
        storageEngine: "wiredTiger",
      },
    });

    const localUri = mongod.getUri("payment_entry");
    cached = await mongoose.connect(localUri, { family: 4 });
    console.warn("[DB] Using local MongoDB fallback so auth keeps working");
    return cached;
  }
}
