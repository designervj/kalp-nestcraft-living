import { NextResponse } from "next/server";
import { getVariantModel } from "@/models";
import { authenticateAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  const auth = await authenticateAdmin();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const Variant = await getVariantModel();
    const variants = await Variant.find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json(variants);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
