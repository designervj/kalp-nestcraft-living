const { MongoClient } = require('mongodb');

async function check() {
  const uri = 'mongodb://kalp:ZsKzXgsNTo-1zhTTCfQLD0A_prY9Iyw1@103.80.161.222:27017/kp_nestcraft?authSource=kalpzero_enterprise&directConnection=true';
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('kp_nestcraft');
    const blueprint = await db.collection('business_blueprints').findOne({});
    console.log(JSON.stringify(blueprint, null, 2));
  } finally {
    await client.close();
  }
}
check().catch(console.error);
