import { NextRequest, NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getConfiguredDatabaseName } from "@/lib/database-authority";

//get all pages
export async function GET(req: NextRequest) {
    try {
        const databaseName = getConfiguredDatabaseName();
        const client = await getMongoClient();
        const db = client.db(databaseName);
        const pages = await db.collection("comments").find({}).toArray();
        return NextResponse.json({ success: true, pages });
    } catch (error) {
        console.error("Error fetching pages:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch pages" }, { status: 500 });
    }
}

// post comments
export async function POST(req: NextRequest) {
    try {
        const databaseName = getConfiguredDatabaseName();
        const client = await getMongoClient();
        const db = client.db(databaseName);
        const comment = await req.json();
        const result = await db.collection("comments").insertOne(comment);
        console.log("result", result)
        const adddedComment = await db.collection("comments").findOne({ _id: result.insertedId });
        return NextResponse.json({ success: true, comment: adddedComment });
    } catch (error) {
        console.error("Error creating comment:", error);
        return NextResponse.json({ success: false, error: "Failed to create comment" }, { status: 500 });
    }
}

// update comments
export async function PUT(req: NextRequest) {
    try {
        const databaseName = getConfiguredDatabaseName();
        const client = await getMongoClient();
        const db = client.db(databaseName);
        const comment = await req.json();

        const { _id, ...updateData } = comment;

        if (!_id) {
            return NextResponse.json({ success: false, error: "Comment ID is required" }, { status: 400 });
        }

        const result = await db.collection("comments").updateOne(
            { _id: new ObjectId(_id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ success: false, error: "Comment not found" }, { status: 404 });
        }

        const updatedComment = await db.collection("comments").findOne({ _id: new ObjectId(_id) });
        return NextResponse.json({ success: true, comment: updatedComment });
    } catch (error) {
        console.error("Error updating comment:", error);
        return NextResponse.json({ success: false, error: "Failed to update comment" }, { status: 500 });
    }
}

// delete comments
export async function DELETE(req: NextRequest) {
    try {
        const databaseName = getConfiguredDatabaseName();
        const client = await getMongoClient();
        const db = client.db(databaseName);
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ success: false, error: "Comment ID is required" }, { status: 400 });
        }

        const result = await db.collection("comments").deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ success: false, error: "Comment not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, deletedId: id });
    } catch (error) {
        console.error("Error deleting comment:", error);
        return NextResponse.json({ success: false, error: "Failed to delete comment" }, { status: 500 });
    }
}
