import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

import { connectTenantDB } from "@/lib/db";

const TARGET = "publishing/page-reviews/comments";
const COLLECTION = "page_review_comments";

type CommentDocument = {
  _id?: ObjectId | string;
  pageSlug: string;
  slug: string;
  pageId?: string | null;
  selector: string;
  offsetX: number;
  offsetY: number;
  content: string;
  status: "open" | "pending" | "done";
  screenSize: "mobile" | "tablet" | "desktop" | "all";
  createdAt?: Date;
  updatedAt?: Date;
};

function serializeComment(comment: CommentDocument) {
  return {
    ...comment,
    _id: String(comment._id),
    id: String(comment._id),
    createdAt: comment.createdAt?.toISOString?.() ?? comment.createdAt,
    updatedAt: comment.updatedAt?.toISOString?.() ?? comment.updatedAt,
  };
}

function commentIdFilter(id: string) {
  return ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
}

function hasAuthCookie(request: NextRequest) {
  return request.cookies
    .getAll()
    .some((cookie) => (
      cookie.name === "kalp_session" ||
      cookie.name === "auth_token" ||
      cookie.name === "admin_token" ||
      cookie.name.startsWith("auth_token_")
    ) && cookie.value);
}

function unauthorized() {
  return NextResponse.json(
    { success: false, detail: "Authentication required." },
    { status: 401 },
  );
}

export async function GET(request: NextRequest) {
  if (!hasAuthCookie(request)) return unauthorized();

  const slug = request.nextUrl.searchParams.get("slug");
  const db = await connectTenantDB();
  const filter = slug ? { pageSlug: slug } : {};
  const comments = await db
    .collection<CommentDocument>(COLLECTION)
    .find(filter)
    .sort({ createdAt: 1 })
    .toArray();

  return NextResponse.json({
    success: true,
    pages: comments.map(serializeComment),
    target: TARGET,
  });
}

export async function POST(request: NextRequest) {
  if (!hasAuthCookie(request)) return unauthorized();

  const body = await request.json();
  const pageSlug = body.pageSlug || body.slug;

  if (!pageSlug || !body.selector || body.offsetX === undefined || body.offsetY === undefined || !body.content) {
    return NextResponse.json(
      { success: false, detail: "Missing required comment fields." },
      { status: 422 },
    );
  }

  const now = new Date();
  const comment: CommentDocument = {
    pageSlug,
    slug: pageSlug,
    pageId: body.pageId || null,
    selector: body.selector,
    offsetX: Number(body.offsetX),
    offsetY: Number(body.offsetY),
    content: String(body.content).trim(),
    status: body.status || "open",
    screenSize: body.screenSize || "all",
    createdAt: now,
    updatedAt: now,
  };

  const db = await connectTenantDB();
  const result = await db.collection<CommentDocument>(COLLECTION).insertOne(comment);

  return NextResponse.json(
    { success: true, comment: serializeComment({ ...comment, _id: result.insertedId }) },
    { status: 201 },
  );
}

export async function PUT(request: NextRequest) {
  if (!hasAuthCookie(request)) return unauthorized();

  const body = await request.json();
  const id = body.id || body._id;
  if (!id) {
    return NextResponse.json(
      { success: false, detail: "Comment id is required." },
      { status: 422 },
    );
  }

  const update: Partial<CommentDocument> = {
    updatedAt: new Date(),
  };

  if (body.selector !== undefined) update.selector = body.selector;
  if (body.offsetX !== undefined) update.offsetX = Number(body.offsetX);
  if (body.offsetY !== undefined) update.offsetY = Number(body.offsetY);
  if (body.content !== undefined) update.content = String(body.content).trim();
  if (body.status !== undefined) update.status = body.status;
  if (body.screenSize !== undefined) update.screenSize = body.screenSize;

  const db = await connectTenantDB();
  const result = await db.collection<CommentDocument>(COLLECTION).findOneAndUpdate(
    commentIdFilter(id),
    { $set: update },
    { returnDocument: "after" },
  );

  if (!result) {
    return NextResponse.json(
      { success: false, detail: "Comment not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, comment: serializeComment(result) });
}

export async function DELETE(request: NextRequest) {
  if (!hasAuthCookie(request)) return unauthorized();

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { success: false, detail: "Comment id is required." },
      { status: 422 },
    );
  }

  const db = await connectTenantDB();
  await db.collection<CommentDocument>(COLLECTION).deleteOne(commentIdFilter(id));

  return NextResponse.json({ success: true, id });
}
