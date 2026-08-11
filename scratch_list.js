const { MongoClient } = require("mongodb");
const SOURCE_URI = "mongodb+srv://deepakr_db_user:4oYOhDfezDMn2jCN@kalpcluster.mr8bacs.mongodb.net/";
async function run() {
  const client = new MongoClient(SOURCE_URI);
  try {
    await client.connect();
    const db = client.db("kalp_tenant_furni");
    const cols = await db.listCollections().toArray();
    console.log(cols.map(c => c.name));
  } finally {
    await client.close();
  }
}
run();
