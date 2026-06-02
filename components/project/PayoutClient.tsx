"use client";

import React from "react";
import PayoutHistory from "./PayoutHistory";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { usePayment } from "@/hooks/usePayment";

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-5">
      <p className="text-sm font-inter" style={{ color: "var(--text-muted)" }}>
        {title}
      </p>
      <h2
        className="text-2xl font-bold mt-1 font-inter"
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

export default function PayoutClient({ projectId }: Props) {
  const { data, isLoading, mutate } = useSWR(`/api/payout/${projectId}`, fetcher);
  const { processPayment, loading: paymentLoading } = usePayment();
  
  const stats = data?.stats ?? {};
  const transactions = data?.transactions ?? []; 
  
  const clientTransactions = transactions.filter((t: any) => 
    ["ADVANCE_PAYMENT", "FINAL_PAYMENT", "REFUND_CLIENT"].includes(t.type)
  );
  
  const budget = stats?.budget ?? 0;
  const projectProgress = stats?.progress ?? 0;
  const remaining = stats?.remaining ?? 0;
  
  const canPay = projectProgress === 100 && remaining > 0;
  
  const lastTransaction = stats?.lastTransaction ?? {};
  const lastTransactionAmount = lastTransaction?.amount ?? 0;
  const lastTransactionDate = lastTransaction?.date 
    ? new Date(lastTransaction.date).toLocaleDateString() 
    : "No payments yet";

  const handlePayment = () => {
    processPayment({
      projectId,
      redirectPath: `/client/project/${projectId}`,
      description: "Final Payment (60%)",
      onSuccess: () => {
        mutate(); 
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold font-inter" style={{ color: "var(--text-primary)" }}>
          Client Payments
        </h2>
        <p className="text-sm mt-1 font-inter" style={{ color: "var(--text-muted)" }}>
          Manage your payments and remaining balance.
        </p>
      </div>

      {/* TOP BOXES */}
      <div className="grid md:grid-cols-2 gap-4">
        <SummaryCard
          title="Total Budget"
          value={`₹${budget.toLocaleString()}`}
        />
        <SummaryCard
          title="Last Payment"
          value={lastTransactionAmount > 0 ? `₹${lastTransactionAmount.toLocaleString()} • ${lastTransactionDate}` : "No payments yet"}
        />
      </div>

      {/* LOWER SECTION */}
      <div className="flex flex-col lg:flex-row gap-4">
        
        <div className="flex-1">
          <PayoutHistory 
            transactions={clientTransactions} 
            readOnly={true} 
          />
        </div>

        {/* CONDITIONAL PAYMENT BOX */}
        <div className="rounded-xl w-full lg:w-96 border border-[var(--border)] bg-white p-6 flex flex-col h-fit">
          <div>
            <h3 className="text-lg font-semibold font-inter mb-4" style={{ color: "var(--text-primary)" }}>
              Pending Action
            </h3>

            {!canPay ? (
              <p className="text-sm font-inter text-[var(--text-muted)] bg-[var(--bg)] p-4 rounded-lg border border-[var(--border)] text-center">
                No pending payments.
                {remaining > 0 && " Final payment will be enabled once the project reaches 100% completion."}
              </p>
            ) : (
              <>
                <p className="text-sm font-inter text-[var(--text-muted)] mb-2">
                  You need to pay the remaining 60% amount for project completion.
                </p>

                <h2 className="text-3xl font-bold mb-6 font-inter" style={{ color: "var(--text-primary)" }}>
                  ₹{remaining.toLocaleString()}
                </h2>

                <button
                  onClick={handlePayment}
                  disabled={paymentLoading}
                  className="w-full py-3 rounded-lg text-white text-sm font-bold shadow-md transition-colors mt-2 disabled:opacity-50 flex justify-center items-center font-inter"
                  style={{ background: "var(--primary)" }}
                >
                  {paymentLoading ? "Processing..." : `Pay ₹${remaining.toLocaleString()}`}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}