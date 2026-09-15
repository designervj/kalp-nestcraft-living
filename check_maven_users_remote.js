const { MongoClient } = require('mongodb');

async function check() {
  const uri = 'mongodb://kalp:ZsKzXgsNTo-1zhTTCfQLD0A_prY9Iyw1@103.80.161.222:27017/kp_nestcraft?authSource=kalpzero_enterprise&directConnection=true';
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('kp_nestcraft');
    const users = await db.collection('users').find({}).toArray();
    console.log("Users in kp_nestcraft:");
    users.forEach(u => {
        console.log(`Email: ${u.email}, Role: ${u.role}, PasswordHash: ${u.password ? 'Yes' : 'No'}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}
check();
