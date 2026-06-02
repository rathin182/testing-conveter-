"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface RazorpayUser {
  name?: string | null;
  email?: string | null;
}

interface RazorpayOptions {
  projectId: string;
  user?: RazorpayUser;
  description?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onDismiss?: () => void;
}

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      return resolve(true);
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const useRazorpay = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiatePayment = async (options: RazorpayOptions) => {
    const { projectId, user, description, onSuccess, onError, onDismiss } = options;

    try {
      setLoading(true);
      setError(null);

      // Ensure Razorpay SDK is loaded
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        const errorMsg = "Razorpay SDK failed to load. Are you online?";
        toast.error(errorMsg);
        setError(errorMsg);
        onError?.(errorMsg);
        setLoading(false);
        return;
      }

      // Create the Order
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        const errorMsg = orderData.message || "Failed to create payment order";
        toast.error(errorMsg);
        setError(errorMsg);
        onError?.(errorMsg);
        setLoading(false);
        return;
      }

      const autoDescription = orderData.order.notes?.type === "ADVANCE_PAYMENT" 
        ? "Advance Payment (40%)" 
        : "Final Payment (60%)";

      // Open Razorpay Widget
      const rzpOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: orderData.order.id,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Tech Engi",
        description: description || autoDescription,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: { color: "#FFAE58" },
        
        handler: async (response: any) => {
          try {
            setLoading(true);
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              toast.success("Payment successful!");
              onSuccess?.();
            } else {
              const errorMsg = verifyData.message || "Payment verification failed";
              toast.error(errorMsg);
              setError(errorMsg);
              onError?.(errorMsg);
            }
          } catch {
            const errorMsg = "Payment verification failed";
            toast.error(errorMsg);
            setError(errorMsg);
            onError?.(errorMsg);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: async () => {
            toast.error("Payment cancelled");
            
            try {
              await fetch("/api/razorpay/failed", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ razorpay_order_id: orderData.order.id }),
              });
            } catch {
              console.error("Failed to cancel payment status on server");
            }

            setLoading(false);
            onDismiss?.();
          },
        },
      };

      const rzp = new (window as any).Razorpay(rzpOptions);

      rzp.on("payment.failed", async function (response: any) {
        const errorMsg = response.error.description || "Payment failed";
        toast.error(errorMsg);
        setError(errorMsg);
        
        try {
          await fetch("/api/razorpay/failed", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.error.metadata.order_id || orderData.order.id
            }),
          });
        } catch {
          console.error("Failed to update payment status on server");
        }
        
        setLoading(false);
        onError?.(errorMsg);
      });

      rzp.open();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Payment setup failed";
      toast.error(errorMsg);
      setError(errorMsg);
      onError?.(errorMsg);
      setLoading(false);
    }
  };

  return { loading, error, initiatePayment };
};