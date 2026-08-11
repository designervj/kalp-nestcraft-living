const { MongoClient } = require("mongodb");
const TARGET_URI = "mongodb://kalp:ZsKzXgsNTo-1zhTTCfQLD0A_prY9Iyw1@103.80.161.222:27017/kp_test_tenant?authSource=kalpzero_enterprise&directConnection=true";
async function run() {
  const client = new MongoClient(TARGET_URI);
  try {
    await client.connect();
    const db = client.db("kp_nestcraft");
    const pages = await db.collection("pages").find({ slug: "home" }).toArray();
    console.log(JSON.stringify(pages, null, 2));
  } finally {
    await client.close();
  }
}
run();
