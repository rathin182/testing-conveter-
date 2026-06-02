import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { error } = await getAdmin();
    if (error) {
      return NextResponse.json({ success: false, message: error }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");

    const queryOptions: any = {
        orderBy: { createdAt: "desc" },
        where: { target: "PLATFORM" },
        include: { 
            project: { select: {
                title: true,
                status: true,
                client: { select: { user: { select: { name: true, email: true } } } },
                engineer: { select: { user: { select: { name: true, email: true } } } }
            }},
            raisedBy: { select: { name: true, email: true, role: true } }
        }
    };

    if (statusFilter && ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].includes(statusFilter)) {
      queryOptions.where = { status: statusFilter };
    }

    const tickets = await prisma.ticket.findMany(queryOptions);

    return NextResponse.json({ success: true, tickets }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}