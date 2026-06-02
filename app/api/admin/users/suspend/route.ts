import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/auth";
import sendEmail from "@/lib/email";
import { userSuspendedTemplate, userUnsuspendedTemplate } from "@/lib/templates";

export async function PATCH(req: NextRequest) {
  try {
    const { error } = await getAdmin();
    if (error) {
      return NextResponse.json({ success: false, message: error || "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { isSuspended, userId, customMessage, subject: clientSubject } = body;

    if (typeof isSuspended !== "boolean") {
      return NextResponse.json({ success: false, message: "isSuspended must be a boolean (true/false)" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isSuspended }
    });

    const userName = existingUser.name || "User";
    const userEmail = existingUser.email;

    if (isSuspended) {
      const emailSubject = clientSubject ? `Account Suspended: ${clientSubject}` : "Action Required: Account Suspended";
      const emailHtml = userSuspendedTemplate(userName, customMessage || "Your account has been suspended by an administrator.");
      await sendEmail(userEmail, emailSubject, emailHtml);
    } else {
      const emailSubject = clientSubject ? `Account Restored: ${clientSubject}` : "Account Restored: Suspension Lifted";
      const emailHtml = userUnsuspendedTemplate(userName, customMessage || "Your account access has been fully restored.");
      await sendEmail(userEmail, emailSubject, emailHtml);
    }

    const actionText = isSuspended ? "suspended" : "unsuspended";
    return NextResponse.json({ success: true, message: `User account has been successfully ${actionText}.` }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}