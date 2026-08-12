const { MongoClient } = require("mongodb");
const SOURCE_URI = "mongodb+srv://deepakr_db_user:4oYOhDfezDMn2jCN@kalpcluster.mr8bacs.mongodb.net/";
async function run() {
  const client = new MongoClient(SOURCE_URI);
  try {
    await client.connect();
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();
    console.log(dbs.databases.map(d => d.name));
  } finally {
    await client.close();
  }
}
run();
