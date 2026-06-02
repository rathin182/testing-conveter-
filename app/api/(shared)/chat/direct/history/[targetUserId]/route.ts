import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

const MESSAGES_PER_PAGE = 50;

export async function GET(req: NextRequest, { params }: { params: Promise<{ targetUserId: string }> }) {
  try {
    const { user, error } = await getUser();
    if (error || !user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { targetUserId } = await params;
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    
    const [user1Id, user2Id] = [user.id, targetUserId].sort();

    const conversation = await prisma.conversation.findUnique({
      where: { user1Id_user2Id: { user1Id, user2Id } }
    });

    if (!conversation) {
      return NextResponse.json({ success: true, messages: [], nextCursor: null }, { status: 200 });
    }

    const messages = await prisma.directMessage.findMany({
      take: MESSAGES_PER_PAGE,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'desc' },
      include: { sender: { select: { id: true, name: true, image: true, role: true } } }
    });

    const sortedMessages = messages.reverse();
    const nextCursor = messages.length === MESSAGES_PER_PAGE ? sortedMessages[0].id : null;

    return NextResponse.json({ success: true, messages: sortedMessages, nextCursor }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}