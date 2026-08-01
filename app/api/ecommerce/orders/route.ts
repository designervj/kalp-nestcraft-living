import { NextResponse } from "next/server";
import { getOrderModel } from "@/models";
import { authenticateAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  const auth = await authenticateAdmin();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status");

  const query: any = {};
  if (status) query.status = status;

  try {
    const Order = await getOrderModel();
    const orders = await Order.find(query).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
