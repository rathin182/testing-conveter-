import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { user, error } = await getUser();
    if (error || !user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { projectId } = await params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        client: { include: { user: { select: { id: true, name: true, email: true, image: true, role: true, lastActiveAt: true } } } },
        engineer: { include: { user: { select: { id: true, name: true, email: true, image: true, role: true, lastActiveAt: true } } } },
        kanbanTasks: {
          take: 3,
          orderBy: { updatedAt: "desc" }
        },
        milestones: true 
      }
    });
 
    if (!project) return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });

    const isAdmin = user.role === "ADMIN";
    const isClient = user.role === "CLIENT" && project.clientId === user.clientProfile?.id;
    const isEngineer = user.role === "ENGINEER" && project.engineerId === user.engineerProfile?.id;

    if (!isAdmin && !isClient && !isEngineer) {
      return NextResponse.json({ success: false, message: "You are not a participant in this project" }, { status: 403 });
    }

    const projectData: any = { ...project };

    if (isClient) {
      delete projectData.client;
    } else if (isEngineer) {
      delete projectData.engineer;
      projectData.earnings = project.budget * 0.7;
      delete projectData.budget;
    }

    return NextResponse.json({ success: true, project: projectData }, { status: 200 });
  } catch (error) {
    
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}