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

    const collections = await sourceDb.listCollections().toArray();
    for (const col of collections) {
      const colName = col.name;
      // Skip users/invoices/orders etc if we only want content data, but let's copy everything since "full data"
      console.log(`Copying collection: ${colName}`);
      const docs = await sourceDb.collection(colName).find({}).toArray();
      
      let inserted = 0;
      let updated = 0;
      for (const doc of docs) {
        let filter = { _id: doc._id };
        const updateDoc = { $set: { ...doc } };
        delete updateDoc.$set._id; // can't update _id
        
        try {
          const res = await targetDb.collection(colName).updateOne(filter, updateDoc, { upsert: true });
          if (res.upsertedCount > 0) inserted++;
          else updated++;
        } catch (e) {
          console.error(`Failed to upsert doc in ${colName}:`, e.message);
        }
      }
      console.log(`  -> Inserted: ${inserted}, Updated: ${updated}`);
    }
    
    console.log(`Finished copying all collections.`);
    
  } catch (err) {
    console.error(err);
  } finally {
    await sourceClient.close();
    await targetClient.close();
  }
}
run();
