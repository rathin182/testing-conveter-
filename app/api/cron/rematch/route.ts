import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTopMatches } from "@/lib/matcher";
import sendEmail from "@/lib/email";
import { invitationDeclinedAdminTemplate } from "@/lib/templates";

const EXPIRE_TIME_MS = 3 * 60 * 60 * 1000; // 3hrs

async function processRematches(activeProjects: any[]) {

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { email: true }
  });
  const adminEmails = admins.map(a => a.email).filter(Boolean);

  for (const project of activeProjects) {

    if (project.invitations.some((inv: any) => inv.status === "ACCEPTED")) {
      await prisma.project.update({ where: { id: project.id }, data: { status: "IN_PROGRESS" } });
      continue;
    }

    let poolNeedsReplenishment = true;

    for (const inv of project.invitations) {
      if (inv.status === "PENDING_ADMIN") {
        poolNeedsReplenishment = false;
      } 
      else if (inv.status === "SENT") {
        const timeSinceSent = Date.now() - new Date(inv.updatedAt).getTime();
        
        if (timeSinceSent > EXPIRE_TIME_MS) {

          await prisma.projectInvitation.update({
            where: { id: inv.id },
            data: { status: "EXPIRED" }
          });

          // email to admins
          if (adminEmails.length > 0) {
            const emailHtml = invitationDeclinedAdminTemplate(
              inv.engineer.user.name || "Engineer", 
              project.title, 
              true 
            );

            const emailPromises = adminEmails.map(email => 
              sendEmail(email, `Alert: Match Timeout for ${project.title}`, emailHtml)
            );
            await Promise.allSettled(emailPromises);
          }
        } else {
          poolNeedsReplenishment = false;
        }
      }
    }

    if (poolNeedsReplenishment) {
      
      const newEngineerIds = await getTopMatches(project.id);
      
      if (newEngineerIds && newEngineerIds.length > 0) {
        const createPromises = newEngineerIds.map(engId => 
          prisma.projectInvitation.create({
            data: { projectId: project.id, engineerId: engId, status: "PENDING_ADMIN" }
          }).catch(err => console.error(`Failed to create replenishment invite: ${err.message}`))
        );

        await Promise.allSettled(createPromises);
      } else {
        console.log(`No more engineers available for Project ${project.id}.`);
      }
    }
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const activeProjects = await prisma.project.findMany({
      where: { status: "SEARCHING", advancePaid: true },
      include: {
        invitations: { 
          include: { engineer: { include: { user: true } } },
          orderBy: { createdAt: "desc" } 
        }
      }
    });

    processRematches(activeProjects).catch(console.error);

    return NextResponse.json({ success: true, message: `Matching check started for ${activeProjects.length} projects.` }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}