import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClient } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await getClient();
    if (error || !user) {
      return NextResponse.json({ success: false, message: error || "Unauthorized" }, { status: 401 });
    }

    const { razorpay_order_id } = await req.json();

    if (!razorpay_order_id) {
      return NextResponse.json({ success: false, message: "Order ID required" }, { status: 400 });
    }

    await prisma.transaction.updateMany({
      where: { 
        razorpayOrderId: razorpay_order_id,
        userId: user.id,
        status: "PENDING"
      },
      data: { status: "FAILED" }
    });

    return NextResponse.json({ success: true, message: "Transaction marked as failed" }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}