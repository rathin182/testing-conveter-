import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request,{params,}: {params: Promise<{ projectId: string }>;}) {
  try {
    const { projectId } = await params;

    // PROJECT
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          message: "Project not found",
        },
        {
          status: 404,
        }
      );
    }

    // INVITATIONS
    const invitations =
      await prisma.projectInvitation.findMany({
        where: {
          projectId,
        },

        orderBy: {
          createdAt: "desc",
        },

        include: {
          engineer: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
        },
      });
// console.log(invitations, "invitation");

    return NextResponse.json({
      success: true,
      project,
      invitations,
    });
  } catch (error) {
    console.error(
      "PROJECT INVITATIONS GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}