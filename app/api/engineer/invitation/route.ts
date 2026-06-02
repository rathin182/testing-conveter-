import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEngineer } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await getEngineer(true);
    if (error || !user?.engineerProfile) {
      return NextResponse.json({ success: false, message: error || "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status") as any;

    const invitations = await prisma.projectInvitation.findMany({
      where: {
        engineerId: user.engineerProfile.id,
        status: statusFilter ? statusFilter : { not: "PENDING_ADMIN" }
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            description: true,
            budget: true,
            instruments: true,
            createdAt: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const sanitizedInvitations = invitations.map(inv => ({
      ...inv,
      project: {
        ...inv.project,
        budget: undefined,
        earnings: inv.project.budget * 0.7,
      }
    }));

    return NextResponse.json({ success: true, invitations: sanitizedInvitations }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

