"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export function usePayu() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setLoading(false);
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  const initiatePayuPayment = async (projectId: string, redirectUrl: string) => {
    setLoading(true);

    try {
      const res = await fetch("/api/payu/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, redirectUrl }),
      });

      const orderData = await res.json();
      
      if (!orderData.success) {
        toast.error(orderData.message || "Failed to initiate payment");
        setLoading(false);
        return;
      }

      const form = document.createElement("form");
      form.setAttribute("method", "POST");
      form.setAttribute("action", orderData.data.actionUrl);

      const payuFields = {
        key: orderData.data.key,
        txnid: orderData.data.txnid,
        amount: orderData.data.amount,
        productinfo: orderData.data.productinfo,
        firstname: orderData.data.firstname,
        email: orderData.data.email,
        phone: orderData.data.phone,
        hash: orderData.data.hash,
        surl: orderData.data.surl,
        furl: orderData.data.furl,
      };

      for (const key in payuFields) {
        const input = document.createElement("input");
        input.setAttribute("type", "hidden");
        input.setAttribute("name", key);
        input.setAttribute("value", (payuFields as any)[key]);
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit(); 
      
    } catch {
      toast.error("Something went wrong with checkout.");
      setLoading(false);
    }
  };

  return { initiatePayuPayment, loading };
}