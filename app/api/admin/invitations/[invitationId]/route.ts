import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/auth";
import sendEmail from "@/lib/email";
import { projectInvitationTemplate } from "@/lib/templates";
import { z } from "zod";

export async function GET(req: NextRequest, { params }: { params: Promise<{ invitationId: string }> }) {
  try {
    const { user, error } = await getAdmin();
    if (error || !user) {
      return NextResponse.json({ success: false, message: error || "Unauthorized" }, { status: 401 });
    }

    const { invitationId } = await params;

    const invitation = await prisma.projectInvitation.findUnique({
      where: { id: invitationId },
      include: {
        project: true,
        engineer: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } }
          }
        }
      }
    });

    if (!invitation) {
      return NextResponse.json({ success: false, message: "Invitation not found" }, { status: 404 });
    }

    const budget = invitation.project.budget;
    const engineerCut = budget * 0.7;
    const platformProfit = budget * 0.3;

    return NextResponse.json({ 
      success: true, 
      invitation: invitation,
      financials: {
        totalBudget: budget,
        engineerCut: engineerCut,
        platformProfit: platformProfit
      }
    }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

const adminActionSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ invitationId: string }> }) {
  try {
    
    const { user, error } = await getAdmin();
    if (error || !user) {
      return NextResponse.json({ success: false, message: error || "Unauthorized" }, { status: 401 });
    }

    const { invitationId } = await params;
    const body = await req.json();
    
    const validation = adminActionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
    }

    const invitation = await prisma.projectInvitation.findUnique({
      where: { id: invitationId },
      include: {
        project: true,
        engineer: { include: { user: true } }
      }
    });

    if (!invitation || invitation.status !== "PENDING_ADMIN") {
      return NextResponse.json({ success: false, message: "Pending invitation not found" }, { status: 404 });
    }

    if (invitation.project.status !== "SEARCHING" || invitation.project.engineerId !== null) {
      return NextResponse.json({ success: false, message: "This project has already been assigned to an engineer" }, { status: 400 });
    }

    if (validation.data.action === "REJECT") {
      await prisma.projectInvitation.update({
        where: { id: invitationId },
        data: { status: "ADMIN_REJECTED" }
      });
      return NextResponse.json({ success: true, message: "Match rejected successfully" }, { status: 200 });
    }

    await prisma.projectInvitation.update({
      where: { id: invitationId },
      data: { status: "SENT" }
    });

    const engineerEarnings = Math.floor(invitation.project.budget * 0.7);

    if (invitation.engineer.user.email) {
      const emailHtml = projectInvitationTemplate(
        invitation.engineer.user.name || "Engineer",
        invitation.project.title,
        invitation.project.description || "No description provided.",
        engineerEarnings
      );

      await sendEmail( invitation.engineer.user.email, `New Project Match: ${invitation.project.title}`, emailHtml );
    }

    return NextResponse.json({ success: true, message: "Invitation sent to engineer successfully" }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}