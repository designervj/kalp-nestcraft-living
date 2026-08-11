const { MongoClient } = require("mongodb");
const TARGET_URI = "mongodb://kalp:ZsKzXgsNTo-1zhTTCfQLD0A_prY9Iyw1@103.80.161.222:27017/kp_test_tenant?authSource=kalpzero_enterprise&directConnection=true";
async function run() {
  const client = new MongoClient(TARGET_URI);
  try {
    await client.connect();
    const db = client.db("kp_nestcraft");
    console.log("products:", await db.collection("products").countDocuments());
    console.log("categories:", await db.collection("categories").countDocuments());
    console.log("media:", await db.collection("media").countDocuments());
  } finally {
    await client.close();
  }
}
run();
