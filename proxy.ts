import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const pathname = req.nextUrl.pathname;

  const authPages = [
    "/login",
    "/register",
    "/register/client",
    "/register/engineer",
  ];

  if (token && authPages.includes(pathname)) {
    const role = token.role as string;

    switch (role?.toUpperCase()) {
      case "ADMIN":
        return NextResponse.redirect(
          new URL("/admin", req.url)
        );

      case "ENGINEER":
        return NextResponse.redirect(
          new URL("/engineer", req.url)
        );

      case "CLIENT":
        return NextResponse.redirect(
          new URL("/client", req.url)
        );

      default:
        return NextResponse.redirect(
          new URL("/", req.url)
        );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/register/client",
    "/register/engineer",
  ],
};