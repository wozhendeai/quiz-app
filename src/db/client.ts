/**
 * Singleton mongodb connector
 */
import { MongoClient, type Db } from "mongodb";
import { ensureIndexes } from "./collections.js";

let client: MongoClient | null = null;
let db: Db | null = null;

/**
 * Starts a connection to mongodb
 */
export async function connectDB(): Promise<Db> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  if (db) {
    return db;
  }

  client = new MongoClient(uri);
  await client.connect();

  db = client.db();
  console.log("Connected to MongoDB");

  await ensureIndexes();

  return db;
}

export function getDb(): Db {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB() first.");
  }
  return db;
}

export async function closeDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log("MongoDB connection closed");
  }
}
