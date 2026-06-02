import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClient } from "@/lib/auth";
import sendEmail from "@/lib/email";
import { extensionReviewedTemplate } from "@/lib/templates";
import { z } from "zod";

const reviewSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  requestId: z.string()
});

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await getClient();
    if (error || !user?.clientProfile){
        return NextResponse.json({ success: false, message: error || "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = reviewSchema.safeParse(body);

    if (!validation.success){
      return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
    }

    const { action, requestId } = validation.data;

    const extensionRequest = await prisma.deadlineExtensionRequest.findUnique({
      where: { id: requestId },
      include: {
        project: { include: { engineer: { include: { user: true } } } }
      }
    });

    if (!extensionRequest){
      return NextResponse.json({ success: false, message: "Request not found" }, { status: 404 });
    }

    if (extensionRequest.project.clientId !== user.clientProfile.id){
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    if (extensionRequest.status !== "PENDING"){
      return NextResponse.json({ success: false, message: "This request has already been processed" }, { status: 400 });
    }      

    const isApproved = action === "APPROVE";
    const engineerUser = extensionRequest.project.engineer?.user;

    if (isApproved) {
      await prisma.deadlineExtensionRequest.update({ where: { id: requestId }, data: { status: "APPROVED" } });
      await prisma.project.update({ where: { id: extensionRequest.projectId }, data: { endDate: extensionRequest.requestedEndDate } });
    } 
    else {
      await prisma.deadlineExtensionRequest.update({ where: { id: requestId }, data: { status: "REJECTED" } });
    }

    if (engineerUser?.email) {
      const emailHtml = extensionReviewedTemplate( engineerUser.name || "Engineer", extensionRequest.project.title, isApproved );
      await sendEmail(engineerUser.email, `Deadline Extension ${isApproved ? 'Approved' : 'Rejected'}`, emailHtml);
    }

    return NextResponse.json({ success: true, message: `Request ${isApproved ? 'approved' : 'rejected'} successfully` }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}