"use client";

import { useState } from "react";
import { Wallet, Loader2 } from "lucide-react";

export default function PayoutFormPage() {
  const [method, setMethod] = useState<"UPI" | "BANK">("UPI");
  const [upiId, setUpiId] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (method === "UPI") {
      const upiTrimmed = upiId.trim();
      if (!upiTrimmed) {
        setError("Please enter your UPI ID");
        return;
      }
      
      const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
      if (!upiRegex.test(upiTrimmed)) {
        setError("Invalid UPI ID format. Example: yourname@okicici");
        return;
      }
    }

    if (method === "BANK") {
      const accTrimmed = accountNumber.trim();
      const ifscTrimmed = ifscCode.trim().toUpperCase();
      const bankTrimmed = bankName.trim();
      const holderTrimmed = accountHolder.trim();

      if (!accTrimmed || !ifscTrimmed || !bankTrimmed || !holderTrimmed) {
        setError("All bank details (Account Number, IFSC, Bank Name, Account Holder) are required");
        return;
      }

      const accountRegex = /^\d{9,18}$/;
      if (!accountRegex.test(accTrimmed)) {
        setError("Invalid Account Number. It should be between 9 and 18 digits.");
        return;
      }

      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscRegex.test(ifscTrimmed)) {
        setError("Invalid IFSC Code format. Example: SBIN0001234");
        return;
      }
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/payout/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredMethod: method,
          upiId: method === "UPI" ? upiId.trim() : null,
          accountNumber: method === "BANK" ? accountNumber.trim() : null,
          ifscCode: method === "BANK" ? ifscCode.trim().toUpperCase() : null,
          bankName: method === "BANK" ? bankName.trim() : null,
          accountHolder: method === "BANK" ? accountHolder.trim() : null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      window.location.href = "/api/auth/role-redirect";
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafd] flex flex-col justify-center items-center p-4 font-sans">
      <div className="w-full max-w-[420px] bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-[1rem] bg-[#f0b31e] shadow-lg shadow-yellow-500/30 mx-auto mb-4">
            <Wallet className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">Payout Details</h1>
          <p className="text-gray-500 mt-2 text-sm">Where should we send your payments?</p>
        </div>

        {/* Method Toggle */}
        <div className="flex p-1 mb-6 bg-gray-50 rounded-xl border border-gray-100">
          <button
            type="button"
            onClick={() => { setMethod("UPI"); setError(""); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              method === "UPI"
                ? "bg-white text-[#f0b31e] shadow-sm border border-gray-100"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            UPI
          </button>
          <button
            type="button"
            onClick={() => { setMethod("BANK"); setError(""); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              method === "BANK"
                ? "bg-white text-[#f0b31e] shadow-sm border border-gray-100"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Bank Account
          </button>
        </div>

        {error && (
          <div className="mb-6 text-red-500 text-sm font-medium text-center bg-red-50 p-3 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {method === "UPI" ? (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 ml-1">UPI ID</label>
              <input
                type="text"
                required
                value={upiId}
                onChange={(e) => setUpiId(e.target.value.toLowerCase())}
                placeholder="yourname@bank"
                className="w-full px-4 h-12 rounded-xl border border-gray-200 bg-transparent focus:bg-white focus:border-[#f0b31e] focus:ring-1 focus:ring-[#f0b31e] outline-none transition-all text-sm text-black"
              />
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 ml-1">Account Holder Name</label>
                <input
                  type="text"
                  required
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="Full name as on bank account"
                  className="w-full px-4 h-12 rounded-xl border border-gray-200 bg-transparent focus:bg-white focus:border-[#f0b31e] focus:ring-1 focus:ring-[#f0b31e] outline-none transition-all text-sm text-black"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 ml-1">Account Number</label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter account number"
                  className="w-full px-4 h-12 rounded-xl border border-gray-200 bg-transparent focus:bg-white focus:border-[#f0b31e] focus:ring-1 focus:ring-[#f0b31e] outline-none transition-all text-sm text-black"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 ml-1">IFSC Code</label>
                <input
                  type="text"
                  required
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SBIN0001234"
                  className="w-full px-4 h-12 rounded-xl border border-gray-200 bg-transparent focus:bg-white focus:border-[#f0b31e] focus:ring-1 focus:ring-[#f0b31e] outline-none transition-all text-sm text-black uppercase"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 ml-1">Bank Name</label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. State Bank of India"
                  className="w-full px-4 h-12 rounded-xl border border-gray-200 bg-transparent focus:bg-white focus:border-[#f0b31e] focus:ring-1 focus:ring-[#f0b31e] outline-none transition-all text-sm text-black"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 mt-2 bg-[#f0b31e] hover:bg-[#e0a61a] text-white rounded-xl text-base font-semibold shadow-md shadow-yellow-500/20 transition-all flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save & Finish"}
          </button>

          <button
            type="button"
            onClick={() => { window.location.href = "/api/auth/role-redirect"; }}
            className="w-full h-10 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Skip for now
          </button>
        </form>
      </div>
    </div>
  );
}