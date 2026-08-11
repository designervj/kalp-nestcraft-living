const { MongoClient } = require("mongodb");
const TARGET_URI = "mongodb://kalp:ZsKzXgsNTo-1zhTTCfQLD0A_prY9Iyw1@103.80.161.222:27017/kp_test_tenant?authSource=kalpzero_enterprise&directConnection=true";
async function run() {
  const client = new MongoClient(TARGET_URI);
  try {
    await client.connect();
    const pages = await client.db("kp_nestcraft").collection("pages").find({ slug: "home" }).toArray();
    console.log("Number of documents with slug 'home':", pages.length);
    pages.forEach((p, i) => {
      console.log(`Doc ${i}: id=${p._id}, adminTitle=${p.content && p.content[0] ? p.content[0].adminTitle : "N/A"}, type=${p.content && p.content[0] ? p.content[0].type : "N/A"}`);
    });
  } finally {
    await client.close();
  }
}
run();
