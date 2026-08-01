import { NextRequest, NextResponse } from "next/server";
import { getProductModel, getVariantModel } from "@/models";
import { authorizeCommerceAdmin } from "@/lib/commerce-admin";
import { ObjectId } from "mongodb";
import { connectTenantDB } from "@/lib/db";
import { isHex } from "@/app/api/ecommerce/categories/util";

// export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
//   const { id } = await params;
//   const auth = await authenticateAdmin();
//   if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   try {
//     const Product = await getProductModel();
//     const Variant = await getVariantModel();
//     const product = await Product.findOne({ _id: new ObjectId(id) });
//     if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

//     const variants = await Variant.find({ productId: product._id }).toArray();
//     return NextResponse.json({ ...product, variants });
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const db = await connectTenantDB();
    const productColl = db.collection("products");

    const matchStage: any = {};
    if (isHex(id)) {
      matchStage._id = new ObjectId(id);
    } else {
      matchStage.slug = id;
    }

    const products = await productColl
      .aggregate([
        {
          $match: matchStage,
        },
        {
          $lookup: {
            from: "variants",
            localField: "_id",
            foreignField: "productId",
            as: "variants",
          },
        },

        // {
        //   $addFields: {
        //     variants: {
        //       $sortArray: {
        //         input: "$variants",
        //         sortBy: { createdAt: -1 },
        //       },
        //     },
        //   },
        // },
      ])
      .toArray();

    if (products.length === 0) {
      return NextResponse.json(
        { message: "No products found", data: null },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Products fetched successfully", data: products[0] },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message, data: null },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authorization = await authorizeCommerceAdmin();
  if (!authorization.authorized) return authorization.response;

  try {
    const { id } = await params;
    const body = await req.json();
    const Product = await getProductModel();
    const Variant = await getVariantModel();

    // Prevent _id from being updated
    delete body._id;

    const product = await Product.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...body, updatedAt: new Date() } },
      { returnDocument: "after" },
    );

    if (!product)
      return NextResponse.json({ error: "Product not found" }, { status: 404 });

    // If variants array is provided, replace entire variant list
    if (body.variants && Array.isArray(body.variants)) {
      await Variant.deleteMany({ productId: product._id });
      for (const v of body.variants) {
        await Variant.insertOne({
          productId: product._id,
          sku: v.sku,
          title: v.title,
          price: v.price || product.price,
          stock: v.stock || 0,
          optionValues: v.optionValues || {},
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Product updated",
      product,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authorization = await authorizeCommerceAdmin();
  if (!authorization.authorized) return authorization.response;

  try {
    const { id } = await params;
    const Product = await getProductModel();
    const Variant = await getVariantModel();

    const result = await Product.findOneAndDelete({ _id: new ObjectId(id) });
    if (!result)
      return NextResponse.json({ error: "Product not found" }, { status: 404 });

    await Variant.deleteMany({ productId: new ObjectId(id) });

    return NextResponse.json({ success: true, message: "Product deleted." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
