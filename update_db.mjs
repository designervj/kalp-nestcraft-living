import { MongoClient } from "mongodb";
import fs from "fs";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("No MONGODB_URI");

const data = JSON.parse(fs.readFileSync('./data/homepage.json', 'utf8'));

const client = new MongoClient(uri);
await client.connect();
console.log("Connected to MongoDB");

// get tenant db
const db = client.db('kp_test_tenant');
const result = await db.collection('site_pages').updateOne(
  { slug: 'home' },
  { $set: { content: data.content } }
);

console.log("Update result:", result);
await client.close();
