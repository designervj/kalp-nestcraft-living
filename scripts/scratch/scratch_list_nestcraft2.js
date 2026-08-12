const { MongoClient } = require("mongodb");
const SOURCE_URI = "mongodb+srv://deepakr_db_user:4oYOhDfezDMn2jCN@kalpcluster.mr8bacs.mongodb.net/";
async function run() {
  const client = new MongoClient(SOURCE_URI);
  try {
    await client.connect();
    const db = client.db("kalp_tenant_nestcraftfurniture");
    const pages = await db.collection("pages").find({}).toArray();
    console.log("Pages count:", pages.length);
    if(pages.length > 0) {
      console.log("First page snippet:", JSON.stringify(pages[0]).substring(0, 500));
    }
  } finally {
    await client.close();
  }
}
run();
