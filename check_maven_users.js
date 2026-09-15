const { MongoClient } = require('mongodb');

async function check() {
  const uri = 'mongodb+srv://deepakr_db_user:4oYOhDfezDMn2jCN@kalpcluster.mr8bacs.mongodb.net/';
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('kalpzero_enterprise');
    
    console.log("All Tenants:");
    const tenants = await db.collection('tenants').find({}).toArray();
    tenants.forEach(t => {
      console.log(`Tenant Slug: ${t.slug}, DB Name: ${t.databaseName}, ID: ${t._id}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}
check();
