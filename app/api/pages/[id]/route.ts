import { NextRequest, NextResponse } from "next/server";
import { getPageModel } from "@/models";
import { ObjectId } from "mongodb";

// GET a single page by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const PageModel = await getPageModel();
    const page = await PageModel.findOne({ _id: new ObjectId(id) });

    if (!page) {
      return NextResponse.json(
        { success: false, message: "Page not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, page });
  } catch (error) {
    console.error("Error fetching page:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch page" },
      { status: 500 },
    );
  }
}

// PUT update an existing page
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const PageModel = await getPageModel();

    // Check slug uniqueness if it's being updated
    if (body.slug) {
      const existingPage = await PageModel.findOne({
        slug: body.slug,
        _id: { $ne: new ObjectId(id) },
      });
      if (existingPage) {
        return NextResponse.json(
          { success: false, message: "A page with this slug already exists" },
          { status: 400 },
        );
      }
    }

    const { _id, ...updateData } = body;
    updateData.updatedAt = new Date();

    const result = await PageModel.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Page not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Page updated successfully",
    });
  } catch (error) {
    console.error("Error updating page:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update page" },
      { status: 500 },
    );
  }
}

// DELETE a page
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const PageModel = await getPageModel();
    const result = await PageModel.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Page not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Page deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting page:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete page" },
      { status: 500 },
    );
  }
}
