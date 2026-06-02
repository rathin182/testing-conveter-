import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import sendEmail from "@/lib/email";
import { projectCompletedEngineerTemplate } from "@/lib/templates";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const status = formData.get("status") as string;
    const txnid = formData.get("txnid") as string;
    const amount = formData.get("amount") as string;
    const productinfo = formData.get("productinfo") as string;
    const firstname = formData.get("firstname") as string;
    const email = formData.get("email") as string;
    const payuHash = formData.get("hash") as string;
    const mihpayid = formData.get("mihpayid") as string;
    const additionalCharges = formData.get("additionalCharges") as string | null;

    const redirectParam = request.nextUrl.searchParams.get("redirect");
    const baseUrl = process.env.NEXTAUTH_URL;

    const transaction = await prisma.transaction.findUnique({
      where: { payuTransactionId: txnid },
      include: { project: { include: { engineer: { include: { user: true } } } } }
    });

    if (!transaction){
        return NextResponse.redirect(new URL('/client?error=txn_not_found', baseUrl));
    }

    const projectId = transaction.projectId;
    const project = transaction.project;

    const targetBaseUrl = redirectParam || `/client/project/${projectId}`;

    let reverseHashString = `${process.env.PAYU_MERCHANT_SALT}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${process.env.PAYU_MERCHANT_KEY}`;
    if (additionalCharges) {
      reverseHashString = `${additionalCharges}|${reverseHashString}`;
    }

    const calculatedHash = crypto.createHash('sha512').update(reverseHashString).digest('hex');

    if (calculatedHash === payuHash && status === "success") {
      
      if (transaction.status === "PENDING") {
        await prisma.$transaction(async (tx) => {

        // Mark transaction as successful
        await tx.transaction.update({
            where: { id: transaction.id },
            data: { status: "SUCCESS", payuPaymentId: mihpayid, completedAt: new Date() },
        });

        if (transaction.type === "ADVANCE_PAYMENT") {
            await tx.project.update({
                where: { id: project.id },
                data: {
                    advancePaid: true,
                    status: "SEARCHING",
                },
            });

        } else if (transaction.type === "FINAL_PAYMENT") {
            await tx.project.update({
                where: { id: project.id },
                data: {
                    isFinalPaymentMade: true,
                    status: "COMPLETED",
                },
            });

            // Unlock resources
            await tx.projectResource.updateMany({
                where: { projectId: project.id, isLocked: true },
                data: { isLocked: false },
            });

            // Create or update payout for engineer
            if (project.engineerId) {
            const payoutAmount = project.budget * 0.7;
            
            const existingPayout = await tx.transaction.findFirst({
                where: {
                projectId: project.id,
                type: "PAYOUT_ENGINEER",
                userId: project.engineer!.userId
                }
            });

            if (!existingPayout) {
                await tx.transaction.create({
                data: {
                    projectId: project.id,
                    userId: project.engineer!.userId,
                    amount: payoutAmount,
                    type: "PAYOUT_ENGINEER",
                    status: "PENDING",
                },
                });
            }
            }
        }
        });

        if (transaction.type === "FINAL_PAYMENT" && project.engineer?.user.email) {
          const html = projectCompletedEngineerTemplate(project.title, project.budget * 0.7);
          sendEmail(project.engineer.user.email, `Project Completed: ${project.title}`, html);
        }
      }

      const successUrl = new URL(targetBaseUrl, baseUrl);
      successUrl.searchParams.set("payment", "success");
      return NextResponse.redirect(successUrl);
    } 
    else {

      // Failed payment
      if (transaction.status === "PENDING") {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { status: "FAILED" }
        });
      }
      const failedUrl = new URL(targetBaseUrl, baseUrl);
      failedUrl.searchParams.set("payment", "failed");
      return NextResponse.redirect(failedUrl);
    }

  } catch {
    return NextResponse.redirect(new URL('/client?error=payment_error', process.env.NEXTAUTH_URL));
  }
}