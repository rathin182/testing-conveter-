"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function EngineerLayout({
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

    // Not engineer
    if (!auth.isEngineer) {
      router.replace("/");
      return;
    }
  }, [
    mounted,
    auth.isLoading,
    auth.isAuthenticated,
    auth.isEngineer,
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

  return <>{children}</>;
}