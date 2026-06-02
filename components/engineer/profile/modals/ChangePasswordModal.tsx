"use client";

import React, { useState } from "react";
import EngineerModal from "./EngineerModal";
import toast from "react-hot-toast";

export default function ChangePasswordModal({ isOpen, onClose, user }: { isOpen: boolean, onClose: () => void, user: any }) {
  const [step, setStep] = useState(0); 
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        body: JSON.stringify({ email: user.email, type: "RESET_PASSWORD" })
      });
      if (res.ok) { toast.success("OTP sent to your email!"); setStep(1); }
      else toast.error("Failed to send OTP");
    } catch { toast.error("Error sending OTP"); } 
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        body: JSON.stringify({ email: user.email, code, type: "RESET_PASSWORD" })
      });
      if (res.ok) { toast.success("OTP Verified!"); setStep(2); }
      else toast.error("Invalid or expired OTP");
    } catch { toast.error("Verification failed"); } 
    finally { setLoading(false); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if(newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email: user.email, newPassword })
      });
      if (res.ok) { 
        toast.success("Password updated!"); 
        setStep(0); setCode(""); setNewPassword(""); onClose(); 
      } else toast.error("Failed to reset password");
    } catch { toast.error("Error resetting password"); } 
    finally { setLoading(false); }
  };

  return (
    <EngineerModal isOpen={isOpen} onClose={onClose} className="max-w-[450px]">
      <div className="p-8">
        <h4 className="text-2xl font-bold font-inter text-[var(--text-primary)] mb-2">Change Password</h4>
        <p className="text-sm text-[var(--text-muted)] font-inter mb-6">Verify your identity via email to change your password.</p>

        {step === 0 && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-[var(--text-secondary)]">We will send a 6-digit OTP to:</p>
            <p className="text-sm bg-gray-50 border border-[var(--border)] p-3 rounded-lg font-mono">{user.email}</p>
            <button onClick={handleSendOtp} disabled={loading} className="w-full py-2.5 rounded-lg bg-[var(--primary)] text-white font-semibold shadow-md">
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Enter 6-Digit OTP</label>
              <input required value={code} onChange={e => setCode(e.target.value)} maxLength={6} placeholder="123456" className="w-full border border-[var(--border)] rounded-lg p-3 outline-none focus:border-[var(--primary)] text-center tracking-widest text-lg font-bold" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-[var(--primary)] text-white font-semibold shadow-md">
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">New Password</label>
              <input required type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" className="w-full border border-[var(--border)] rounded-lg p-3 outline-none focus:border-[var(--primary)]" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-[var(--primary)] text-white font-semibold shadow-md">
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </EngineerModal>
  );
}