import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/auth";
import sendEmail from "@/lib/email";
import { payoutSentTemplate, refundProcessedTemplate } from "@/lib/templates";
import { deleteFile, uploadImage } from "@/lib/uploads";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ transactionId: string }> }) {
  try {
    const { error } = await getAdmin();
    if (error){
      return NextResponse.json({ success: false, message: error || "Unauthorized" }, { status: 403 });
    }

    const { transactionId } = await params;
    
    const formData = await req.formData();
    const amount = formData.get("amount") as string;
    const manualTxId = formData.get("manualTxId") as string;
    const method = formData.get("method") as string;
    const date = formData.get("date") as string;
    const status = formData.get("status") as string;
    const proofUrl = formData.get("proofUrl") as string;
    const file = formData.get("file") as File | null;

    const existingTx = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true, project: true }
    });

    if (!existingTx) return NextResponse.json({ success: false, message: "Transaction not found" }, { status: 404 });

    let finalProof = existingTx.proof;

    if (file && file.size > 0) {
      if (existingTx.proof) await deleteFile(existingTx.proof);
      finalProof = await uploadImage(file, "proofs");
    } else if (proofUrl) {
      finalProof = proofUrl;
    }

    const newStatus = status === "Completed" || status === "SUCCESS" ? "SUCCESS" : (status === "FAILED" ? "FAILED" : "PENDING");

    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        amount: Number(amount),
        status: newStatus,
        razorpayPaymentId: manualTxId || null,
        razorpaySignature: method || null,
        proof: finalProof,
        completedAt: new Date(date),
      }
    });

    if (newStatus === "SUCCESS" && existingTx.status !== "SUCCESS" && existingTx.user.email) {
      if (existingTx.type === "PAYOUT_ENGINEER") {
        const emailHtml = payoutSentTemplate(existingTx.project.title, Number(amount));
        await sendEmail(existingTx.user.email, `Payout Sent: ${existingTx.project.title}`, emailHtml);
      } else if (existingTx.type === "REFUND_CLIENT") {
        const emailHtml = refundProcessedTemplate(existingTx.project.title, Number(amount));
        await sendEmail(existingTx.user.email, `Refund Processed: ${existingTx.project.title}`, emailHtml);
      }
    }

    return NextResponse.json({ success: true, message: "Transaction updated successfully." }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ transactionId: string }> }) {
  try {
    const { error } = await getAdmin();
    if (error){
      return NextResponse.json({ success: false, message: error || "Unauthorized" }, { status: 403 });
    }

    const { transactionId } = await params;
    
    const tx = await prisma.transaction.findUnique({ where: { id: transactionId } });
    if (tx?.proof){
      await deleteFile(tx.proof);
    }

    await prisma.transaction.delete({ where: { id: transactionId } });

    return NextResponse.json({ success: true, message: "Transaction deleted." }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}