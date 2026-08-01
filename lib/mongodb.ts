import { MongoClient, ServerApiVersion } from "mongodb";

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

const globalWithMongo = globalThis as typeof globalThis & {
  _mongoClientPromiseV2?: Promise<MongoClient>;
};

let productionClientPromise: Promise<MongoClient> | undefined;

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
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

function createConnection(): Promise<MongoClient> {
  const client = new MongoClient(getMongoUri(), options);
  return client.connect();
}

export function getMongoClient(): Promise<MongoClient> {
  if (process.env.NODE_ENV === "development") {
    if (!globalWithMongo._mongoClientPromiseV2) {
      globalWithMongo._mongoClientPromiseV2 = createConnection().catch(
        (error) => {
          globalWithMongo._mongoClientPromiseV2 = undefined;
          throw error;
        },
      );
    }
    return globalWithMongo._mongoClientPromiseV2;
  }

  if (!productionClientPromise) {
    productionClientPromise = createConnection().catch((error) => {
      productionClientPromise = undefined;
      throw error;
    });
  }
  return productionClientPromise;
}
