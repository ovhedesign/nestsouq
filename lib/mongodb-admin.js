import clientPromise from "./mongodb";

let _db;

export async function getDb(dbName) {
  console.log("Connecting to database:", dbName);
  if (_db) {
    return _db;
  }
  const client = await clientPromise;
  _db = client.db(dbName);
  return _db;
}
