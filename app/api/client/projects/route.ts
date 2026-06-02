import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClient } from "@/lib/auth";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await getClient();
    if (error || !user || !user.clientProfile) {
      return NextResponse.json(
        { success: false, message: error || "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);
    const skip = (page - 1) * limit;

    const clientId = user.clientProfile.id;

    // BUG FIX #1: Initialize whereClause properly
    const whereClause: any = { clientId };

    // BUG FIX #2: Handle status filter correctly - check valid statuses
    if (status !== "ALL") {
      const validStatuses = [
        "DRAFT",
        "AWAITING_ADVANCE",
        "SEARCHING",
        "IN_PROGRESS",
        "IN_REVIEW",
        "AWAITING_FINAL_PAYMENT",
        "COMPLETED",
        "CANCELED",
      ];

      if (validStatuses.includes(status)) {
        whereClause.status = status;
      }
    }

    // BUG FIX #3: Fix search logic - use proper OR structure
    if (search.trim() !== "") {
      whereClause.OR = [
        { title: { contains: search.trim(), mode: "insensitive" } },
        { description: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    // BUG FIX #4: Run queries in correct order and handle errors
    const [
      projects,
      totalFilteredCount,
      totalProjects,
      activeProjects,
      completedProjects,
    ] = await Promise.all([
      prisma.project.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          engineer: {
            include: { user: { select: { name: true, image: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.count({ where: whereClause }),
      prisma.project.count({ where: { clientId } }),
      prisma.project.count({
        where: {
          clientId,
          status: { in: ["IN_PROGRESS", "IN_REVIEW", "SEARCHING"] },
        },
      }),
      prisma.project.count({ where: { clientId, status: "COMPLETED" } }),
    ]);

    // BUG FIX #5: Format response with proper data structure
    const formattedProjects = projects.map((project) => ({
      id: project.id,
      title: project.title,
      description: project.description,
      priority: project.priority,
      basicDetails: project.description?.substring(0, 100) || "",
      membersCount: project.engineer ? 1 : 0,
      progress: project.progress,
      budget: project.budget,
      projectType: project.currentPhase || "Design",
      startDate: project.startDate?.toISOString() || "",
      endDate: project.endDate?.toISOString() || "",
      createdAt: project.createdAt.toISOString(),
      status: project.status,
      engineer: project.engineer?.user?.name || null,
    }));

    return NextResponse.json(
      {
        success: true,
        projects: formattedProjects,
        pagination: {
          total: totalFilteredCount,
          page,
          limit,
          totalPages: Math.ceil(totalFilteredCount / limit),
        },
        globalStats: {
          total: totalProjects,
          active: activeProjects,
          completed: completedProjects,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/client/projects:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

const projectSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Please provide a more detailed description"),
  budget: z.number().min(500, "Minimum budget must be ₹500"),
  instruments: z.array(z.string()).default([]),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await getClient();
    if (error || !user?.clientProfile) {
      return NextResponse.json(
        { success: false, message: error || "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const validation = projectSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const { title, description, budget, instruments, startDate, endDate } =
      validation.data;

    if (startDate && endDate && startDate > endDate) {
      return NextResponse.json(
        { success: false, message: "Start date must be before end date" },
        { status: 400 }
      );
    }

    const newProject = await prisma.project.create({
      data: {
        clientId: user.clientProfile.id,
        title,
        description,
        budget,
        instruments,
        startDate,
        endDate,
        status: "AWAITING_ADVANCE",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Project created successfully",
        projectId: newProject.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/client/projects:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}