import { Server, Socket } from "socket.io";
import { prisma } from "../lib/prisma";
import { validateChatMessage } from "../lib/chatFilter";

export default function registerProjectChatHandlers(io: Server, socket: Socket) {
  
  socket.on("join_project_chat", (data: { projectId: string }) => {
    socket.join(`project_${data.projectId}`);
  });

  socket.on("send_project_message", async (data: { senderId: string; projectId: string; content: string }) => {
    try {
      const validation = validateChatMessage(data.content);
      if (!validation.isValid) return socket.emit("project_error", { message: validation.reason });

      const savedMessage = await prisma.projectMessage.create({
        data: {
          projectId: data.projectId,
          senderId: data.senderId,
          content: data.content
        },
        include: { 
          sender: { select: { id: true, name: true, role: true, image: true } } 
        }
      });

      io.to(`project_${data.projectId}`).emit("receive_project_message", savedMessage);
    } catch {
      socket.emit("project_error", { message: "Failed to send project message" });
    }
  });

  socket.on("edit_project_message", async (data: { messageId: string; senderId: string; content: string; projectId: string }) => {
    try {
      const validation = validateChatMessage(data.content);
      if (!validation.isValid) return socket.emit("project_error", { message: validation.reason });

      const msg = await prisma.projectMessage.findUnique({ where: { id: data.messageId } });
      if (!msg) return socket.emit("project_error", { message: "Message not found" });
      
      if (msg.senderId !== data.senderId) {
          return socket.emit("project_error", { message: "You can only edit your own messages" });
      }

      const updatedMessage = await prisma.projectMessage.update({
        where: { id: data.messageId },
        data: { content: data.content, isEdited: true },
        include: { sender: { select: { id: true, name: true, role: true, image: true } } }
      });

      io.to(`project_${data.projectId}`).emit("project_message_edited", updatedMessage);
    } catch {
      socket.emit("project_error", { message: "Failed to edit project message" });
    }
  });

  socket.on("delete_project_message", async (data: { messageId: string; senderId: string; projectId: string }) => {
    try {
      const msg = await prisma.projectMessage.findUnique({ where: { id: data.messageId } });
      const initiator = await prisma.user.findUnique({ where: { id: data.senderId } });
      
      if (!msg || !initiator) return;
      
      const isAdmin = initiator.role === "ADMIN";

      if (msg.senderId !== data.senderId && !isAdmin) {
          return socket.emit("project_error", { message: "Unauthorized to delete this message" });
      }

      await prisma.projectMessage.update({
        where: { id: data.messageId },
        data: { isDeleted: true, content: "", isEdited: false }
      });

      io.to(`project_${data.projectId}`).emit("project_message_deleted", { messageId: data.messageId });
    } catch {
      socket.emit("project_error", { message: "Failed to delete project message" });
    }
  });

  socket.on("mark_project_message_read", async (data: { messageId: string; readerId: string; projectId: string }) => {
    try {
      const msg = await prisma.projectMessage.findUnique({ where: { id: data.messageId } });
      
      if (msg && msg.senderId !== data.readerId && !msg.isRead) {
        await prisma.projectMessage.update({ where: { id: data.messageId }, data: { isRead: true } });
        io.to(`project_${data.projectId}`).emit("project_read_receipt", { messageId: data.messageId });
      }
    } catch {}
  });

  socket.on("mass_delete_project_message", async (data: { messageIds: string[]; senderId: string; projectId: string }) => {
    try {
      if (!data.messageIds?.length) return;
      
      const initiator = await prisma.user.findUnique({ where: { id: data.senderId } });
      const isAdmin = initiator?.role === "ADMIN";

      const deleteWhere: any = { 
          id: { in: data.messageIds },
          projectId: data.projectId
      };
      
      if (!isAdmin) {
          deleteWhere.senderId = data.senderId; 
      }

      await prisma.projectMessage.updateMany({
        where: deleteWhere,
        data: { isDeleted: true, content: "", isEdited: false }
      });

      io.to(`project_${data.projectId}`).emit("mass_project_deleted", { messageIds: data.messageIds });
    } catch {
      socket.emit("project_error", { message: "Failed to delete messages" });
    }
  });
}