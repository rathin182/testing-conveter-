import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEngineer } from "@/lib/auth";
import sendEmail from "@/lib/email";
import { extensionRequestedTemplate } from "@/lib/templates";
import { z } from "zod";

const extensionSchema = z.object({
  requestedEndDate: z.coerce.date(),
  reason: z.string().min(10, "Please provide a valid reason (min 10 characters)"),
  projectId: z.string()
});

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await getEngineer();
    if (error || !user?.engineerProfile){
        return NextResponse.json({ success: false, message: error || "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = extensionSchema.safeParse(body);

    if (!validation.success){
        return NextResponse.json({ success: false, message: validation.error.issues[0].message }, { status: 400 });
    }

    const { requestedEndDate, reason, projectId } = validation.data;

    if (!projectId) {
      return NextResponse.json({ success: false, message: "Project ID is required" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { client: { include: { user: true } }, extensionRequests: true }
    });

    if (!project) {
      return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });
    }

    if (project.engineerId !== user.engineerProfile.id) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    if (project.endDate && validation.data.requestedEndDate <= project.endDate) {
      return NextResponse.json({ success: false, message: "Requested date must be after the current end date" }, { status: 400 });
    }

    const hasPendingRequest = project.extensionRequests.some(req => req.status === "PENDING");
    if (hasPendingRequest) {
      return NextResponse.json({ success: false, message: "You already have a pending extension request" }, { status: 400 });
    }

    const newRequest = await prisma.deadlineExtensionRequest.create({
      data: { projectId, requestedEndDate, reason }
    });

    const clientUser = project.client.user;
    if (clientUser?.email) {
      const emailHtml = extensionRequestedTemplate( clientUser.name || "Client",  project.title, reason, requestedEndDate.toDateString());
      await sendEmail(clientUser.email, `Action Required: Deadline Extension Request - ${project.title}`, emailHtml);
    }

    return NextResponse.json({ success: true, message: "Extension request sent to client", request: newRequest }, { status: 201 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}