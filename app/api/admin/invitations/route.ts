import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/auth";
import sendEmail from "@/lib/email";


interface Params {
  params: Promise<{
    id: string;
  }>;
}

const projectConfirm = `<h2>Project Assignment Confirmed</h2>

<p>Hello {{engineerName}},</p>

<p>
Congratulations! You have been officially assigned to the following project.
</p>

<h3>Project Details</h3>

<ul>
  <li><strong>Project:</strong> {{projectTitle}}</li>
  <li><strong>Description:</strong> {{projectDescription}}</li>
  <li><strong>Required Skills:</strong> {{projectSkills}}</li>
  <li><strong>Budget:</strong> ₹{{projectBudget}}</li>
  <li><strong>Start Date:</strong> {{projectStartDate}}</li>
</ul>

<p>
You can now begin preparing for project execution.
Additional instructions and project resources will be shared through the platform.
</p>

<p>
We look forward to your contribution and wish you success.
</p>

<p>
Best Regards,<br/>
Project Management Team
</p>
`;

const projectInvitation = `<h2>Project Invitation</h2>

<p>Hello {{engineerName}},</p>

<p>You have been invited to participate in a new project.</p>

<h3>Project Details</h3>

<ul>
  <li><strong>Project:</strong> {{projectTitle}}</li>
  <li><strong>Description:</strong> {{projectDescription}}</li>
  <li><strong>Required Skills:</strong> {{projectSkills}}</li>
  <li><strong>Budget:</strong> ₹{{projectBudget}}</li>
  <li><strong>Start Date:</strong> {{projectStartDate}}</li>
</ul>

<p>
Please review the project and submit your response within
<strong>24 hours</strong>.
</p>

<p>
Failure to respond within the specified time may result in the invitation being withdrawn.
</p>

<p>
Thank you,<br/>
Project Management Team
</p>
`;

const projectRejected = `
<h2>Project Invitation Declined</h2>

<p>Hello {{engineerName}},</p>

<p>
We have received your response regarding the project invitation.
You have chosen not to participate in the project listed below.
</p>

<h3>Project Details</h3>

<ul>
  <li><strong>Project:</strong> {{projectTitle}}</li>
  <li><strong>Description:</strong> {{projectDescription}}</li>
  <li><strong>Required Skills:</strong> {{projectSkills}}</li>
  <li><strong>Budget:</strong> ₹{{projectBudget}}</li>
</ul>

<p>
Your decision has been recorded successfully.
No further action is required from your side.
</p>

<p>
Thank you for reviewing the opportunity.
We hope to work with you on future projects.
</p>

<p>
Best Regards,<br/>
Project Management Team
</p>
`;

const projectExpired = `
<h2>Project Invitation Expired</h2>

<p>Hello {{engineerName}},</p>

<p>
The invitation for the following project has expired because no response was received within the required 24-hour period.
</p>

<h3>Project Details</h3>

<ul>
  <li><strong>Project:</strong> {{projectTitle}}</li>
  <li><strong>Description:</strong> {{projectDescription}}</li>
  <li><strong>Required Skills:</strong> {{projectSkills}}</li>
  <li><strong>Budget:</strong> ₹{{projectBudget}}</li>
</ul>

<p>
As a result, this invitation is no longer available.
Future opportunities may still be offered based on project requirements and availability.
</p>

<p>
Thank you for your interest and participation on the platform.
</p>

<p>
Best Regards,<br/>
Project Management Team
</p>
`;


