import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClient } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await getClient();
    if (error || !user?.clientProfile) {
      return NextResponse.json({ success: false, message: error || "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const search = searchParams.get("search") || "";
    const clientId = user.clientProfile.id;

    if (projectId) {
      const project = await prisma.project.findFirst({
        where: { id: projectId, clientId },
        include: {
          engineer: { include: { user: true } },
          designSystem: true,
          latestUpdates: { orderBy: { createdAt: "desc" }, take: 10 },
          milestones: { orderBy: { createdAt: "desc" } },
          tickets: { orderBy: { createdAt: "desc" } },
          transactions: { where: { status: "SUCCESS" } },
          resources: { where: { type: "FILE" } },
        }
      });

      if (!project) return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });

      let paidAmount = 0;
      project.transactions.forEach(t => {
        if (t.type === "ADVANCE_PAYMENT" || t.type === "FINAL_PAYMENT") paidAmount += t.amount;
      });

      return NextResponse.json({
        success: true,
        data: {
          overview: {
            name: project.title,
            priority: project.priority,
            budget: project.budget,
            description: project.description,
            startDate: project.startDate,
            deadline: project.endDate,
            projectManager: project.engineer?.user.name || "Unassigned",
            overallProgress: project.progress,
            daysRemaining: project.endDate ? Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0
          },
          design: project.designSystem,
          updates: project.latestUpdates,
          milestones: project.milestones,
          tickets: project.tickets,
          budget: {
            totalBudget: project.budget,
            paidAmount,
            remainingAmount: project.budget - paidAmount,
            docs: project.resources
          },
          preview: {
            finalProjectLink: project.finalProjectLink,
            repository: project.repository
          }
        }
      });
    }

    const projects = await prisma.project.findMany({
      where: { 
        clientId,
        title: { contains: search, mode: "insensitive" }
      },
      orderBy: { updatedAt: "desc" }
    });

    const totalProjects = projects.length;
    let activeProjects = 0; let completedProjects = 0; let canceledProjects = 0;
    let totalPending40Amount = 0; let totalPending60Amount = 0;

    const pending60Payments: any[] = [];
    const pending40Payments: any[] = [];

    for (const p of projects) {
      if (["SEARCHING", "IN_PROGRESS", "IN_REVIEW", "AWAITING_FINAL_PAYMENT"].includes(p.status)) activeProjects++;
      else if (p.status === "COMPLETED") completedProjects++;
      else if (p.status === "CANCELED") canceledProjects++;

      if (p.status === "AWAITING_FINAL_PAYMENT" && !p.isFinalPaymentMade) {
        const amount = p.budget * 0.60;
        totalPending60Amount += amount;
        pending60Payments.push({ id: p.id, title: p.title, amount });
      }

      if (p.status === "AWAITING_ADVANCE" && !p.advancePaid) {
        const amount = p.budget * 0.40;
        totalPending40Amount += amount;
        pending40Payments.push({ id: p.id, title: p.title, amount });
      }
    }

    return NextResponse.json({
      success: true,
      projects,
      globalStats: { totalProjects, activeProjects, completedProjects, canceledProjects },
      financials: {
        totalOwed: totalPending60Amount + totalPending40Amount,
        pendingFinalPayments: { totalAmount: totalPending60Amount, count: pending60Payments.length, projects: pending60Payments },
        pendingAdvancePayments: { totalAmount: totalPending40Amount, count: pending40Payments.length, projects: pending40Payments }
      }
    }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}