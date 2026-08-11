const { MongoClient } = require("mongodb");

const SOURCE_URI = "mongodb+srv://deepakr_db_user:4oYOhDfezDMn2jCN@kalpcluster.mr8bacs.mongodb.net/";
const TARGET_URI = "mongodb://kalp:ZsKzXgsNTo-1zhTTCfQLD0A_prY9Iyw1@103.80.161.222:27017/kp_test_tenant?authSource=kalpzero_enterprise&directConnection=true";

async function run() {
  const sourceClient = new MongoClient(SOURCE_URI);
  const targetClient = new MongoClient(TARGET_URI);

  try {
    await sourceClient.connect();
    await targetClient.connect();

    const sourceDb = sourceClient.db("kalp_tenant_furni");
    const targetDb = targetClient.db("kp_nestcraft");

    const sourcePages = await sourceDb.collection("pages").find({}).toArray();
    console.log(`Found ${sourcePages.length} pages in source DB.`);
    
    // Upsert into target DB
    let updated = 0;
    let inserted = 0;
    for (const page of sourcePages) {
      if (!page.slug) {
        if (page.document_key) page.slug = page.document_key; // fallback
      }
      const filter = { slug: page.slug };
      const updateDoc = {
        $set: { ...page }
      };
      // Important: don't overwrite _id if it's already there
      delete updateDoc.$set._id;
      
      const res = await targetDb.collection("pages").updateOne(filter, updateDoc, { upsert: true });
      if (res.upsertedCount > 0) inserted++;
      else updated++;
    }
    
    console.log(`Finished. Inserted: ${inserted}, Updated: ${updated}`);
    
  } catch (err) {
    console.error(err);
  } finally {
    await sourceClient.close();
    await targetClient.close();
  }
}
run();
