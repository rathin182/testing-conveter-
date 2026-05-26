import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest
) {
    try {
        const engineers =
            await prisma.user.findMany({
                where: {
                    role: "ENGINEER",
                },

                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    role: true,
                    bio: true,
                    phone: true,
                    lastActiveAt: true,

                    engineerProfile: {
                        select: {
                            id: true,

                            qualification: true,

                            skills: true,

                            completedProjects: true,
                        },
                    },
                },

                orderBy: {
                    lastActiveAt: "desc",
                },
            });
        // console.log(engineers);

        return NextResponse.json(
            {
                success: true,
                engineers,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(
            "GET ENGINEERS ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Internal server error",
            },
            {
                status: 500,
            }
        );
    }
}