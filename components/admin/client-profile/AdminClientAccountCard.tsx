"use client";
import React, { useState, useEffect } from "react";
import { Edit2, CreditCard, Building2 } from "lucide-react";
import EngineerModal from "@/components/engineer/profile/modals/EngineerModal";
import toast from "react-hot-toast";

export default function AdminClientAccountCard({ payoutData, userId, onUpdate }: { payoutData: any, userId: string, onUpdate: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ preferredMethod: "UPI", upiId: "", accountNumber: "", ifscCode: "", bankName: "", accountHolder: "" });

  useEffect(() => {
    if (isOpen && payoutData) {
      setFormData({
        preferredMethod: payoutData.preferredMethod || "UPI",
        upiId: payoutData.upiId || "",
        accountNumber: payoutData.accountNumber || "",
        ifscCode: payoutData.ifscCode || "",
        bankName: payoutData.bankName || "",
        accountHolder: payoutData.accountHolder || ""
      });
    }
  }, [payoutData, isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutDetail: formData }),
      });
      if (res.ok) { toast.success("Refund details updated"); onUpdate(); setIsOpen(false); }
      else toast.error("Failed to update");
    } catch { toast.error("Error occurred"); }
    finally { setIsSaving(false); }
  };

  return (
    <>
      <div className="p-6 border border-[var(--border)] rounded-2xl bg-white">
        <div className="flex justify-between items-center mb-6 border-b border-[var(--border)] pb-4">
          <h4 className="text-lg font-bold font-inter text-[var(--text-primary)]">Refund Details</h4>
          <button onClick={() => setIsOpen(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[var(--border)] text-sm font-semibold hover:bg-gray-50 transition-colors">
            <Edit2 size={14} /> Edit
          </button>
        </div>

        {!payoutData ? (
          <div className="bg-gray-50 border border-[var(--border)] rounded-xl p-8 flex flex-col items-center justify-center text-center">
            <CreditCard size={32} className="text-gray-300 mb-3" />
            <h5 className="font-semibold text-[var(--text-primary)]">No refund methods added</h5>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-5 border-2 rounded-xl relative ${payoutData.preferredMethod === "UPI" ? "border-[var(--primary)] bg-[#fff4e6]/40" : "border-[var(--border)] bg-gray-50/50"}`}>
              {payoutData.preferredMethod === "UPI" && <span className="absolute top-3 right-3 text-[10px] bg-[var(--primary)] text-white px-2 py-0.5 rounded font-bold uppercase">Preferred</span>}
              <div className="flex items-center gap-2 mb-3"><div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center text-[var(--primary)] shadow-sm"><CreditCard size={14}/></div><p className="font-bold text-sm text-[var(--text-primary)]">UPI ID</p></div>
              <p className="font-mono text-sm text-[var(--text-secondary)]">{payoutData.upiId || "—"}</p>
            </div>

            <div className={`p-5 border-2 rounded-xl relative ${payoutData.preferredMethod === "BANK" ? "border-[var(--primary)] bg-[#fff4e6]/40" : "border-[var(--border)] bg-gray-50/50"}`}>
              {payoutData.preferredMethod === "BANK" && <span className="absolute top-3 right-3 text-[10px] bg-[var(--primary)] text-white px-2 py-0.5 rounded font-bold uppercase">Preferred</span>}
              <div className="flex items-center gap-2 mb-3"><div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center text-[var(--primary)] shadow-sm"><Building2 size={14}/></div><p className="font-bold text-sm text-[var(--text-primary)]">Bank Account</p></div>
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

      <EngineerModal isOpen={isOpen} onClose={() => setIsOpen(false)} className="max-w-[600px]">
        <div className="p-8">
          <h4 className="text-2xl font-bold font-inter text-[var(--text-primary)] mb-6">Edit Refund Configuration</h4>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="p-4 border-2 border-[var(--primary)] bg-[#fff4e6]/30 rounded-xl mb-4">
               <label className="block text-sm font-bold mb-3">Preferred Method</label>
               <div className="flex gap-4">
                  <label className="flex items-center gap-2 font-semibold text-sm cursor-pointer"><input type="radio" checked={formData.preferredMethod === "UPI"} onChange={() => setFormData({...formData, preferredMethod: "UPI"})} className="accent-[var(--primary)]" /> UPI</label>
                  <label className="flex items-center gap-2 font-semibold text-sm cursor-pointer"><input type="radio" checked={formData.preferredMethod === "BANK"} onChange={() => setFormData({...formData, preferredMethod: "BANK"})} className="accent-[var(--primary)]" /> Bank Account</label>
               </div>
            </div>
            <div><label className="block text-sm font-semibold mb-1">UPI ID</label><input value={formData.upiId} onChange={e=>setFormData({...formData, upiId: e.target.value})} className="w-full border rounded-lg p-3 bg-gray-50" /></div>
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-dashed">
              <div className="col-span-2"><label className="block text-xs font-semibold mb-1">Account Holder</label><input value={formData.accountHolder} onChange={e=>setFormData({...formData, accountHolder: e.target.value})} className="w-full border rounded-lg p-3 bg-gray-50" /></div>
              <div className="col-span-1"><label className="block text-xs font-semibold mb-1">Account Number</label><input value={formData.accountNumber} onChange={e=>setFormData({...formData, accountNumber: e.target.value})} className="w-full border rounded-lg p-3 bg-gray-50" /></div>
              <div className="col-span-1"><label className="block text-xs font-semibold mb-1">IFSC</label><input value={formData.ifscCode} onChange={e=>setFormData({...formData, ifscCode: e.target.value.toUpperCase()})} className="w-full border rounded-lg p-3 bg-gray-50" /></div>
              <div className="col-span-2"><label className="block text-xs font-semibold mb-1">Bank Name</label><input value={formData.bankName} onChange={e=>setFormData({...formData, bankName: e.target.value})} className="w-full border rounded-lg p-3 bg-gray-50" /></div>
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t mt-4"><button type="button" onClick={()=>setIsOpen(false)} className="px-5 py-2.5 rounded-lg border font-semibold">Cancel</button><button type="submit" disabled={isSaving} className="px-5 py-2.5 rounded-lg bg-[var(--primary)] text-white font-semibold">{isSaving ? "Saving..." : "Save"}</button></div>
          </form>
        </div>
      </EngineerModal>
    </>
  );
}