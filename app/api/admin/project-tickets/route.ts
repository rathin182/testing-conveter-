import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest
) {
    try {
        const projectsWithTickets =
            await prisma.project.findMany({
                where: {
                    tickets: {
                        some: {},
                    },
                },

                select: {
                    id: true,
                    title: true,

                    tickets: {
                        where: {
                            status: "OPEN",
                        },

                        select: {
                            id: true,
                            issueType: true,
                            description: true,
                            status: true,
                            createdAt: true,

                            raisedBy: {
                                select: {
                                    name: true,
                                },
                            },
                        },

                        take: 3,

                        orderBy: {
                            createdAt: "desc",
                        },
                    },
                },

                orderBy: {
                    createdAt: "desc",
                },
            });

        return NextResponse.json(
            {
                success: true,
                data: projectsWithTickets,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(
            "GET_PROJECT_TICKETS_ERROR",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to fetch project tickets",
            },
            {
                status: 500,
            }
        );
    }
}