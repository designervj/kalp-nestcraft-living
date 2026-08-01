// import { NextResponse } from "next/server";
// import { getAttributeSetModel } from "@/models";
// import { authenticateAdmin } from "@/lib/auth";

// export async function GET(req: Request) {
//   const auth = await authenticateAdmin();
//   if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   const url = new URL(req.url);
//   const contextFilters = url.searchParams.get("context");
//   const appliesTo = url.searchParams.get("appliesTo");

//   const query: any = {};
//   if (contextFilters) query.contexts = contextFilters;
//   if (appliesTo) query.appliesTo = appliesTo;

//   try {
//     const AttributeSet = await getAttributeSetModel();
//     const sets = await AttributeSet.find(query).toArray();
//     return NextResponse.json(sets);
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// export async function POST(req: Request) {
//   const auth = await authenticateAdmin();
//   if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   try {
//     const body = await req.json();
//     const AttributeSet = await getAttributeSetModel();

//     if (!body.name || !body.attributes || !Array.isArray(body.attributes)) {
//       return NextResponse.json({ error: "Name and attributes array are required" }, { status: 400 });
//     }

//     const setDoc = {
//       name: body.name,
//       key: body.key || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
//       appliesTo: body.appliesTo || 'product',
//       contexts: body.contexts || [],
//       attributes: body.attributes,
//       createdAt: new Date(),
//       updatedAt: new Date()
//     };

//     const result = await AttributeSet.insertOne(setDoc);

//     return NextResponse.json({ success: true, setId: result.insertedId, key: setDoc.key, message: "Attribute Set created" });
//   } catch (error: any) {
//     if (error.code === 11000) return NextResponse.json({ error: "Conflict: Duplicate key" }, { status: 409 });
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

import { connectTenantDB } from "@/lib/db";
import { authorizeCommerceAdmin } from "@/lib/commerce-admin";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const db = await connectTenantDB();
    const attributeColl = db.collection("attribute_sets");
    const attributes = await attributeColl.find({}).toArray();

    if (attributes.length === 0) {
      return NextResponse.json({ data: [], message: "No attributes found" });
    }

    return NextResponse.json({
      data: attributes,
      message: "Attributes fetched successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch attributes", status: 500 },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  const authorization = await authorizeCommerceAdmin();
  if (!authorization.authorized) return authorization.response;

  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");
    const body = await req.json();

    if (!id) {
      return NextResponse.json(
        { message: "Attribute ID is required" },
        { status: 400 },
      );
    }

    const db = await connectTenantDB();
    const attributeColl = db.collection("attribute_sets");
    const attributes = await attributeColl.updateOne(
      { _id: new ObjectId(id) },
      { $set: body },
    );

    if (attributes.modifiedCount === 0) {
      return NextResponse.json({ data: [], message: "No attributes found" });
    }

    return NextResponse.json({
      data: { ...body, _id: id },
      message: "Attributes updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update attributes", status: 500 },
      { status: 500 },
    );
  }
}
export async function POST(req: NextRequest) {
  const authorization = await authorizeCommerceAdmin();
  if (!authorization.authorized) return authorization.response;

  try {
    const body = await req.json();
    const db = await connectTenantDB();
    const attributeColl = db.collection("attribute_sets");
    const result = await attributeColl.insertOne(body);

    return NextResponse.json({
      data: { ...body, _id: result.insertedId },
      message: "Attribute set created successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to create attribute set", status: 500 },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const authorization = await authorizeCommerceAdmin();
  if (!authorization.authorized) return authorization.response;

  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Attribute ID is required" },
        { status: 400 },
      );
    }

    const db = await connectTenantDB();
    const attributeColl = db.collection("attribute_sets");
    const result = await attributeColl.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "Attribute set not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Attribute set deleted successfully",
      data: id,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete attribute set", status: 500 },
      { status: 500 },
    );
  }
}
