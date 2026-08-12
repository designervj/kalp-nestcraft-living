const { MongoClient } = require("mongodb");
const TARGET_URI = "mongodb://kalp:ZsKzXgsNTo-1zhTTCfQLD0A_prY9Iyw1@103.80.161.222:27017/kp_test_tenant?authSource=kalpzero_enterprise&directConnection=true";
async function run() {
  const client = new MongoClient(TARGET_URI);
  try {
    await client.connect();
    const doc = await client.db("kp_nestcraft").collection("pages").findOne({ slug: "home", "content.adminTitle": "Newsletter Section" });
    if (!doc) return console.log("Not found");
    const section = doc.content.find(s => s.adminTitle === "Newsletter Section");
    console.log(JSON.stringify(section.props.form, null, 2));
  } finally {
    await client.close();
  }
}
run();
