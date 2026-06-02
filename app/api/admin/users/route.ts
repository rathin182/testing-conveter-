import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await getAdmin();
    if (error || !user) {
      return NextResponse.json({ success: false, message: error || "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const roleFilter = searchParams.get("role");
    const searchQuery = searchParams.get("search");
    const statusFilter = searchParams.get("status") || "ALL";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    
    if (roleFilter && ["ADMIN", "ENGINEER", "CLIENT"].includes(roleFilter.toUpperCase())) {
      whereClause.role = roleFilter.toUpperCase();
    }

    if (searchQuery && searchQuery.trim() !== "") {
      whereClause.OR = [
        { name: { contains: searchQuery.trim(), mode: "insensitive" } },
        { email: { contains: searchQuery.trim(), mode: "insensitive" } }
      ];
    }

    if (roleFilter === "ENGINEER" && statusFilter !== "ALL") {
      whereClause.engineerProfile = { status: statusFilter };
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      include: { 
        engineerProfile: true, 
        clientProfile: {
          include: {
            _count: { select: { projects: { where: { advancePaid: true } } } }
          }
        } 
      },
      orderBy: { lastActiveAt: "desc" },
      skip,
      take: limit,
    });

    const formattedUsers = users.map((u) => {
      const baseData = {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        image: u.image,
        lastActive: u.lastActiveAt,
        isSuspended: u.isSuspended,
      };

      if (u.role === "ENGINEER" && u.engineerProfile) {
        return {
          ...baseData,
          status: u.engineerProfile.status,
          joinedAt: u.engineerProfile.createdAt,
          skills: u.engineerProfile.skills,
          completedProjects: u.engineerProfile.completedProjects,
          rejectionReason: u?.engineerProfile?.rejectionReason || null,
        };
      }

      if (u.role === "CLIENT" && u.clientProfile) {
        return {
          ...baseData,
          totalProjects: u.clientProfile._count?.projects || 0,
          expertise: u.clientProfile.expertise,
        };
      }

      return baseData;
    });

    if (roleFilter === "ENGINEER" && statusFilter === "ALL") {
      const orderMap: Record<string, number> = { PENDING: 1, APPROVED: 2, REJECTED: 3 };
      
      formattedUsers.sort((a: any, b: any) => {
        const orderA = orderMap[a?.status as string] || 99;
        const orderB = orderMap[b?.status as string] || 99;
        
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        
        const nameA = (a.name || "").toLowerCase();
        const nameB = (b.name || "").toLowerCase();
        return nameA.localeCompare(nameB);
      });
    }

    let pendingCount = 0;
    if (roleFilter === "ENGINEER") {
      pendingCount = await prisma.user.count({
        where: { role: "ENGINEER", engineerProfile: { status: "PENDING" } }
      });
    }

    return NextResponse.json({ success: true, users: formattedUsers, pendingCount }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}