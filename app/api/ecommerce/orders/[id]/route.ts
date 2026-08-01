import { NextResponse } from "next/server";
import { getOrderModel } from "@/models";
import { authenticateAdmin } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await authenticateAdmin();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const Order = await getOrderModel();

    const order = await Order.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: {
          ...((body.status !== undefined) && { status: body.status }),
          ...((body.notes !== undefined) && { notes: body.notes }),
          ...((body.shippingAddress !== undefined) && { shippingAddress: body.shippingAddress }),
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Order updated", order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
