import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const { user, error } = await getUser();
        const engineerProfile = user?.engineerProfile;
        const engineerId = engineerProfile?.id;
        const userId = user?.id;

        const projects = await prisma.project.findMany({
  where: {
    engineerId: engineerId,
  },

  include: {
    tickets: true,
    kanbanTasks: true,
  },
});

        return NextResponse.json({ success: true, projects }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
};