"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import PayoutHistory from "./PayoutHistory";

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-5">
      <p className="text-sm " style={{ color: "var(--text-muted)" }}>
        {title}
      </p>
      <h2
        className="text-2xl font-bold mt-1"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </h2>
    </div>
  );
}

interface Props {
  projectId: string;
}

export default function PayoutEngineer({ projectId }: Props) {
  const { data, isLoading } = useSWR(`/api/payout/${projectId}`, fetcher);
  
  const stats = data?.stats ?? {};
  const transactions = data?.transactions ?? [];

  // Filter so the engineer only sees their own payout transactions
  const engineerTransactions = transactions.filter(
    (t: any) => t.type === "PAYOUT_ENGINEER"
  );

  if (isLoading) {
    return (
      <div className="h-[60vh] flex justify-center items-center">
        <Loader2 color="var(--primary)" size={25} className="animate-spin" />
      </div>
    );
  }

  const budget = stats.budget ?? 0;
  const amountPaid = stats.amountPaid ?? 0;
  const amountPending = stats.amountPending ?? 0;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2
          className="text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Payouts
        </h2>
        <p
          className="text-sm mt-1 "
          style={{ color: "var(--text-muted)" }}
        >
          Track payments and transaction history.
        </p>
      </div>

      {/* TOP BOXES */}
      <div className="grid md:grid-cols-2 gap-4">
        <SummaryCard 
          title="Total Payout Amount" 
          value={`₹${budget.toLocaleString()}`} 
        />
        <SummaryCard
          title="Paid / Pending"
          value={`₹${amountPaid.toLocaleString()} / ₹${amountPending.toLocaleString()}`}
        />
      </div>

      {/* PAYOUT HISTORY (Read Only Mode) */}
      <PayoutHistory 
        transactions={engineerTransactions} 
        readOnly={true} 
      />
    </div>
  );
}