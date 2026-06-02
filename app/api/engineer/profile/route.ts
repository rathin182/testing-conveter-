import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEngineer } from "@/lib/auth";
import { deleteFile, uploadFile, uploadImage } from "@/lib/uploads";
import { z } from "zod";
import { generateEmbedding } from "@/lib/embeddings";

export async function GET() {
  try {
    const { user, error } = await getEngineer(false);
    if (error || !user) {
      return NextResponse.json({ success: false, message: error || "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.engineerProfile.findUnique({ where: { userId: user.id } });

    return NextResponse.json({ success: true, user, profile }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

const certificateSchema = z.object({
  name: z.string(),
  fileUrl: z.string().optional(),
  fileIndex: z.number().optional()
});

const engineerProfileSchema = z.object({
  qualification: z.enum(["UG", "EMPLOYED", "UNEMPLOYED"]),
  idType: z.enum(["STUDENT_ID", "AADHAAR", "PAN", "PAY_SLIP"]),
  idNumber: z.string().min(5, "Valid ID number is required"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  certifications: z.array(certificateSchema).optional(),
  yearsOfExperience: z.enum([
    "FRESHER", 
    "ONE_TO_TWO_YEARS", 
    "THREE_TO_FIVE_YEARS", 
    "FIVE_TO_EIGHT_YEARS", 
    "EIGHT_PLUS_YEARS"
  ]).optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await getEngineer(false);
    if (error || !user) {
      return NextResponse.json({ success: false, message: error || "Unauthorized" }, { status: 401 });
    }

    if (user.engineerProfile) {
      return NextResponse.json({ success: false, message: "Profile already exists" }, { status: 400 });
    }

    const formData = await req.formData();
    
    const idFile = formData.get("file") as File;
    if (!idFile){
        return NextResponse.json({ success: false, message: "ID Image is required" }, { status: 400 });
    }

    const data = {
      qualification: formData.get("qualification"),
      idType: formData.get("idType"),
      idNumber: formData.get("idNumber"),
      skills: JSON.parse(formData.get("skills") as string || "[]"),
      certifications: JSON.parse(formData.get("certifications") as string || "[]"),
      yearsOfExperience: formData.get("yearsOfExperience") || null,
    };

    const validation = engineerProfileSchema.safeParse(data);
    if (!validation.success) {
      return NextResponse.json({ success: false, message: validation.error.issues[0].message }, { status: 400 });
    }

    const idFileUrl = await uploadFile(idFile, "kyc");

    const finalCertifications = [];
    if (validation.data.certifications) {
      for (const cert of validation.data.certifications) {
        if (cert.fileIndex !== undefined && cert.fileIndex !== null) {
          const certFile = formData.get(`certFile_${cert.fileIndex}`) as File;
          if (certFile && certFile.size > 0) {
            const fileUrl = await uploadFile(certFile, "certificates");
            finalCertifications.push({ name: cert.name, fileUrl });
          }
        }
      }
    }

    const newProfile = await prisma.engineerProfile.create({
      data: {
        userId: user.id,
        status: "PENDING",
        qualification: validation.data.qualification,
        idType: validation.data.idType,
        idNumber: validation.data.idNumber,
        idFile: idFileUrl,
        skills: validation.data.skills,
        certifications: finalCertifications,
        yearsOfExperience: validation.data.yearsOfExperience || null,
      }
    });

    generateEmbedding(`Skills: ${validation.data.skills.join(", ")}`)
      .then((embeddingVector) => {
        const vectorString = JSON.stringify(embeddingVector);
        return prisma.$executeRaw`
          UPDATE "EngineerProfile"
          SET embedding = ${vectorString}::vector
          WHERE id = ${newProfile.id}
        `;
      });

    return NextResponse.json({ success: true, message: "Profile created successfully" }, { status: 201 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { user, error } = await getEngineer(false);
    if (error || !user){
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    
    const name = formData.get("name") as string | null;
    const phone = formData.get("phone") as string | null;
    const bio = formData.get("bio") as string | null;
    const profileImage = formData.get("profileImage") as File | null;

    let imageUrl = user.image;
    if (profileImage && profileImage.size > 0) {
      if (user.image) await deleteFile(user.image);
      imageUrl = await uploadImage(profileImage, "avatars");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name || user.name,
        phone: phone || user.phone,
        bio: bio || user.bio,
        image: imageUrl
      }
    });

    const qualification = formData.get("qualification") as any;
    const idType = formData.get("idType") as any;
    const idNumber = formData.get("idNumber") as string | null;
    const skillsRaw = formData.get("skills") as string;
    const certsRaw = formData.get("certifications") as string;
    const idFile = formData.get("idFile") as File | null;
    const yearsOfExperience = formData.get("yearsOfExperience") as any || null;

    if (qualification && idType && idNumber) {
      let skills: string[] = [];
      let parsedCerts: any[] = [];
      try { skills = JSON.parse(skillsRaw || "[]"); } catch {}
      try { parsedCerts = JSON.parse(certsRaw || "[]"); } catch {}

      const existingProfile = await prisma.engineerProfile.findUnique({ where: { userId: user.id } });
      let idFileUrl = existingProfile?.idFile || "";
      
      if (idFile && idFile.size > 0) {
        if (idFileUrl) await deleteFile(idFileUrl);
        idFileUrl = await uploadFile(idFile, "kyc");
      }

      const finalCertifications = [];
      for (const cert of parsedCerts) {
        if (cert.fileIndex !== undefined && cert.fileIndex !== null) {
          const certFile = formData.get(`certFile_${cert.fileIndex}`) as File;
          if (certFile && certFile.size > 0) {
            const fileUrl = await uploadFile(certFile, "certificates");
            finalCertifications.push({ name: cert.name, fileUrl });
          }
        } else if (cert.fileUrl) {
          finalCertifications.push({ name: cert.name, fileUrl: cert.fileUrl });
        }
      }

      if (existingProfile?.certifications) {
        const oldCerts = (existingProfile.certifications as any[]) || [];
        const newUrls = finalCertifications.map(c => c.fileUrl);

        for (const oldCert of oldCerts) {
          if (oldCert.fileUrl && !newUrls.includes(oldCert.fileUrl)) {
             await deleteFile(oldCert.fileUrl);
          }
        }
      }

      const newProfile = await prisma.engineerProfile.upsert({
        where: { userId: user.id },
        update: { qualification, idType, idNumber, skills, certifications: finalCertifications, idFile: idFileUrl, yearsOfExperience },
        create: { userId: user.id, qualification, idType, idNumber, skills, certifications: finalCertifications, idFile: idFileUrl, status: "PENDING", yearsOfExperience }
      });

      if (skills.length > 0) {
        generateEmbedding(`Skills: ${skills.join(", ")}`)
        .then((embeddingVector) => {
          const vectorString = JSON.stringify(embeddingVector);
          return prisma.$executeRaw`
            UPDATE "EngineerProfile"
            SET embedding = ${vectorString}::vector
            WHERE id = ${newProfile.id}
          `;
        });
      }
    }

    return NextResponse.json({ success: true, message: "Profile updated successfully" }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}