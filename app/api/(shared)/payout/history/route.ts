import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET() {
  try {
    const { user, error } = await getUser();
    if (error || !user) {
      return NextResponse.json({ success: false, message: error || "Unauthorized" }, { status: 401 });
    }

    // engineer payout history
    if (user.role === "ENGINEER") {
      const engineerProfile = user.engineerProfile;

      if (!engineerProfile) {
        return NextResponse.json( { success: true, transactions: [], stats: { totalReceived: 0, totalPending: 0 } }, { status: 200 } );
      }

      const validProjects = await prisma.project.findMany({
        where: {
          engineerId: engineerProfile.id,
          transactions: {
            some: {
              type: { in: ["FINAL_PAYMENT", "REFUND_CLIENT"] },
              status: "SUCCESS"
            }
          }
        },
        select: { id: true, budget: true, title: true },
      });

      const validProjectIds = validProjects.map(p => p.id);

      const payoutTransactions = await prisma.transaction.findMany({
        where: { 
          userId: user.id, 
          type: "PAYOUT_ENGINEER",
          projectId: { in: validProjectIds } 
        },
        orderBy: { createdAt: "desc" },
        include: { project: { select: { title: true } } },
      });

      const projectsWithPayout = new Set(payoutTransactions.map((t) => t.projectId));
      const newPayouts: typeof payoutTransactions = [];

      for (const project of validProjects) {
        if (projectsWithPayout.has(project.id)) continue;

        const payoutAmount = project.budget * 0.7;
        const created = await prisma.transaction.create({
          data: {
            projectId: project.id,
            userId: user.id,
            amount: payoutAmount,
            type: "PAYOUT_ENGINEER",
            status: "PENDING",
          },
          include: { project: { select: { title: true } } },
        });

        newPayouts.push(created);
      }

      const allPayouts = [...payoutTransactions, ...newPayouts].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );

      let totalReceived = 0;
      let totalPending = 0;

      for (const t of allPayouts) {
        if (t.status === "SUCCESS") totalReceived += t.amount;
        else if (t.status === "PENDING") totalPending += t.amount;
      }

      return NextResponse.json( { success: true, transactions: allPayouts, stats: { totalReceived, totalPending } }, { status: 200 } );
    }

    // client payout history
    if (user.role === "CLIENT") {
      const clientProfile = user.clientProfile;
      
      if (!clientProfile) {
        return NextResponse.json({ 
          success: true, transactions: [], 
          stats: { totalSpent: 0, totalRefunded: 0, pendingRefunds: 0, totalBudget: 0, totalProjects: 0, pendingAmount: 0 }, 
          pendingProjects: [] 
        }, { status: 200 });
      }

      const transactions = await prisma.transaction.findMany({
        where: { userId: user.id, type: { in: ["ADVANCE_PAYMENT", "FINAL_PAYMENT", "REFUND_CLIENT"] } },
        orderBy: { createdAt: "desc" },
        include: { project: { select: { title: true } } },
      });

      let totalSpent = 0; let totalRefunded = 0; let pendingRefunds = 0;
      for (const t of transactions) {
        if ((t.type === "ADVANCE_PAYMENT" || t.type === "FINAL_PAYMENT") && t.status === "SUCCESS") {
          totalSpent += t.amount;
        } else if (t.type === "REFUND_CLIENT") {
          if (t.status === "SUCCESS") totalRefunded += t.amount;
          if (t.status === "PENDING") pendingRefunds += t.amount;
        }
      }

      const projects = await prisma.project.findMany({
        where: { clientId: clientProfile.id },
        select: { id: true, title: true, budget: true, status: true, endDate: true }
      });

      const totalProjects = projects.length;
      const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
      
      const pendingProjects = projects.filter(p => p.status === "AWAITING_ADVANCE" || p.status === "AWAITING_FINAL_PAYMENT");
      
      let pendingAmount = 0;
      for (const p of pendingProjects) {
        if (p.status === "AWAITING_ADVANCE") {
          pendingAmount += (p.budget || 0) * 0.4;
        } else if (p.status === "AWAITING_FINAL_PAYMENT") {
          pendingAmount += (p.budget || 0) * 0.6;
        }
      }

      return NextResponse.json({ 
        success: true, 
        transactions, 
        stats: { totalSpent, totalRefunded, pendingRefunds, totalBudget, totalProjects, pendingAmount },
        pendingProjects
      }, { status: 200 });
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { project: { select: { title: true } } },
    });

    return NextResponse.json({ success: true, transactions, stats: {} }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}