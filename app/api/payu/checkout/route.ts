import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClient } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await getClient();
    if (error || !user?.clientProfile) {
      return NextResponse.json({ success: false, message: error || "Unauthorized" }, { status: 401 });
    }

    const { projectId, redirectUrl } = await req.json();
    if (!projectId){
        return NextResponse.json({ success: false, message: "Project ID required" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });

    if (!project || project.clientId !== user.clientProfile.id) {
      return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });
    }

    if (!["DRAFT", "AWAITING_ADVANCE", "AWAITING_FINAL_PAYMENT"].includes(project.status)) {
      return NextResponse.json({ success: false, message: "Project is not ready for payment" }, { status: 400 });
    }

    const targetUrl = redirectUrl || `/client/project/${projectId}`;
    const isAdvance = !project.advancePaid;
    const amountToPay = isAdvance ? project.budget * 0.4 : project.budget * 0.6;
    const transactionType = isAdvance ? "ADVANCE_PAYMENT" : "FINAL_PAYMENT";

    const txnid = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const amountStr = amountToPay.toFixed(2);
    const productInfo = `Project_${projectId}`;
    const firstName = user.name?.split(" ")[0] || "Client";

    const hashString = `${process.env.PAYU_MERCHANT_KEY}|${txnid}|${amountStr}|${productInfo}|${firstName}|${user.email}|||||||||||${process.env.PAYU_MERCHANT_SALT}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    await prisma.transaction.create({
      data: {
        projectId: project.id,
        userId: user.id,
        amount: amountToPay,
        type: transactionType,
        status: "PENDING",
        payuTransactionId: txnid,
        payuHash: hash,
      },
    });

    const actionUrl = process.env.PAYU_TEST_SANDBOX === "true" ? "https://test.payu.in/_payment" : "https://secure.payu.in/_payment";
    const baseUrl = process.env.NEXTAUTH_URL;

    return NextResponse.json({
      success: true,
      data: {
        key: process.env.PAYU_MERCHANT_KEY,
        txnid,
        amount: amountStr,
        productinfo: productInfo,
        firstname: firstName,
        email: user.email,
        phone: user.phone || "0000000000",
        hash,
        surl: `${baseUrl}/api/payu/verify?redirect=${encodeURIComponent(targetUrl)}`,
        furl: `${baseUrl}/api/payu/verify?redirect=${encodeURIComponent(targetUrl)}`,
        actionUrl
      }
    }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}