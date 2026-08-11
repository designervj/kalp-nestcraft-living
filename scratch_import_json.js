const fs = require("fs");
const { MongoClient } = require("mongodb");
const TARGET_URI = "mongodb://kalp:ZsKzXgsNTo-1zhTTCfQLD0A_prY9Iyw1@103.80.161.222:27017/kp_test_tenant?authSource=kalpzero_enterprise&directConnection=true";

async function run() {
  const client = new MongoClient(TARGET_URI);
  try {
    await client.connect();
    const db = client.db("kp_nestcraft");

    // Homepage
    const homeData = JSON.parse(fs.readFileSync("kalphelp/nestcraft-live/data/homepage.json", "utf8"));
    if (homeData._id) delete homeData._id;
    await db.collection("pages").updateOne({ slug: "home" }, { $set: homeData }, { upsert: true });
    console.log("Upserted homepage");

    // About
    const aboutData = JSON.parse(fs.readFileSync("kalphelp/nestcraft-live/public/about.json", "utf8"));
    if (aboutData._id) delete aboutData._id;
    await db.collection("pages").updateOne({ slug: "about" }, { $set: aboutData }, { upsert: true });
    console.log("Upserted about");

  } finally {
    await client.close();
  }
}
run();
