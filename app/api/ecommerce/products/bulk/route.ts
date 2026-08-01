// import { NextResponse } from "next/server";
// import { getProductModel, getVariantModel, getCategoryModel, getAttributeSetModel } from "@/models";
// import { authenticateAdmin } from "@/lib/auth";

// export async function POST(req: Request) {
//   const auth = await authenticateAdmin();
//   if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   try {
//     const productsPayload = await req.json();

//     if (!Array.isArray(productsPayload)) {
//       return NextResponse.json({ error: "Payload must be an array of products" }, { status: 400 });
//     }

//     const Category = await getCategoryModel();
//     const AttributeSet = await getAttributeSetModel();
//     const Product = await getProductModel();
//     const Variant = await getVariantModel();

//     // 1. Fetch all reference data for in-memory validation
//     const [allCategories, allAttrSets] = await Promise.all([
//       Category.find({}).toArray(),
//       AttributeSet.find({ appliesTo: 'product' }).toArray()
//     ]);

//     const validCategorySlugs = new Set(allCategories.map(c => c.slug));
//     const validCategoryNamesMap = new Map();
//     allCategories.forEach(c => validCategoryNamesMap.set(c.name.toLowerCase(), c.slug));

//     const validOptionLabels = new Set();
//     allAttrSets.forEach(s => {
//       if (s.attributes && Array.isArray(s.attributes)) {
//         s.attributes.forEach((a: any) => validOptionLabels.add(a.name));
//       }
//     });

//     // 2. Perform Pre-Import Validation
//     const missingCategoryIds = new Set<string>();
//     const missingCategoryNames = new Set<string>();
//     const missingOptions = new Set<string>();

//     productsPayload.forEach(p => {
//       if (p.categoryIds && Array.isArray(p.categoryIds)) {
//         p.categoryIds.forEach((slug: string) => {
//           if (!validCategorySlugs.has(slug)) missingCategoryIds.add(slug);
//         });
//       }
//       if (p.categories && Array.isArray(p.categories)) {
//         p.categories.forEach((name: string) => {
//           if (!validCategoryNamesMap.has(name.toLowerCase())) missingCategoryNames.add(name);
//         });
//       }
//       if (p.options && Array.isArray(p.options)) {
//         p.options.forEach((opt: any) => {
//           if (!validOptionLabels.has(opt.label)) missingOptions.add(opt.label);
//         });
//       }
//     });

//     if (missingCategoryIds.size > 0 || missingCategoryNames.size > 0 || missingOptions.size > 0) {
//       return NextResponse.json({
//         error: "Pre-import validation failed",
//         details: {
//           missingCategoryIds: Array.from(missingCategoryIds),
//           missingCategoryNames: Array.from(missingCategoryNames),
//           missingOptions: Array.from(missingOptions)
//         },
//         message: "Some categories or product options are not defined in the system."
//       }, { status: 400 });
//     }

//     // 3. Transform and Insert
//     let totalInsertedProducts = 0;
//     let totalInsertedVariants = 0;

//     for (const p of productsPayload) {
//       if (!p.name || !p.sku) continue;

//       // Resolve category slugs
//       const resolvedSlugs = new Set<string>(p.categoryIds || []);
//       if (p.categories && Array.isArray(p.categories)) {
//         p.categories.forEach((name: string) => {
//           const slug = validCategoryNamesMap.get(name.toLowerCase());
//           if (slug) resolvedSlugs.add(slug);
//         });
//       }

//       // Format gallery
//       let gallery = p.gallery || [];
//       if (p.images && Array.isArray(p.images) && gallery.length === 0) {
//         gallery = p.images.map((url: string, index: number) => ({ url, order: index }));
//       }

//       const productDoc = {
//         name: p.name,
//         sku: p.sku,
//         slug: p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
//         type: p.type || 'physical',
//         price: p.price || 0,
//         compareAtPrice: p.compareAtPrice,
//         description: p.description || '',
//         status: p.status || 'draft',
//         categoryIds: Array.from(resolvedSlugs),
//         businessType: p.businessType || [],
//         gallery,
//         options: p.options || [],
//         createdAt: new Date(),
//         updatedAt: new Date()
//       };

//       try {
//          const pResult = await Product.insertOne(productDoc);
//          totalInsertedProducts++;

//          if (p.variants && Array.isArray(p.variants) && p.variants.length > 0) {
//             const variantsToInsert = p.variants.map((v: any) => ({
//               productId: pResult.insertedId,
//               sku: v.sku,
//               title: v.title,
//               price: v.price !== undefined ? v.price : productDoc.price,
//               stock: v.stock || 0,
//               optionValues: v.optionValues || {},
//               createdAt: new Date(),
//               updatedAt: new Date()
//             }));

//             await Variant.insertMany(variantsToInsert);
//             totalInsertedVariants += variantsToInsert.length;
//          }
//       } catch (e: any) {
//          console.error(`Skipped inserting product ${p.name}: ${e.message}`);
//       }
//     }

//     return NextResponse.json({
//       success: true,
//       message: "Bulk import completed",
//       productsImported: totalInsertedProducts,
//       variantsImported: totalInsertedVariants
//     });

//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

import { connectTenantDB } from "@/lib/db";
import { authorizeCommerceAdmin } from "@/lib/commerce-admin";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const authorization = await authorizeCommerceAdmin();
  if (!authorization.authorized) return authorization.response;

  try {
    const db = await connectTenantDB();
    const productColl = db.collection("products");
    const attributeSetColl = db.collection("attribute_sets");
    const body = await request.json();

    const newProductArray: any[] = [];

    for (let product of body) {
      const variants = product.variants;
      delete product.variants;
      const attributeSetIds = await attributeSetColl
        .find({
          key: { $in: product.attributeSetIds },
        })
        .toArray();

      const mappedAttributes = attributeSetIds
        .map((attrset: any) => {
          return attrset.attributes.map((d: any) => {
            return {
              ...d,
              attributeSetId: attrset.key,
            };
          });
        })
        .flat();

      const options = product.options.map((option: any) => {
        const singleOption = mappedAttributes.find(
          (opt: any) => opt.key === option.key,
        );

        return {
          attributeSetId: singleOption?.attributeSetId,
          values:
            singleOption && singleOption.options
              ? singleOption.options
              : option.values,
          selectedValues: option.values,
          useForVariants: option.useForVariants,
          label: option?.label,
          key: option.key,
        };
      });

      const result = await productColl.insertOne({
        ...product,
        options,
        createdAt: new Date(),
      });
      const variantWithId = variants.map((variant: any) => ({
        ...variant,
        productId: result.insertedId,
        _id: new ObjectId(),
        createdAt: new Date(),
      }));
      const variantColl = db.collection("variants");
      await variantColl.insertMany(variantWithId);

      newProductArray.push({
        ...product,
        _id: result.insertedId,
        variants: variantWithId,
      });
    }
    return NextResponse.json(
      {
        message: "Product created successfully",
        data: newProductArray,
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message, status: 500 },
      { status: 500 },
    );
  }
}
