"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useAuth();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || auth.isLoading) return;

    // Not logged in
    if (!auth.isAuthenticated) {
      router.replace("/login");
      return;
    }

    // Logged in but not admin
    if (!auth.isAdmin) {
      router.replace("/");
      return;
    }
  }, [
    mounted,
    auth.isLoading,
    auth.isAuthenticated,
    auth.isAdmin,
    router,
  ]);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#f0b31e]" />
      </div>
    );
  }

  // Auth still checking
  if (auth.isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#f0b31e]" />
      </div>
    );
  }

  return <>{children}</>;
}