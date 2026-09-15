import { NextRequest, NextResponse } from "next/server";
import { getPageModel } from "@/models";

export const dynamic = "force-dynamic";

// GET all pages
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const slug = searchParams.get("slug");
    const PageModel = await getPageModel();

    if (slug) {
      const page = await PageModel.findOne({ slug });
      return NextResponse.json(page, { headers: { "Cache-Control": "no-store" } });
    }

    const pages = await PageModel.find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ success: true, pages }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Error fetching pages:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch pages" }, { status: 500 });
  }
}

// POST create a new page
export async function POST(req: NextRequest) {
  try {
    const { title, slug, content, metaTitle, metaDescription, isPublished } = await req.json();

    if (!title || !slug) {
      return NextResponse.json({ success: false, message: "Title and slug are required" }, { status: 400 });
    }

    const PageModel = await getPageModel();

    // Check slug uniqueness
    const existingPage = await PageModel.findOne({ slug });
    if (existingPage) {
      return NextResponse.json({ success: false, message: "A page with this slug already exists" }, { status: 400 });
    }

    const now = new Date();
    const newPage = {
      title,
      slug,
      content: content || [],
      metaTitle,
      metaDescription,
      isPublished: isPublished ?? false,
      createdAt: now,
      updatedAt: now,
    };

    const result = await PageModel.insertOne(newPage);

    return NextResponse.json({
      success: true,
      page: { ...newPage, _id: result.insertedId }
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating page:", error);
    return NextResponse.json({ success: false, error: "Failed to create page" }, { status: 500 });
  }
}
