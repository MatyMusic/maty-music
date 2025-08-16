// src/lib/mongo.ts
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI ?? "";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function connect(): Promise<MongoClient> {
  if (!uri) return Promise.reject(new Error("Missing MONGODB_URI"));
  const client = new MongoClient(uri);
  return client.connect();
}

const mongoPromise: Promise<MongoClient> =
  global._mongoClientPromise ?? (global._mongoClientPromise = connect());

export default mongoPromise;

export async function getDb(name?: string) {
  const client = await mongoPromise; // אם MONGODB_URI חסר — השגיאה תיזרק רק בזמן ריצה
  return name ? client.db(name) : client.db();
}
