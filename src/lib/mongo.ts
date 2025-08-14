// src/lib/mongo.ts
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
if (!uri) throw new Error("Missing MONGODB_URI");

// שומר חיבור יחיד גם בזמן HMR
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const client = new MongoClient(uri);

const mongoPromise: Promise<MongoClient> =
  global._mongoClientPromise ?? (global._mongoClientPromise = client.connect());

export default mongoPromise;

// עוזר נוח להביא DB לשימוש ב־API/Actions
export async function getDb(name?: string) {
  const c = await mongoPromise;
  return name ? c.db(name) : c.db();
}
