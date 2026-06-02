"use client";

import { useRazorpay } from "./useRazorpay";
import { usePayu } from "./usePayu";

interface PaymentOptions {
  projectId: string;
  redirectPath: string;
  user?: { name?: string | null; email?: string | null };
  description?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onDismiss?: () => void;
}

export function usePayment() {
  const { initiatePayment: payRazorpay, loading: rzpLoading } = useRazorpay();
  const { initiatePayuPayment: payPayu, loading: payuLoading } = usePayu();

  const loading = rzpLoading || payuLoading;

  const processPayment = async (options: PaymentOptions) => {
    const gateway = process.env.NEXT_PUBLIC_GATEWAY || "RAZORPAY";

    if (gateway === "PAYU") {
      const fullRedirectUrl = `${window.location.origin}${options.redirectPath}`;
      await payPayu(options.projectId, fullRedirectUrl);
    } 
    else {
      await payRazorpay({
        projectId: options.projectId,
        user: options.user,
        description: options.description,
        onSuccess: options.onSuccess,
        onError: options.onError,
        onDismiss: options.onDismiss,
      });
    }
  };

  return { processPayment, loading };
}