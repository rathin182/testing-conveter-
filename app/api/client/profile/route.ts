import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClient } from "@/lib/auth";
import { z } from "zod";
import { deleteFile, uploadImage } from "@/lib/uploads";

export async function GET() {
  try {
    const { user, error } = await getClient();
    if (error || !user) {
      return NextResponse.json({ success: false, message: error || "Unauthorized" }, { status: 401 });
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        clientProfile: { include: { projects: { select: { id: true } } } },
        transactions: {
          where: {
            status: "SUCCESS",
            type: { in: ["ADVANCE_PAYMENT", "FINAL_PAYMENT"] }
          },
          select: { amount: true }
        }
      }
    });

    if (!userData) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const profile = userData.clientProfile;
    const transactions = userData.transactions || [];
    
    const totalProjects = profile?.projects.length || 0;
    const totalBudget = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);

    return NextResponse.json({ 
      success: true, 
      user: {
        id: userData.id, 
        name: userData.name, 
        phone: userData.phone,
        image: userData.image, 
        bio: userData.bio, 
        email: userData.email
      },
      profile: profile ? { ...profile, totalProjects, totalBudget } : null 
    }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

const clientProfileSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  totalProjects: z.number().int().min(0).optional(),
  totalBudget: z.number().min(0).optional(),
  expertise: z.array(z.string()).min(1).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await getClient();
    if (error || !user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const contentType = req.headers.get("content-type") || "";
    let data: any = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      data.name = formData.get("name") as string || undefined;
      data.phone = formData.get("phone") as string || undefined;
      data.bio = formData.get("bio") as string || undefined;
      
      const profileImage = formData.get("profileImage") as File | null;
      if (profileImage && profileImage.size > 0) {
        if (user.image) await deleteFile(user.image);
        data.image = await uploadImage(profileImage, "avatars");
      }
    } else {
      data = await req.json();
    }

    const validation = clientProfileSchema.safeParse(data);
    if (!validation.success && !data.image) { 
      return NextResponse.json({ success: false, message: validation.error.issues[0].message }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: data.name ?? user.name,
        phone: data.phone ?? user.phone,
        bio: data.bio ?? user.bio,
        image: data.image ?? user.image
      }
    });

    let profile = null;
    const { totalProjects, totalBudget, expertise } = data;
    if (totalProjects !== undefined || totalBudget !== undefined || expertise !== undefined) {
      profile = await prisma.clientProfile.upsert({
        where: { userId: user.id },
        update: { totalProjects, totalBudget, expertise },
        create: { userId: user.id, totalProjects: totalProjects ?? 0, totalBudget: totalBudget ?? 0, expertise: expertise ?? [] }
      });
    }

    return NextResponse.json({ success: true, message: "Profile updated", profile }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}