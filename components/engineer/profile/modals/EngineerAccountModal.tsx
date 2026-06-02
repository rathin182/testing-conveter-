"use client";

import React, { useState, useEffect } from "react";
import EngineerModal from "./EngineerModal";
import toast from "react-hot-toast";

export default function EngineerAccountModal({ isOpen, onClose, payoutData, onUpdate }: { isOpen: boolean, onClose: () => void, payoutData: any, onUpdate: () => void }) {
  const [saving, setSaving] = useState(false);
  const [preferredMethod, setPreferredMethod] = useState("UPI");
  const [upiId, setUpiId] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountHolder, setAccountHolder] = useState("");

  useEffect(() => {
    if (isOpen) {
      setPreferredMethod(payoutData?.preferredMethod || "UPI");
      setUpiId(payoutData?.upiId || "");
      setAccountNumber(payoutData?.accountNumber || "");
      setIfscCode(payoutData?.ifscCode || "");
      setBankName(payoutData?.bankName || "");
      setAccountHolder(payoutData?.accountHolder || "");
    }
  }, [payoutData, isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { preferredMethod, upiId, accountNumber, ifscCode, bankName, accountHolder };
      const res = await fetch("/api/payout/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) { toast.success("Payout details saved"); onUpdate(); onClose(); } 
      else toast.error(data.message);
    } catch { toast.error("Failed to save details"); } 
    finally { setSaving(false); }
  };

  return (
    <EngineerModal isOpen={isOpen} onClose={onClose} className="max-w-[600px]">
      <div className="p-8">
        <h4 className="text-2xl font-bold font-inter text-[var(--text-primary)] mb-2">Payout Configuration</h4>
        <p className="text-sm text-[var(--text-muted)] font-inter mb-6">Fill in BOTH details if needed, then choose which one to set as your Preferred Method for receiving payouts.</p>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="p-4 border-2 border-[var(--primary)] bg-[#fff4e6]/30 rounded-xl">
             <label className="block text-sm font-bold text-[var(--text-primary)] mb-3">Which method do you prefer to use?</label>
             <div className="flex gap-4">
                <label className="flex items-center gap-2 font-semibold text-sm cursor-pointer">
                  <input type="radio" name="preference" checked={preferredMethod === "UPI"} onChange={() => setPreferredMethod("UPI")} className="accent-[var(--primary)] w-4 h-4" /> UPI Transfer
                </label>
                <label className="flex items-center gap-2 font-semibold text-sm cursor-pointer">
                  <input type="radio" name="preference" checked={preferredMethod === "BANK"} onChange={() => setPreferredMethod("BANK")} className="accent-[var(--primary)] w-4 h-4" /> Bank Account
                </label>
             </div>
          </div>

          <div className="space-y-4">
            <h5 className="font-bold border-b pb-2">UPI Details</h5>
            <input value={upiId} onChange={e => setUpiId(e.target.value)} required={preferredMethod==="UPI"} placeholder="yourname@bank" className="w-full border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-[var(--primary)] bg-gray-50/50" />
          </div>

          <div className="space-y-4">
            <h5 className="font-bold border-b pb-2">Bank Account Details</h5>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-semibold mb-1 block">Account Holder</label>
                <input value={accountHolder} onChange={e => setAccountHolder(e.target.value)} required={preferredMethod==="BANK"} className="w-full border rounded-lg p-2.5 outline-none focus:border-[var(--primary)] bg-gray-50/50" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs font-semibold mb-1 block">Account Number</label>
                <input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} required={preferredMethod==="BANK"} className="w-full border rounded-lg p-2.5 outline-none focus:border-[var(--primary)] bg-gray-50/50" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs font-semibold mb-1 block">IFSC Code</label>
                <input value={ifscCode} onChange={e => setIfscCode(e.target.value)} required={preferredMethod==="BANK"} className="w-full border rounded-lg p-2.5 outline-none focus:border-[var(--primary)] bg-gray-50/50" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold mb-1 block">Bank Name</label>
                <input value={bankName} onChange={e => setBankName(e.target.value)} required={preferredMethod==="BANK"} className="w-full border rounded-lg p-2.5 outline-none focus:border-[var(--primary)] bg-gray-50/50" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border)] mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-[var(--border)] font-semibold hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-lg bg-[var(--primary)] text-white font-semibold shadow-md">
              {saving ? "Saving..." : "Save Payout Setup"}
            </button>
          </div>
        </form>
      </div>
    </EngineerModal>
  );
}