"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      window.location.href = "/api/auth/role-redirect";

    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/api/auth/role-redirect" });
  };

  return (
    <div className="flex w-full h-screen">
      <div className="w-[50%] h-screen">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-130 bg-white h-full  p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">Welcome Back <span>👋</span></h1>
              <p className="text-sm text-gray-500 mt-2">Log in to your Arinova account</p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleCredentialsLogin} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 h-12 rounded-xl border border-gray-200 bg-transparent focus:bg-white focus:border-[#f0b31e] focus:ring-1 focus:ring-[#f0b31e] outline-none transition-all text-sm text-black"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium text-gray-700 ml-1">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs text-[#f0b31e] hover:text-yellow-600 transition-colors font-medium">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-11 h-12 rounded-xl border border-gray-200 bg-transparent focus:bg-white focus:border-[#f0b31e] focus:ring-1 focus:ring-[#f0b31e] outline-none transition-all text-sm text-black"
                    placeholder="••••••••"
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

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#f0b31e] hover:bg-[#e0a61a] text-white rounded-xl text-base font-semibold shadow-md shadow-yellow-500/20 transition-all flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-8 flex items-center justify-center space-x-4">
              <div className="h-px bg-gray-100 w-full"></div>
              <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">OR</span>
              <div className="h-px bg-gray-100 w-full"></div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="mt-6 w-full h-12 flex items-center justify-center space-x-3 border border-gray-200 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Sign up with Google</span>
            </button>

            {/* <p className="mt-8 text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-[#f0b31e] hover:underline font-semibold">
                Register here
              </Link>
            </p> */}
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