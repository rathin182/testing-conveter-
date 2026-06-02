import { Server, Socket } from "socket.io";
import { prisma } from "../lib/prisma";
import { validateChatMessage } from "../lib/chatFilter";

const getRoomId = (userId1: string, userId2: string) => {
  return [userId1, userId2].sort().join("_");
};

export default function registerDirectChatHandlers(io: Server, socket: Socket) {
  
  socket.on("join_dm", (data: { currentUserId: string; targetUserId: string }) => {
    const roomName = `dm_${getRoomId(data.currentUserId, data.targetUserId)}`;
    socket.join(roomName);
  });

  socket.on("send_dm", async (data: { senderId: string; receiverId: string; content: string }) => {
    try {
      const validation = validateChatMessage(data.content);
      if (!validation.isValid) return socket.emit("dm_error", { message: validation.reason });

      const [user1Id, user2Id] = [data.senderId, data.receiverId].sort();

      const conversation = await prisma.conversation.upsert({
        where: { user1Id_user2Id: { user1Id, user2Id } },
        update: { lastMessage: data.content, lastMessageAt: new Date() },
        create: { user1Id, user2Id, lastMessage: data.content, lastMessageAt: new Date() }
      });

      const savedMessage = await prisma.directMessage.create({
        data: {
          conversationId: conversation.id,
          senderId: data.senderId,
          content: data.content
        },
        include: { sender: { select: { id: true, name: true, role: true, image: true } } }
      });

      const roomName = `dm_${getRoomId(data.senderId, data.receiverId)}`;
      io.to(roomName).emit("receive_dm", savedMessage);
      io.emit("new_dm_notification", { receiverId: data.receiverId, senderId: data.senderId, message: savedMessage });

    } catch {
      socket.emit("dm_error", { message: "Failed to send message" });
    }
  });

  socket.on("edit_dm", async (data: { messageId: string; senderId: string; content: string }) => {
    try {
      const validation = validateChatMessage(data.content);
      if (!validation.isValid) return socket.emit("dm_error", { message: validation.reason });

      const msg = await prisma.directMessage.findUnique({ where: { id: data.messageId }, include: { conversation: true } });
      if (!msg || msg.senderId !== data.senderId) return socket.emit("dm_error", { message: "Unauthorized" });

      const updatedMessage = await prisma.directMessage.update({
        where: { id: data.messageId },
        data: { content: data.content, isEdited: true },
        include: { sender: { select: { id: true, name: true, role: true, image: true } } }
      });

      if (msg.conversation.lastMessage === msg.content) {
        await prisma.conversation.update({ where: { id: msg.conversationId }, data: { lastMessage: data.content } });
      }

      const roomName = `dm_${getRoomId(msg.conversation.user1Id, msg.conversation.user2Id)}`;
      io.to(roomName).emit("dm_edited", updatedMessage);
    } catch {
      socket.emit("dm_error", { message: "Failed to edit message" });
    }
  });

  socket.on("delete_dm", async (data: { messageId: string; senderId: string }) => {
    try {
      const msg = await prisma.directMessage.findUnique({ where: { id: data.messageId }, include: { conversation: true } });
      const sender = await prisma.user.findUnique({ where: { id: data.senderId } });
      
      if (!msg) return;
      if (msg.senderId !== data.senderId && sender?.role !== "ADMIN") return socket.emit("dm_error", { message: "Unauthorized" });

      await prisma.directMessage.update({
        where: { id: data.messageId },
        data: { isDeleted: true, content: "", isEdited: false }
      });

      const roomName = `dm_${getRoomId(msg.conversation.user1Id, msg.conversation.user2Id)}`;
      io.to(roomName).emit("dm_deleted", { messageId: data.messageId });
    } catch {
      socket.emit("dm_error", { message: "Failed to delete message" });
    }
  });

  socket.on("mark_dm_read", async (data: { messageId: string; readerId: string }) => {
    try {
      const msg = await prisma.directMessage.findUnique({ where: { id: data.messageId }, include: { conversation: true } });
      if (msg && msg.senderId !== data.readerId && !msg.isRead) {
        await prisma.directMessage.update({ where: { id: data.messageId }, data: { isRead: true } });
        const roomName = `dm_${getRoomId(msg.conversation.user1Id, msg.conversation.user2Id)}`;
        io.to(roomName).emit("dm_read_receipt", { messageId: data.messageId });
      }
    } catch {}
  });

  socket.on("mass_delete_dm", async (data: { messageIds: string[]; senderId: string; receiverId: string }) => {
    try {
      if (!data.messageIds?.length) return;
      const initiator = await prisma.user.findUnique({ where: { id: data.senderId } });
      const isAdmin = initiator?.role === "ADMIN";

      const deleteWhere: any = { id: { in: data.messageIds } };
      if (!isAdmin) deleteWhere.senderId = data.senderId;

      await prisma.directMessage.updateMany({
        where: deleteWhere,
        data: { isDeleted: true, content: "", isEdited: false }
      });

      const roomName = `dm_${getRoomId(data.senderId, data.receiverId)}`;
      io.to(roomName).emit("mass_dm_deleted", { messageIds: data.messageIds });
    } catch {
      socket.emit("dm_error", { message: "Failed to delete messages" });
    }
  });
}