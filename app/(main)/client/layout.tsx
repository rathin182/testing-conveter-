"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import DashboardShell from "@/components/layout/DashboardShell";

export default function ClientLayout({
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

    // Not authenticated
    if (!auth.isAuthenticated) {
      router.replace("/login");
      return;
    }

    // Not client
    if (!auth.isClient) {
      router.replace("/");
      return;
    }
  }, [
    mounted,
    auth.isLoading,
    auth.isAuthenticated,
    auth.isClient,
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

  // Auth loading
  if (auth.isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#f0b31e]" />
      </div>
    );
  }

  // Prevent protected UI flash

  return (
    <div className="min-h-screen">
      <DashboardShell>
        <div className="transition-all duration-300 ease-in-out">
          <div className="mx-auto max-w-(--breakpoint-2xl) p-4 md:p-6">
            {children}
          </div>
        </div>
      </DashboardShell>
    </div>
  );
}