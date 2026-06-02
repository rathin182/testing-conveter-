import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await getUser();

    if (error || !user?.engineerProfile?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const engineerId = user.engineerProfile?.id;

    const invitations = await prisma.projectInvitation.findMany({
      where: {
        engineerId: engineerId,
        status: "SENT",
      },

      include: {
        project: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      invitations,
      hasInvitations: invitations.length > 0,
      total: invitations.length,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user, error } = await getUser();

    if (error || !user?.engineerProfile?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    const { invitationId, status } = body;

    // Validate status
    const allowedStatuses = [
      "ACCEPTED",
      "REJECTED",
    ];

    if (!invitationId || !status || !allowedStatuses.includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid payload",}, { status: 400 });
    }

    const engineerId = user.engineerProfile.id;

    // Find invitation
    const invitation =
      await prisma.projectInvitation.findUnique({
        where: {
          id: invitationId,
        },
      });

    if (!invitation) {
      return NextResponse.json(
        {
          success: false,
          message: "Invitation not found",
        },
        { status: 404 }
      );
    }

    // Validate ownership
    if (invitation.engineerId !== engineerId) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied",
        },
        { status: 403 }
      );
    }

    // Only SENT invitations can be updated
    if (invitation.status !== "SENT") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only SENT invitations can be updated",
        },
        { status: 400 }
      );
    }

    // Update status
    const updatedInvitation =
      await prisma.projectInvitation.update({
        where: {
          id: invitationId,
        },

        data: {
          status,
        },

        include: {
          project: true,
        },
      });

    return NextResponse.json({
      success: true,
      message: `Invitation ${status.toLowerCase()} successfully`,
      invitation: updatedInvitation,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}