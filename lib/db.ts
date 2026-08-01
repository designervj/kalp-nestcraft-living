import { MongoClient, Db } from "mongodb";
import { getConfiguredDatabaseName } from "@/lib/database-authority";

interface MongoClientCache {
  conn: MongoClient | null;
  promise: Promise<MongoClient> | null;
}

type MongoClientProvider = () => Promise<Pick<MongoClient, "db">>;

const globalWithMongo = globalThis as typeof globalThis & {
  mongoClient?: MongoClientCache;
};

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env",
    );
  }

  // Preserve the existing direct-host fallback for this Atlas cluster.
  if (
    uri.startsWith("mongodb+srv://") &&
    uri.includes("@kalpcluster.mr8bacs.mongodb.net")
  ) {
    return uri
      .replace(
        "@kalpcluster.mr8bacs.mongodb.net/",
        "@ac-zxbieql-shard-00-00.mr8bacs.mongodb.net:27017,ac-zxbieql-shard-00-01.mr8bacs.mongodb.net:27017,ac-zxbieql-shard-00-02.mr8bacs.mongodb.net:27017/?ssl=true&replicaSet=atlas-vw7phq-shard-0&authSource=admin&retryWrites=true&w=majority",
      )
      .replace("mongodb+srv://", "mongodb://");
  }

  return uri;
}

function getClientCache(): MongoClientCache {
  if (!globalWithMongo.mongoClient) {
    globalWithMongo.mongoClient = { conn: null, promise: null };
  }
  return globalWithMongo.mongoClient;
}

export async function connectClient(): Promise<MongoClient> {
  const cache = getClientCache();
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = MongoClient.connect(getMongoUri());
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null;
    throw error;
  }

  return cache.conn;
}

export async function connectMasterDB(
  getClient: MongoClientProvider = connectClient,
): Promise<Db> {
  const databaseName = getConfiguredDatabaseName();
  const client = await getClient();
  return client.db(databaseName);
}

export async function connectTenantDB(
  getClient: MongoClientProvider = connectClient,
): Promise<Db> {
  const databaseName = getConfiguredDatabaseName();
  const client = await getClient();
  return client.db(databaseName);
}
