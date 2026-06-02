"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Loader2,
  Wrench,
  KeyRound,
  ArrowLeft
} from "lucide-react";

export default function EngineerRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpSend, setOtpSend] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "ENGINEER" }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok || !registerData.success) {
        throw new Error(registerData.message || "Registration failed");
      }

      // Send the OTP
      const otpRes = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "VERIFY_EMAIL" }),
      });

      const otpData = await otpRes.json();

      if (!otpRes.ok || !otpData.success) {
        throw new Error("Account created, but failed to send OTP email.");
      }

      setSuccessMsg("We've sent a 6-digit code to your email.");
      // setOtpSend(true);
      setStep(2);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMsg("");

    if (otpCode.length !== 6) {
      setError("Please enter a valid 6-digit code");
      setIsLoading(false);
      return;
    }

    try {
      const verifyRes = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otpCode, type: "VERIFY_EMAIL" }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.message || "Invalid OTP code");
      }

      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        throw new Error("Verified, but failed to log in automatically.");
      }

      window.location.href = "/api/auth/role-redirect";

    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      document.cookie = `oauth_role=ENGINEER; path=/; max-age=120`;

      await signIn("google", { callbackUrl: "/api/auth/role-redirect" });

    } catch (err: any) {
      setError("Google sign in failed");
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const otpRes = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "VERIFY_EMAIL" }),
      });

      const otpData = await otpRes.json();

      if (!otpRes.ok || !otpData.success) {
        throw new Error("Failed to send OTP email.");
      }

      setSuccessMsg("We've sent a new 6-digit code to your email.");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex w-full h-screen">
      <div className="w-[50%] h-screen">
        <div className="min-h-screen flex flex-col justify-center items-center p-4 font-sans relative">
          <div className="w-full flex items-center justify-center p-8 sm:p-10 relative overflow-hidden">

            {/* Step 1: Registration Form */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-120">
                <div className="text-center mb-8">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[1rem] bg-[#f0b31e] shadow-lg shadow-yellow-500/30 mx-auto mb-4">
                    <Wrench className="h-7 w-7 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">
                    Engineer Registration
                    <span className="text-2xl">👀</span>
                  </h1>
                  <p className="text-gray-500 mt-2 text-sm">
                    Join to find projects and showcase your skills
                  </p>
                </div>

                {/* Progress */}
                <div className="relative mb-10 px-1">

                  {/* Background Line */}
                  <div className="absolute top-3.5 left-0 right-0 h-[2px] bg-[#F6E7BB]" />

                  {/* Active Progress */}
                  <div className="absolute top-3.5 left-0 w-1/2 h-[2px]">

                    <div
                      className="
                        w-full
                        h-full
                        bg-gradient-to-r
                        from-[#F0B31E]
                        via-[#F0B31E]
                        to-transparent
                        "
                    />
                  </div>
                  <div className="relative flex justify-between items-center">

                    {/* Step 1 */}
                    <div className="flex flex-col items-start">
                      <div className="w-7 h-7 rounded-full bg-[#F0B31E] text-white flex items-center justify-center text-[12px] font-semibold shadow-md shadow-yellow-500/30">
                        1
                      </div>

                      <p className="text-[10px] text-[#C98F00] mt-2 font-medium">
                        Basic Credentials
                      </p>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-end">
                      <div className="w-7 h-7 rounded-full bg-[#FFF6DF] border border-[#F3DE9A] text-[#C98F00] flex items-center justify-center text-[12px] font-semibold">
                        2
                      </div>

                      <p className="text-[10px] text-[#D4B66A] mt-2 font-medium">
                        Company Details
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mb-6 text-red-500 text-sm font-medium text-center bg-red-50 p-3 rounded-xl border border-red-100">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-4 w-full ">
                  <div className="space-y-1.5 w-full">
                    <label className="text-sm font-medium text-gray-700 ml-1">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-11 pr-4 h-12 rounded-xl border border-gray-200 bg-transparent focus:bg-white focus:border-[#f0b31e] focus:ring-1 focus:ring-[#f0b31e] outline-none transition-all text-sm text-black"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-11 pr-4 h-12 rounded-xl border border-gray-200 bg-transparent focus:bg-white focus:border-[#f0b31e] focus:ring-1 focus:ring-[#f0b31e] outline-none transition-all text-sm text-black"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-11 h-12 rounded-xl border border-gray-200 bg-transparent focus:bg-white focus:border-[#f0b31e] focus:ring-1 focus:ring-[#f0b31e] outline-none transition-all text-sm text-black"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-[#f0b31e] transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 ml-1">Confirm Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-11 h-12 rounded-xl border border-gray-200 bg-transparent focus:bg-white focus:border-[#f0b31e] focus:ring-1 focus:ring-[#f0b31e] outline-none transition-all text-sm text-black"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-[#f0b31e] transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 ml-1">OTP</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      className="w-full pl-11 pr-11 h-12 rounded-xl border border-gray-200 bg-transparent focus:bg-white focus:border-[#f0b31e] focus:ring-1 focus:ring-[#f0b31e] outline-none transition-all text-sm text-black"
                    />
                  </div> */}
                </div>

                <button
                  // onClick={
                  //   otpSend
                  //     ? handleVerifyOtp
                  //     : handleRegister
                  // }
                  onClick={handleRegister}
                  disabled={isLoading}
                  className="w-full h-12 mt-4 bg-[#f0b31e] hover:bg-[#e0a61a] text-white rounded-xl text-base font-semibold shadow-md shadow-yellow-500/20 transition-all flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : otpSend ? (
                    "Verify Account"
                  ) : (
                    "Continue"
                  )}
                </button>

                <div className="relative my-7">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-400 text-xs uppercase tracking-wider font-medium">
                      Or continue with
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full h-12 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign up with Google
                </button>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link href="/login" className="text-[#f0b31e] font-semibold hover:underline">
                      Log In
                    </Link>
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: OTP Verification Form */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500 pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="absolute top-6 left-6 p-2 bg-gray-50 rounded-full text-gray-400 hover:text-[#f0b31e] hover:bg-yellow-50 transition-colors"
                >
                  {/* <ArrowLeft className="h-5 w-5" /> */}
                </button>

                <div className="text-center mb-8 mt-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f0b31e]/10 mx-auto mb-6">
                    <KeyRound className="h-8 w-8 text-[#f0b31e]" />
                  </div>
                  <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">
                    Verify your email
                  </h1>
                  <p className="text-gray-500 mt-2 text-sm px-4">
                    We&apos;ve sent a 6-digit verification code to<br />
                    <span className="font-semibold text-gray-700">{email}</span>
                  </p>
                </div>

                {error && (
                  <div className="mb-6 text-red-500 text-sm font-medium text-center bg-red-50 p-3 rounded-xl border border-red-100">
                    {error}
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="space-y-1.5">
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        className="w-full text-center tracking-[1em] text-2xl font-bold h-16 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-[#f0b31e] focus:ring-4 focus:ring-[#f0b31e]/10 outline-none transition-all text-gray-800"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otpCode.length !== 6}
                    className="w-full h-12 bg-[#f0b31e] hover:bg-[#e0a61a] text-white rounded-xl text-base font-semibold shadow-md shadow-yellow-500/20 transition-all flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify Account"}
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-500">
                    Didn&apos;t receive the code?{" "}
                    <button
                      onClick={handleResendOtp}
                      className="text-[#f0b31e] font-semibold hover:underline"
                    >
                      Click to resend
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="w-[50%] rounded-[40px] relative overflow-hidden p-10 flex flex-col justify-between m-6">

        {/* MAIN YELLOW GRADIENT LIKE REFERENCE IMAGE */}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#FFF6D6_0%,#F8D978_18%,#F0B31E_45%,#E8A400_65%,#FFF1C2_100%)]" />

        {/* Soft White Glow Top Left */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-white/10 blur-[140px] rounded-full" />
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-white/50 blur-[140px] rounded-full" />

        {/* Warm Golden Glow Center */}
        <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-[#FFD65C]/40 blur-[120px] rounded-full" />

        {/* Light Cream Glow Right */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#FFF3CF]/60 blur-[140px] rounded-full" />

        {/* Grain Texture */}
        <div className="absolute inset-0 opacity-[0.12] mix-blend-soft-light bg-[url('https://www.transparenttextures.com/patterns/noise.png')]" />

        {/* Overlay Fade */}
        <div className="absolute inset-0 bg-white/[0.08]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full ">

          <div className="mt-20">
            {/* Logo */}
            <div className="w-24 h-24 bg-white rounded-sm flex items-center justify-center text-black font-bold text-sm shadow-xl">
              LOGO
            </div>

            {/* Hero */}
            <div className="mt-12">
              <h1 className="text-white text-7xl font-extrabold tracking-tight leading-none">
                TECH ENGI
              </h1>

              <p className="text-white/85 text-lg max-w-xl mt-4 leading-relaxed">
                Lorem ipsum dolor sit amet consectetur. Suscipit sed amet commodo vel
                ultrices tortor orci. Enim lectus turpis augue donec. Gravida non
              </p>
            </div>
          </div>

          {/* Bottom */}
          {/* Bottom Section */}
          <div className="mt-auto pt-28">

            {/* Testimonials */}
            <div className="flex gap-6 overflow-hidden">

              {/* Card 1 */}
              <div
                className="
        min-w-[420px]
        rounded-3xl
        border
        border-white/20
        bg-white/[0.12]
        backdrop-blur-2xl
        p-6
        shadow-[0_10px_40px_rgba(255,190,40,0.15)]
      "
              >
                <p className="text-white/90 text-sm leading-relaxed font-medium">
                  Dude, your stuff is the bomb! House rent is the real deal! I
                  STRONGLY recommend house rent to EVERYONE interested in running a
                  successful online business!
                </p>

                <div className="flex items-center gap-3 mt-6">
                  <img
                    src="https://i.pravatar.cc/100?img=32"
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border border-white/30"
                  />

                  <div>
                    <h4 className="text-white font-semibold text-sm">
                      Lana Bernier
                    </h4>

                    <p className="text-white/70 text-xs">
                      Senior Paradigm Strategist
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div
                className="
        min-w-[420px]
        rounded-3xl
        border
        border-white/20
        bg-white/[0.12]
        backdrop-blur-2xl
        p-6
        shadow-[0_10px_40px_rgba(255,190,40,0.15)]
      "
              >
                <p className="text-white/90 text-sm leading-relaxed font-medium">
                  Dude, your stuff is the bomb! House rent is the real deal! I
                  STRONGLY recommend house rent to EVERYONE interested in running a
                  successful online business!
                </p>

                <div className="flex items-center gap-3 mt-6">
                  <img
                    src="https://i.pravatar.cc/100?img=12"
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border border-white/30"
                  />

                  <div>
                    <h4 className="text-white font-semibold text-sm">
                      Lana Bernier
                    </h4>

                    <p className="text-white/70 text-xs">
                      Senior Paradigm Strategist
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end mt-16 gap-4 pr-2">
              <div className="w-32 h-[2px] bg-white/70" />

              <p className="text-white text-3xl font-light tracking-tight">
                Build for connectivity
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}