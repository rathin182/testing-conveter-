import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClient } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]) 
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ ticketId: string }> }) {
  try {
    const { user, error } = await getClient();
    if (error || !user?.clientProfile) {
      return NextResponse.json({ success: false, message: error || "Unauthorized" }, { status: 401 });
    }

    const { ticketId } = await params;
    const body = await req.json();
    
    const validation = updateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 });
    }

    const existingTicket = await prisma.ticket.findFirst({
      where: { 
        id: ticketId,
        target: "CLIENT",
        project: { clientId: user.clientProfile.id }
      }
    });

    if (!existingTicket) {
      return NextResponse.json({ success: false, message: "Ticket not found or access denied" }, { status: 404 });
    }

    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: validation.data.status }
    });

    return NextResponse.json({ success: true, message: "Ticket status updated" }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}