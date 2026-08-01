import { NextResponse } from "next/server";
import { connectTenantDB } from "@/lib/db";
import { authorizeCommerceAdmin } from "@/lib/commerce-admin";

export async function POST(req: Request) {
  const authorization = await authorizeCommerceAdmin();
  if (!authorization.authorized) return authorization.response;

  try {
    const attributesPayload = await req.json();

    if (!Array.isArray(attributesPayload)) {
      return NextResponse.json(
        { error: "Payload must be an array of attribute sets" },
        { status: 400 },
      );
    }

    const db = await connectTenantDB();
    const attributeColl = db.collection("attribute_sets");

    const uploadedAttributes = [];

    let totalInserted = 0;
    let totalSkipped = 0;

    for (const set of attributesPayload) {
      if (!set.name) {
        totalSkipped++;
        continue;
      }

      const key = set.key || set.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      // Check if key already exists
      const existing = await attributeColl.findOne({ key });
      if (existing) {
        totalSkipped++;
        continue;
      }

      const attributeSetDoc = {
        ...set,
        key,
        appliesTo: set.appliesTo || "product",
        contexts: set.contexts || [],
        attributes: set.attributes || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      try {
        const uploaded = await attributeColl.insertOne(attributeSetDoc);
        uploadedAttributes.push({
          ...attributeSetDoc,
          _id: uploaded.insertedId,
        });
        totalInserted++;
      } catch (e) {
        totalSkipped++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import completed: ${totalInserted} imported, ${totalSkipped} skipped`,
      data: uploadedAttributes,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
