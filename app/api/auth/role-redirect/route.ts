import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL));
  }

  const role = session.user.role;
  const userId = session.user.id;

  if (role === "ADMIN") {
    return NextResponse.redirect(new URL("/admin", process.env.NEXTAUTH_URL));
  }

  if (role === "ENGINEER") {
    const profile = await prisma.engineerProfile.findUnique({ where: { userId: userId } });

    if (profile) {
      return NextResponse.redirect(new URL("/engineer", process.env.NEXTAUTH_URL));
    }
    return NextResponse.redirect(new URL("/form/engineer", process.env.NEXTAUTH_URL));
  }

  if (role === "CLIENT") {
    const profile = await prisma.clientProfile.findUnique({ where: { userId: userId } });

    if (profile) {
      return NextResponse.redirect(new URL("/client", process.env.NEXTAUTH_URL));
    }
    return NextResponse.redirect(new URL("/form/client", process.env.NEXTAUTH_URL));
  }

  return NextResponse.redirect(new URL("/", process.env.NEXTAUTH_URL));
}