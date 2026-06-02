"use client";

import { Eye, Edit, Trash2 } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import ConfirmModal from "../ConfirmModal"; 

function PayoutRow({
  payout,
  onView,
  onEdit,
  onDelete,
  readOnly
}: {
  payout: any;
  onView: (proof?: string) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  readOnly?: boolean;
}) {
  const payoutDate = new Date(payout.createdAt).toLocaleDateString();
  const payoutTime = new Date(payout.createdAt).toLocaleTimeString();

  // Status colors
  const isSuccess = payout.status === "SUCCESS";
  const isFailed = payout.status === "FAILED";
  const borderColor = isSuccess ? "border-green-500" : isFailed ? "border-red-500" : "border-[var(--border)]";
  const badgeColor = isSuccess ? "bg-green-100 text-green-700" : isFailed ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700";

  const isClient = payout.user?.role === "CLIENT";

  return (
    <div className={`flex items-center justify-between border ${borderColor} rounded-xl p-4 mb-3 bg-white`}>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <p className=" text-sm">
            <span className="font-semibold text-[13px]" style={{ color: "var(--text-primary)" }}>
              Amount:
            </span>{" "}
            <span style={{ color: "var(--text-secondary)" }}>
              ₹{payout.amount}
            </span>
          </p>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeColor}`}>
            {payout.status}
          </span>
        </div>

        <p className=" text-sm">
          <span className="font-semibold text-[13px]" style={{ color: "var(--text-primary)" }}>
            Paid By:
          </span>{" "}
          <span style={{ color: "var(--text-muted)" }}>{payout.user?.name || "Anonymous"}</span>
        </p>

        <p className=" text-sm">
          <span className="font-semibold text-[13px]" style={{ color: "var(--text-primary)" }}>
            Date:
          </span>{" "}
          <span style={{ color: "var(--text-muted)" }}>{payoutDate}</span>
        </p>

        <p className=" text-sm">
          <span className="font-semibold text-[13px]" style={{ color: "var(--text-primary)" }}>
            Time:
          </span>{" "}
          <span style={{ color: "var(--text-muted)" }}>{payoutTime}</span>
        </p>

        <p className=" text-sm">
          <span className="font-semibold text-[13px]" style={{ color: "var(--text-primary)" }}>
            Payment ID:
          </span>{" "}
          <span className="font-mono text-xs px-2 py-1 rounded-md ml-1" style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
            {payout.razorpayPaymentId || payout.payuPaymentId || "Id Not Found!"}
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-2 min-w-[100px] items-end">
        {!isClient && (
          <button
            onClick={() => onView(payout?.proof || "/two-guys.png")}
            className="flex items-center justify-center w-full gap-1 text-sm px-3 py-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--bg)] transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            <Eye size={14} />
            Proof
          </button>
        )}

        {!readOnly && (
          <div className="flex gap-2 w-full mt-1">
            <button 
              onClick={onEdit} 
              className="flex-1 flex justify-center items-center py-1.5 rounded-lg border border-[var(--border)] text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Edit size={14} />
            </button>
            <button 
              onClick={onDelete} 
              className="flex-1 flex justify-center items-center py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PayoutHistory({ 
  transactions, 
  onEdit, 
  onMutate, 
  readOnly = false 
}: { 
  transactions: any[], 
  onEdit?: (tx: any) => void, 
  onMutate?: () => void, 
  readOnly?: boolean 
}) {
  const [proofModal, setProofModal] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deleteId || !onMutate) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/ledger/${deleteId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Transaction deleted successfully");
        onMutate();
      } else {
        toast.error(data.message || "Failed to delete transaction");
      }
    } catch {
      toast.error("An error occurred while deleting");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <>
      <div className="rounded-xl flex-1 border border-[var(--border)] bg-white p-5 h-full">
        <h3 className="text-lg font-semibold  mb-4" style={{ color: "var(--text-primary)" }}>
          Payout History
        </h3>

        {transactions.length > 0 ? (
          <div className="space-y-2">
            {transactions.map((p: any) => (
              <PayoutRow
                key={p.id}
                payout={p}
                readOnly={readOnly}
                onView={(proof) => setProofModal(proof || null)}
                onEdit={onEdit ? () => onEdit(p) : undefined}
                onDelete={() => setDeleteId(p.id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-center py-10 " style={{ color: "var(--text-muted)" }}>
            No payouts yet.
          </p>
        )}
      </div>

      {!readOnly && (
        <ConfirmModal 
          isOpen={!!deleteId}
          title="Delete Transaction"
          message="Are you sure you want to permanently delete this transaction? The payment proof will also be deleted."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
          isLoading={isDeleting}
          isDanger={true}
        />
      )}

      {proofModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl p-5 max-w-lg w-full shadow-2xl relative">
            <h2 className="font-semibold mb-3 " style={{ color: "var(--text-primary)" }}>
              Payment Proof
            </h2>
            <div className="bg-gray-50 rounded-lg border border-[var(--border)] p-2 flex items-center justify-center overflow-hidden min-h-[200px]">
              <img
                src={proofModal}
                alt="Payment Proof"
                className="max-h-[60vh] object-contain rounded"
              />
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setProofModal(null)}
                className="px-5 py-2 rounded-lg text-white text-sm transition-colors"
                style={{ background: "var(--primary)" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}