// src/lib/mongo.ts
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI ?? ""; // ← לא זורקים שגיאה כאן

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function connect(): Promise<MongoClient> {
  if (!uri) {
    return Promise.reject(new Error("Missing MONGODB_URI"));
  }
  const client = new MongoClient(uri);
  return client.connect();
}

const mongoPromise: Promise<MongoClient> =
  global._mongoClientPromise ?? (global._mongoClientPromise = connect());

export default mongoPromise;

export async function getDb(name?: string) {
  const c = await mongoPromise; // אם אין MONGODB_URI – כאן תתקבל שגיאה ברורה בזמן ריצה, לא בזמן build
  return name ? c.db(name) : c.db();
}
