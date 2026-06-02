import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await getUser();
    if (error || !user) return NextResponse.json({ success: false, message: error || "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const roleFilter = searchParams.get("role") || "ALL";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const allowedContacts: any[] = [];
    const projectMap = new Map<string, string[]>(); 

    let targetRoles: Role[] = ["ADMIN", "CLIENT", "ENGINEER"];
    if (roleFilter !== "ALL") {
      targetRoles = [roleFilter as Role];
    }

    if (user.role === "ADMIN") {
      const users = await prisma.user.findMany({
        where: {
          role: { in: targetRoles, not: "ADMIN" },
          name: { contains: search, mode: "insensitive" }
        },
        include: {
          clientProfile: { include: { projects: { where: { status: { notIn: ["COMPLETED", "CANCELED"] } }, select: { title: true } } } },
          engineerProfile: { include: { assignedWork: { where: { status: { notIn: ["COMPLETED", "CANCELED"] } }, select: { title: true } } } }
        }
      });

      users.forEach(u => {
        const titles: string[] = [];
        if (u.role === "CLIENT" && u.clientProfile?.projects) {
          titles.push(...u.clientProfile.projects.map((p: any) => p.title));
        } 
        else if (u.role === "ENGINEER" && u.engineerProfile?.assignedWork) {
          titles.push(...u.engineerProfile.assignedWork.map((p: any) => p.title));
        }
        
        projectMap.set(u.id, titles);
        allowedContacts.push({ id: u.id, name: u.name, role: u.role, image: u.image });
      });

      if (targetRoles.includes("ADMIN")) {
        const otherAdmins = await prisma.user.findMany({
          where: { role: "ADMIN", id: { not: user.id }, name: { contains: search, mode: "insensitive" } },
          select: { id: true, name: true, role: true, image: true }
        });
        allowedContacts.push(...otherAdmins);
      }

    } else if (user.role === "CLIENT") {
      if (targetRoles.includes("ADMIN")) {
        const admins = await prisma.user.findMany({
          where: { role: "ADMIN", name: { contains: search, mode: "insensitive" } },
          select: { id: true, name: true, role: true, image: true }
        });
        allowedContacts.push(...admins);
      }
      if (targetRoles.includes("ENGINEER") && user.clientProfile) {
        const myProjects = await prisma.project.findMany({
          where: { clientId: user.clientProfile.id, status: { notIn: ["COMPLETED", "CANCELED"] } },
          include: { engineer: { include: { user: true } } }
        });

        myProjects.forEach(p => {
          if (p.engineer?.user) {
            const engId = p.engineer.user.id;
            if (!projectMap.has(engId)) projectMap.set(engId, []);
            projectMap.get(engId)!.push(p.title);

            if (p.engineer.user.name?.toLowerCase().includes(search.toLowerCase())) {
              if (!allowedContacts.find(c => c.id === engId)) {
                allowedContacts.push({ id: engId, name: p.engineer.user.name, role: "ENGINEER", image: p.engineer.user.image });
              }
            }
          }
        });
      }

    } else if (user.role === "ENGINEER") {
      if (targetRoles.includes("ADMIN")) {
        const admins = await prisma.user.findMany({
          where: { role: "ADMIN", name: { contains: search, mode: "insensitive" } },
          select: { id: true, name: true, role: true, image: true }
        });
        allowedContacts.push(...admins);
      }
      if (targetRoles.includes("CLIENT") && user.engineerProfile) {
        const myProjects = await prisma.project.findMany({
          where: { engineerId: user.engineerProfile.id, status: { notIn: ["COMPLETED", "CANCELED"] } },
          include: { client: { include: { user: true } } }
        });

        myProjects.forEach(p => {
          if (p.client?.user) {
            const clientId = p.client.user.id;
            if (!projectMap.has(clientId)) projectMap.set(clientId, []);
            projectMap.get(clientId)!.push(p.title);

            if (p.client.user.name?.toLowerCase().includes(search.toLowerCase())) {
              if (!allowedContacts.find(c => c.id === clientId)) {
                allowedContacts.push({ id: clientId, name: p.client.user.name, role: "CLIENT", image: p.client.user.image });
              }
            }
          }
        });
      }
    }

    const contactIds = allowedContacts.map(c => c.id);
    const myConversations = await prisma.conversation.findMany({
      where: { OR: [{ user1Id: user.id, user2Id: { in: contactIds } }, { user2Id: user.id, user1Id: { in: contactIds } }] }
    });

    const contactsWithDetails = allowedContacts.map(contact => {
      const convo = myConversations.find(c => c.user1Id === contact.id || c.user2Id === contact.id);
      const projects = projectMap.get(contact.id) || [];
      return {
        ...contact,
        projectNames: Array.from(new Set(projects)).join(", "), 
        conversationId: convo?.id || null,
        lastMessage: convo?.lastMessage || null,
        lastMessageAt: convo?.lastMessageAt || null,
      };
    }).sort((a, b) => {
      if (!a.lastMessageAt) return 1;
      if (!b.lastMessageAt) return -1;
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
    });

    const startIndex = (page - 1) * limit;
    const paginatedContacts = contactsWithDetails.slice(startIndex, startIndex + limit);

    return NextResponse.json({ 
      success: true, 
      contacts: paginatedContacts,
      hasMore: startIndex + limit < contactsWithDetails.length
    }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}