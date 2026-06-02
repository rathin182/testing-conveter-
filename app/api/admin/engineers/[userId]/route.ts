import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { engineerApprovalTemplate, engineerRejectionTemplate } from "@/lib/templates";
import sendEmail from "@/lib/email";

const statusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "PENDING"]),
  subject: z.string(),
  customMessage: z.string(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const body = await req.json();

    const validation = statusSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, message: "Invalid input" }, { status: 400 });
    }

    const { status, subject, customMessage } = validation.data;

    const updatedEngineer = await prisma.engineerProfile.update({
      where: { userId: userId }, 
      data: { 
        status, 
        rejectionReason: status === "REJECTED" ? customMessage : null 
      },
      include: { user: { select: { email: true, name: true } } }
    });

    if (status !== "PENDING"){
      const emailHtml = status === "APPROVED" 
      ? engineerApprovalTemplate(updatedEngineer.user.name || "Engineer", customMessage) 
      : engineerRejectionTemplate(updatedEngineer.user.name || "Engineer", customMessage);

       await sendEmail(updatedEngineer.user.email, subject, emailHtml);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}