export async function GET(req: NextRequest) {
  try {
    const { user, error } = await getAdmin();
    if (error || !user) {
      return NextResponse.json({ success: false, message: error || "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");
    // console.log(projectId, status, "params");


    const whereClause: any = {};
    if (projectId) {
      whereClause.projectId = projectId;
    }

    if (status && ["PENDING_ADMIN", "SENT", "ACCEPTED", "REJECTED", "ADMIN_REJECTED", "EXPIRED", "DROPPED"].includes(status)) {
      whereClause.status = status;
    }

    const invitations = await prisma.projectInvitation.findMany({
      where: whereClause,
      include: {
        project: {
          select: { id: true, title: true, budget: true, status: true }
        },
        engineer: {
          include: { user: { select: { name: true, email: true, image: true } } }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const formattedInvitations = invitations.map(inv => ({
      ...inv,
      engineerCut: inv.project.budget * 0.7,
      platformProfit: inv.project.budget * 0.3
    }));

    return NextResponse.json({ success: true, invitations: formattedInvitations }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { projectId, engineerId, status, } = body;

    // VALIDATION
    if (!projectId || !engineerId) {
      return NextResponse.json({
        success: false, message: "Project ID and Engineer ID are required",
      },
        { status: 400, }
      );
    }

    // CHECK EXISTING INVITATION
    const existingInvitation = await prisma.projectInvitation.findUnique({
      where: {
        projectId_engineerId: {
          projectId,
          engineerId,
        },
      },
    }
    );

    // console.log(existingInvitation);


    if (existingInvitation) {
      return NextResponse.json(
        { success: false, message: "Invitation already exists", },
        {
          status: 409,
        }
      );
    }

    // CREATE INVITATION
    const invitation = await prisma.projectInvitation.create({
      data: {
        projectId,
        engineerId,

        status: status || "SENT",
      },

      include: {
        engineer: {
          include: {
            user: true,
          },
        },

        project: true,
      },
    }
    );

    const emailHtml = (
      invitation.status === "ACCEPTED"
        ? projectConfirm
        : projectInvitation
    )
      .replace(
        "{{engineerName}}",
        invitation.engineer.user.name || "Engineer"
      )
      .replace(
        "{{projectTitle}}",
        invitation.project.title
      )
      .replace(
        "{{projectDescription}}",
        invitation.project.description
      )
      .replace(
        "{{projectSkills}}",
        invitation.project.instruments.join(", ")
      )
      .replace(
        "{{projectBudget}}",
        String(invitation.project.budget)
      )
      .replace(
        "{{projectStartDate}}",
        new Date(
          invitation.project.createdAt
        ).toLocaleDateString()
      );

    await sendEmail(
      invitation.engineer.user.email,
      invitation.status === "ACCEPTED"
        ? "Congratulations! You Have Been Assigned To A Project"
        : "Project Invitation - Response Required Within 24 Hours",
      emailHtml
    );

    return NextResponse.json(
      {
        success: true,
        invitation,
      },
      {
        status: 201,
      }
    );

    return NextResponse.json(
      { success: true, invitation, },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("CREATE_INVITATION_ERROR", error);

    return NextResponse.json(
      { success: false, message: "Failed to create invitation", },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    const { status, action, id } = body;

    // VALIDATION
    if (!status) {
      return NextResponse.json({ success: false, message: "Status is required", }, { status: 400, });
    }

    // CHECK INVITATION
    const existingInvitation =
      await prisma.projectInvitation.findUnique(
        {
          where: {
            id,
          },
        }
      );

    if (!existingInvitation) {
      return NextResponse.json(
        { success: false, message: "Invitation not found", }, { status: 404, }
      );
    }

    // UPDATE STATUS
    const updatedInvitation =
      await prisma.projectInvitation.update(
        {
          where: {
            id,
          },

          data: {
            status,
          },

          include: {
            engineer: {
              include: {
                user: true,
              },
            },

            project: true,
          },
        }
      );
    let emailTemplate = "";
    let subject = "";

    const emailHtml = emailTemplate
      .replace(
        "{{engineerName}}",
        updatedInvitation.engineer.user.name ||
        "Engineer"
      )
      .replace(
        "{{projectTitle}}",
        updatedInvitation.project.title
      )
      .replace(
        "{{projectDescription}}",
        updatedInvitation.project.description
      )
      .replace(
        "{{projectSkills}}",
        updatedInvitation.project.instruments.join(", ")
      )
      .replace(
        "{{projectBudget}}",
        String(updatedInvitation.project.budget)
      );

    if (status === "ACCEPTED") {
      emailTemplate = projectConfirm;

      subject = "Congratulations! You Have Been Assigned To A Project";
    } else if (status === "REJECTED") {
      emailTemplate = projectRejected;

      subject = "Project Invitation Declined";
    }

    await sendEmail(updatedInvitation.engineer.user.email, subject, emailHtml);

    return NextResponse.json(
      { success: true, invitation: updatedInvitation, }, { status: 200, });
  } catch (error) {
    console.error(
      "UPDATE_INVITATION_ERROR",
      error
    );

    return NextResponse.json(
      { success: false, message: "Failed to update invitation", }, { status: 500, }
    );
  } 
}

/*
=====================================
DELETE INVITATION
=====================================
*/

export async function DELETE(req: NextRequest) {

  try {
    const body = await req.json();

    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "Invitation id required", }, { status: 400, });
    }

    const invitation =
      await prisma.projectInvitation.findUnique({
        where: {
          id,
        },
      });

    if (!invitation) {

      return NextResponse.json(
        { success: false, message: "Invitation not found", }, { status: 404, });
    }

    await prisma.projectInvitation.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      { success: true, message: "Invitation deleted successfully", }, { status: 200, }
    );

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { success: false, message: "Internal server error", }, { status: 500, }
    );
  }
}