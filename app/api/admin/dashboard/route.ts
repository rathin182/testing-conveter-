import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const { error } = await getAdmin();
    if (error){
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const totalProjects = await prisma.project.count({ where: { status: { notIn: ["DRAFT", "AWAITING_ADVANCE"]}} });
    const totalClients = await prisma.user.count({ where: { role: "CLIENT" } });
    const ongoingProjects = await prisma.project.count({ where: { status: { in: ["IN_REVIEW", "IN_PROGRESS"] } } });
    const completedProjects = await prisma.project.count({ where: { status: "COMPLETED" } });
    const searchingProjects = await prisma.project.count({ where: { status: "SEARCHING" } });
    const canceledProjects = await prisma.project.count({ where: { status: "CANCELED" } });
    const awaitingFinalCount = await prisma.project.count({ where: { status: "AWAITING_FINAL_PAYMENT" } });


    const revenueTransactions = await prisma.transaction.findMany({
      where: {
        type: { in: ["ADVANCE_PAYMENT", "FINAL_PAYMENT"] }
      },
      select: { amount: true, status: true, createdAt: true, completedAt: true }
    });

    let totalRevenue = 0;
    let pendingRevenue = 0;

    const monthlyMap: Record<string, number> = {};
    const yearlyMap: Record<string, number> = {};

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    revenueTransactions.forEach(t => {
      if (t.status === "SUCCESS") {
        totalRevenue += t.amount;

        const date = t.completedAt || t.createdAt;
        const year = date.getFullYear();
        const month = monthNames[date.getMonth()];
        
        if (year === new Date().getFullYear()) {
          monthlyMap[month] = (monthlyMap[month] || 0) + t.amount;
        }

        const yearStr = year.toString();
        yearlyMap[yearStr] = (yearlyMap[yearStr] || 0) + t.amount;
      } 
      else if (t.status === "PENDING") {
        pendingRevenue += t.amount;
      }
    });

    const monthlyRevenue = monthNames.map(m => ({ name: m, value: monthlyMap[m] || 0 }));
    
    const yearlyRevenue = Object.keys(yearlyMap)
      .sort()
      .map(y => ({ name: y, value: yearlyMap[y] }));

    const projectDistribution = [
      { name: "In Progress", value: ongoingProjects },
      { name: "Completed", value: completedProjects },
      { name: "Searching", value: searchingProjects },
      { name: "Awaiting Final Payment", value: awaitingFinalCount },
      { name: "Canceled", value: canceledProjects },
    ];

    return NextResponse.json({
      success: true,
      stats: {
        totalProjects,
        totalClients,
        ongoingProjects,
        completedProjects,
        totalRevenue,
        pendingRevenue
      },
      charts: {
        revenue: {
          monthly: monthlyRevenue,
          yearly: yearlyRevenue
        },
        projectDistribution
      }
    }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}