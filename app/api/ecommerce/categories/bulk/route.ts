import { NextResponse } from "next/server";
import { connectTenantDB } from "@/lib/db";
import { authorizeCommerceAdmin } from "@/lib/commerce-admin";

export async function POST(req: Request) {
  const authorization = await authorizeCommerceAdmin();
  if (!authorization.authorized) return authorization.response;

  try {
    const categoriesPayload = await req.json();

    if (!Array.isArray(categoriesPayload)) {
      return NextResponse.json({ error: "Payload must be an array of categories" }, { status: 400 });
    }

    const db = await connectTenantDB();
    const categoryColl = db.collection("categories");

    let totalInserted = 0;
    let totalSkipped = 0;

    for (const cat of categoriesPayload) {
      if (!cat.name) {
        totalSkipped++;
        continue;
      }

      const slug = cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      // Check if slug already exists
      const existing = await categoryColl.findOne({ slug });
      if (existing) {
        totalSkipped++;
        continue;
      }

      const categoryDoc = {
        ...cat,
        slug,
        type: cat.type || 'product',
        parentId: cat.parentId || null,
        description: cat.description || '',
        pageStatus: cat.pageStatus || 'draft',
        bannerImageUrl: cat.bannerImageUrl || '',
        metaTitle: cat.metaTitle || '',
        metaDescription: cat.metaDescription || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      try {
        await categoryColl.insertOne(categoryDoc);
        totalInserted++;
      } catch (e) {
        totalSkipped++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import completed: ${totalInserted} imported, ${totalSkipped} skipped`,
      insertedCount: totalInserted,
      skippedCount: totalSkipped
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
