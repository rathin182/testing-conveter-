"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, Building2, Edit2 } from "lucide-react";
import toast from "react-hot-toast";
import EngineerAccountModal from "./modals/EngineerAccountModal";

export default function EngineerAccountCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [payoutData, setPayoutData] = useState<any>(null);

  useEffect(() => { fetchPayoutDetails(); }, []);

  const fetchPayoutDetails = async () => {
    try {
      const res = await fetch("/api/payout/details");
      const data = await res.json();
      if (data.success) setPayoutData(data.payoutDetails);
    } catch { toast.error("Failed to load payout details"); }
  };

  return (
    <>
      <div className="p-6 border border-[var(--border)] rounded-2xl bg-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-[var(--border)] pb-4">
          <h4 className="text-lg font-bold font-inter text-[var(--text-primary)]">Payout Details</h4>
          <button onClick={() => setIsOpen(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[var(--border)] text-sm font-semibold hover:bg-gray-50 transition-colors">
            <Edit2 size={14} /> Edit
          </button>
        </div>

        {!payoutData ? (
          <div className="bg-gray-50 border border-[var(--border)] rounded-xl p-8 flex flex-col items-center justify-center text-center">
            <CreditCard size={32} className="text-gray-300 mb-3" />
            <h5 className="font-semibold text-[var(--text-primary)]">No payout methods added</h5>
            <p className="text-sm text-[var(--text-muted)] mt-1 max-w-sm">Setup your UPI or Bank details to receive your project earnings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-5 border-2 rounded-xl relative ${payoutData.preferredMethod === "UPI" ? "border-[var(--primary)] bg-[#fff4e6]/40" : "border-[var(--border)] bg-gray-50/50"}`}>
              {payoutData.preferredMethod === "UPI" && <span className="absolute top-3 right-3 text-[10px] bg-[var(--primary)] text-white px-2 py-0.5 rounded font-bold uppercase">Preferred</span>}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-white border border-[var(--border)] flex items-center justify-center text-[var(--primary)] shadow-sm"><CreditCard size={14}/></div>
                <p className="font-bold text-sm text-[var(--text-primary)]">UPI ID</p>
              </div>
              <p className="font-mono text-sm text-[var(--text-secondary)]">{payoutData.upiId || "—"}</p>
            </div>

            <div className={`p-5 border-2 rounded-xl relative ${payoutData.preferredMethod === "BANK" ? "border-[var(--primary)] bg-[#fff4e6]/40" : "border-[var(--border)] bg-gray-50/50"}`}>
              {payoutData.preferredMethod === "BANK" && <span className="absolute top-3 right-3 text-[10px] bg-[var(--primary)] text-white px-2 py-0.5 rounded font-bold uppercase">Preferred</span>}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-white border border-[var(--border)] flex items-center justify-center text-[var(--primary)] shadow-sm"><Building2 size={14}/></div>
                <p className="font-bold text-sm text-[var(--text-primary)]">Bank Account</p>
              </div>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm font-inter text-[var(--text-secondary)]">
                <div><span className="font-semibold text-[var(--text-primary)] text-xs block">Holder</span> {payoutData.accountHolder || "—"}</div>
                <div><span className="font-semibold text-[var(--text-primary)] text-xs block">Bank</span> {payoutData.bankName || "—"}</div>
                <div><span className="font-semibold text-[var(--text-primary)] text-xs block">A/C No</span> {payoutData.accountNumber || "—"}</div>
                <div><span className="font-semibold text-[var(--text-primary)] text-xs block">IFSC</span> {payoutData.ifscCode || "—"}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <EngineerAccountModal isOpen={isOpen} onClose={() => setIsOpen(false)} payoutData={payoutData} onUpdate={fetchPayoutDetails} />
    </>
  );
}