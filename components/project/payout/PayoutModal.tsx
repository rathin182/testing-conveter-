"use client";

import React, { useState, useEffect } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: any;
  onSuccess: () => void;
}

export default function PaymentModal({ isOpen, onClose, transaction, onSuccess }: PaymentModalProps) {
  const [txId, setTxId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("UPI");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transaction && isOpen) {
      setTxId(transaction.razorpayPaymentId || "");
      setAmount(transaction.amount?.toString() || "");
      setMethod(transaction.razorpaySignature || "UPI");
      setDate(transaction.completedAt ? new Date(transaction.completedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      setStatus(transaction.status === "SUCCESS" ? "SUCCESS" : transaction.status === "FAILED" ? "FAILED" : "PENDING");
      setPreviewUrl(transaction.proof || null);
      setFile(null);
    }
  }, [transaction, isOpen]);

  if (!isOpen || !transaction) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl(transaction.proof || null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    formData.append("manualTxId", txId);
    formData.append("amount", amount);
    formData.append("method", method);
    formData.append("date", date);
    formData.append("status", status);
    if (file) formData.append("file", file);

    try {
      const res = await fetch(`/api/admin/ledger/${transaction.id}`, {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Payment saved successfully!");
        onSuccess();
        onClose();
      } else toast.error(data.message);
    } catch (err) {
      toast.error("Failed to save payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6 relative max-h-[95vh] overflow-y-auto shadow-2xl">
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full p-1.5 transition-colors">
          <X size={18} />
        </button>
        
        <h2 className="text-2xl font-bold text-[var(--text-primary)]  mb-6 border-b border-[var(--border)] pb-4">
          {transaction.status === "PENDING" ? "Process Payment" : "Edit Payment"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5  text-sm">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block font-semibold text-[var(--text-secondary)] mb-1.5">Transaction ID *</label>
              <input required value={txId} onChange={e => setTxId(e.target.value)} placeholder="TXN_123456" className="w-full border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-[var(--primary)] bg-gray-50/50" />
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-secondary)] mb-1.5">Amount (₹) *</label>
              <input required type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="5000" className="w-full border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-[var(--primary)] bg-gray-50/50" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block font-semibold text-[var(--text-secondary)] mb-1.5">Payment Method *</label>
              <select value={method} onChange={e => setMethod(e.target.value)} className="w-full border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-[var(--primary)] bg-gray-50/50">
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-secondary)] mb-1.5">Payment Status *</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-[var(--primary)] bg-gray-50/50">
                <option value="PENDING">Pending</option>
                <option value="SUCCESS">Completed</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-secondary)] mb-1.5">Payment Date *</label>
            <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-[var(--primary)] bg-gray-50/50" />
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-secondary)] mb-2">Payment Proof Image</label>
            
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:bg-gray-50 hover:border-[var(--primary)] transition-all h-40">
                <Upload size={24} className="text-gray-400 mb-2" />
                <span className="text-gray-600 font-medium">Click to upload proof</span>
                <span className="text-xs text-gray-400 mt-1">PNG, JPG, WebP allowed</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>

              {/* Image Preview Box */}
              <div className="w-full md:w-40 h-40 border border-[var(--border)] rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center shrink-0 relative">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-gray-400">
                    <ImageIcon size={24} className="mx-auto mb-1 opacity-50" />
                    <span className="text-xs">No image</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-[var(--border)]">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] font-medium hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="px-6 py-2.5 rounded-lg text-white font-medium disabled:opacity-50 transition-colors shadow-sm"
              style={{ background: "var(--primary)" }}
            >
              {loading ? "Saving..." : "Save Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}