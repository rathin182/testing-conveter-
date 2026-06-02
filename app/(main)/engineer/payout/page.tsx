"use client";
import { useState, useEffect } from "react";
import { DollarSign, Wallet, Clock, CheckCircle, CreditCard, Landmark } from "lucide-react";
import DashboardShell from "@/components/layout/DashboardShell";

interface Transaction {
  id: string;
  amount: number;
  status: string;
  type: string;
  createdAt: string;
  project?: { title: string };
}

interface Stats {
  totalReceived: number;
  totalPending: number;
}

export default function EngineerPayoutPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<Stats>({ totalReceived: 0, totalPending: 0 });
  const [hasPayoutDetails, setHasPayoutDetails] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // Fetch Transaction History
      const historyRes = await fetch("/api/payout/history");
      if (historyRes.ok) {
        const data = await historyRes.json();
        if (data.success) {
          setTransactions(data.transactions || []);
          setStats(data.stats || { totalReceived: 0, totalPending: 0 });
        }
      }

      // Fetch Payout Details Status
      const detailsRes = await fetch("/api/payout/details");
      if (detailsRes.ok) {
        const data = await detailsRes.json();
        if (data.success) {
          setHasPayoutDetails(!!data.payoutDetails);
        }
      }
    } catch (err) {
      console.error("Failed to fetch payout data:", err);
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString: string | Date) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-IN", { 
        day: "2-digit", 
        month: "short", 
        year: "numeric" 
      });
    } catch {
      return "N/A";
    }
  };

  const getStatusStyle = (status: string) => {
    if (status === "SUCCESS") {
      return "bg-green-50 text-green-700 border-green-200";
    } else if (status === "PENDING") {
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }
    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-[80vh]">
          <div 
            className="animate-spin rounded-full h-10 w-10 border-b-2" 
            style={{ borderColor: "var(--primary)" }} 
          />
        </div>
      </DashboardShell>
    );
  }

  const totalPotential = stats.totalReceived + stats.totalPending;
  const lastPayout = transactions.find(t => t.status === "SUCCESS");

  return (
    <DashboardShell>
      <div className="space-y-6 p-1">
        <h1 className="text-2xl font-bold " style={{ color: "var(--text-primary)" }}>
          My Payouts
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* 1. Total Potential Earnings */}
          <div className="rounded-xl p-5 text-white" style={{ background: "var(--primary)" }}>
            <Wallet size={28} className="opacity-70 mb-3" />
            <p className="text-xs ">Total Earnings</p>
            <p className="text-2xl font-bold  mt-0.5">₹{totalPotential.toLocaleString()}</p>
          </div>

          {/* 2. Amount Received */}
          <div className="rounded-xl p-5 bg-white border border-[var(--border)]">
            <CheckCircle size={28} className="text-green-500 mb-3" />
            <p className="text-xs " style={{ color: "var(--text-muted)" }}>
              Amount Received
            </p>
            <p className="text-2xl font-bold  mt-0.5" style={{ color: "var(--text-primary)" }}>
              ₹{stats.totalReceived.toLocaleString()}
            </p>
            <p className="text-xs mt-1  text-green-600">Successfully paid out</p>
          </div>

          {/* 3. Amount Pending */}
          <div className="rounded-xl p-5 bg-white border border-[var(--border)]">
            <Clock size={28} className="text-yellow-500 mb-3" />
            <p className="text-xs " style={{ color: "var(--text-muted)" }}>
              Amount Pending
            </p>
            <p className="text-2xl font-bold  mt-0.5" style={{ color: "var(--text-primary)" }}>
              ₹{stats.totalPending.toLocaleString()}
            </p>
            <p className="text-xs mt-1  text-yellow-600">Awaiting release</p>
          </div>

          {/* 4. Bank Details Status */}
          <div className="rounded-xl p-5 bg-white border border-[var(--border)]">
            <Landmark size={28} className={hasPayoutDetails ? "text-blue-500 mb-3" : "text-red-500 mb-3"} />
            <p className="text-xs " style={{ color: "var(--text-muted)" }}>
              Bank Details
            </p>
            <p className="text-lg font-bold  mt-0.5" style={{ color: "var(--text-primary)" }}>
              {hasPayoutDetails ? "Configured" : "Missing"}
            </p>
            <p className={`text-xs mt-1  ${hasPayoutDetails ? "text-blue-600" : "text-red-600"}`}>
              {hasPayoutDetails ? "Ready for payouts" : "Please add in Profile"}
            </p>
          </div>

          {/* 5. Last Payment */}
          <div className="rounded-xl p-5 bg-white border border-[var(--border)]">
            <CreditCard size={28} className="text-purple-500 mb-3" />
            <p className="text-xs " style={{ color: "var(--text-muted)" }}>
              Last Payment
            </p>
            {lastPayout ? (
              <>
                <p className="text-sm font-bold  mt-0.5" style={{ color: "var(--text-primary)" }}>
                  ₹{lastPayout.amount.toLocaleString()}
                </p>
                <p className="text-xs  mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                  {lastPayout.project?.title || "Project"}
                </p>
                <p className="text-xs  mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {formatDate(lastPayout.createdAt)}
                </p>
              </>
            ) : (
              <p className="text-sm  mt-1" style={{ color: "var(--text-muted)" }}>
                No payments yet
              </p>
            )}
          </div>
        </div>

        {/* Payout History */}
        <div className="bg-white rounded-xl border border-[var(--border)]">
          <div className="p-5 border-b border-[var(--border)]">
            <h2 className="text-lg font-bold " style={{ color: "var(--text-primary)" }}>
              Payout History
            </h2>
            <p className="text-sm  mt-0.5" style={{ color: "var(--text-muted)" }}>
              All your payout transactions
            </p>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-16">
              <DollarSign className="mx-auto mb-3" size={40} style={{ color: "var(--border)" }} />
              <p className=" text-sm" style={{ color: "var(--text-muted)" }}>
                No payout history yet
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {transactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between px-5 py-4 hover:bg-[var(--bg)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: "var(--primary-light)" }}
                    >
                      <CreditCard size={16} style={{ color: "var(--primary)" }} />
                    </div>
                    <div>
                      <p className="font-semibold  text-sm" style={{ color: "var(--text-primary)" }}>
                        {t.project?.title || "Unknown Project"}
                      </p>
                      <p className="text-xs  mt-0.5" style={{ color: "var(--text-muted)" }}>
                        Engineer Payout • {formatDate(t.createdAt)}
                      </p>
                      <p className="text-xs font-mono mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {t.id.slice(0, 18)}...
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1.5">
                    <p className="font-bold " style={{ color: "var(--text-primary)" }}>
                      ₹{t.amount.toLocaleString()}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full border  ${getStatusStyle(t.status)}`}>
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}