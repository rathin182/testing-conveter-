import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { any } from "zod";

export async function GET(req: NextRequest) {
    try {
        const projects = await prisma.project.findMany();
        return NextResponse.json({ success: true, projects }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}