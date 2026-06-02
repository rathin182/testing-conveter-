import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {``
  try {
    const { user, error } = await getAdmin();
    if (error || !user) {
      return NextResponse.json({ success: false, message: error || "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (status !== "ALL") {
      whereClause.status = status;
    } else {
      whereClause.status = { notIn: ["DRAFT", "AWAITING_ADVANCE"] };
    }

    if (search.trim() !== "") {
      whereClause.OR = [
        { title: { contains: search.trim(), mode: "insensitive" } },
        { description: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const [ projects, totalFilteredCount, totalProjects, activeProjects, completedProjects ] = await Promise.all([
      prisma.project.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          client: { include: { user: { select: { name: true, email: true, image: true } } } },
          engineer: { include: { user: { select: { name: true, image: true } } } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.count({ where: whereClause }),
      prisma.project.count({ where: { status: { notIn: ["DRAFT", "AWAITING_ADVANCE"] } } }),
      prisma.project.count({ where: { status: { in: ["IN_PROGRESS", "IN_REVIEW", "SEARCHING"] } } }),
      prisma.project.count({ where: { status: "COMPLETED" } })
    ]);

    return NextResponse.json({ 
      success: true, 
      projects,
      pagination: {
        total: totalFilteredCount,
        page,
        limit,
        totalPages: Math.ceil(totalFilteredCount / limit)
      },
      globalStats: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects
      }
    }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}