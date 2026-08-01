import { NextRequest, NextResponse } from "next/server";
import { getInquiryModel } from "@/models";

// GET all inquiries (for admin)
export async function GET(req: NextRequest) {
  try {
    const InquiryModel = await getInquiryModel();
    const inquiries = await InquiryModel.find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ success: true, inquiries });
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch inquiries" }, { status: 500 });
  }
}

// POST create a new inquiry
export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, message: "Name, email and message are required" }, { status: 400 });
    }

    const InquiryModel = await getInquiryModel();

    const now = new Date();
    const newInquiry = {
      name,
      email,
      subject: subject || "No Subject",
      message,
      status: "unread", // Default status
      createdAt: now,
      updatedAt: now,
    };

    const result = await InquiryModel.insertOne(newInquiry);

    return NextResponse.json({
      success: true,
      inquiry: { ...newInquiry, _id: result.insertedId }
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating inquiry:", error);
    return NextResponse.json({ success: false, error: "Failed to send message" }, { status: 500 });
  }
}
