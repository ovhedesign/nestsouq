import clientPromise from "./mongodb.js";

const dbCache = new Map();

export async function getDb(dbName = "nestsouq") {
  if (dbCache.has(dbName)) {
    return dbCache.get(dbName);
  }

  const client = await clientPromise;
  const db = client.db(dbName);

  dbCache.set(dbName, db);
  return db;
}
