import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { getTopMatches } from "@/lib/matcher";

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await getUser();
    if (error || !user?.clientProfile) {
      return NextResponse.json({ success: false, message: error || "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await req.json();
    if (!projectId) {
      return NextResponse.json({ success: false, message: "Missing project ID" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { client: true }
    });

    if (!project) {
      return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });
    }

    const isParticipant = user.role === "ADMIN" || (user.role === "CLIENT" && project.client?.userId === user.id);

    if (!isParticipant){
        return NextResponse.json({ success: false, message: "Project matching not allowed" }, { status: 403 });
    }

    if (!project.advancePaid) {
      return NextResponse.json({ success: false, message: "Advance payment required" }, { status: 400 });
    }

    if (project.engineerId) {
      return NextResponse.json({ success: false, message: "Project already assigned" }, { status: 400 });
    }

    await prisma.project.update({
      where: { id: projectId },
      data: { status: "SEARCHING" }
    });

    const topEngineerIds: string[] = await getTopMatches(projectId);

    if (topEngineerIds && topEngineerIds.length > 0) {
      const invitationPromises = topEngineerIds.map(async (engId) => {
        await prisma.projectInvitation.create({
          data: { projectId, engineerId: engId, status: "PENDING_ADMIN" }
        });
      });

      await Promise.all(invitationPromises);
    }

    return NextResponse.json({ success: true, message: "Matching completed successfully" });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}