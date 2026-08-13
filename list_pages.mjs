import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
await client.connect();

const db = client.db('kp_test_tenant');
const pages = await db.collection('site_pages').find({}).toArray();
console.log("Pages in DB:", pages.map(p => ({ slug: p.slug, id: p._id })));

await client.close();
