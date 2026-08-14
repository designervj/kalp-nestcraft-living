const { MongoClient } = require('mongodb');

async function check() {
  const uri = 'mongodb://kalp:ZsKzXgsNTo-1zhTTCfQLD0A_prY9Iyw1@103.80.161.222:27017/kp_nestcraft?authSource=kalpzero_enterprise&directConnection=true';
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('kp_nestcraft');
    
    const pages = await db.collection('site_pages').countDocuments();
    const products = await db.collection('products').countDocuments();
    console.log(`kp_nestcraft has ${pages} pages and ${products} products`);
    
    const masterDb = client.db('kalpzero_enterprise');
    const tenant = await masterDb.collection('tenants').findOne({ databaseName: 'kp_nestcraft' }) || await masterDb.collection('tenants').findOne({ slug: 'nestcraft' });
    if (tenant) {
      console.log('Found tenant:', tenant._id, tenant.name, tenant.databaseName);
    } else {
      console.log('Tenant not found in master DB');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}
check();
