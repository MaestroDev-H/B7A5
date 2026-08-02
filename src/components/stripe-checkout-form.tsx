"use client";

import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { apiClient } from "@/lib/api-client";
import { CreditCard, CheckCircle2, AlertCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StripeCheckoutFormProps {
  clientSecret: string;
  transactionId: string;
  rentalOrderId: string;
  totalPrice: number;
  onSuccess: (orderId: string, amount: number) => void;
  onError: (msg: string) => void;
}

export function StripeCheckoutForm({
  clientSecret,
  transactionId,
  rentalOrderId,
  totalPrice,
  onSuccess,
  onError,
}: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setCardError("");

    if (!stripe || !elements) {
      const msg = "Stripe SDK is not initialized yet. Please refresh and try again.";
      setCardError(msg);
      onError(msg);
      setIsProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      const msg = "Credit card input field missing.";
      setCardError(msg);
      onError(msg);
      setIsProcessing(false);
      return;
    }

    try {
      // 1. Confirm payment with Stripe.js using clientSecret
      const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        const errMsg = error.message || "Payment failed with Stripe.";
        setCardError(errMsg);
        onError(errMsg);
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        // 2. Call backend to verify & update order status to PAID
        const confirmRes = await apiClient.post("/payments/confirm", {
          transactionId: paymentIntent.id || transactionId,
        });

        if (confirmRes.data?.success || confirmRes.status === 200 || confirmRes.status === 201) {
          onSuccess(rentalOrderId, totalPrice);
        } else {
          const errMsg = confirmRes.data?.message || "Failed to confirm payment with server.";
          setCardError(errMsg);
          onError(errMsg);
        }
      } else {
        const errMsg = `Stripe payment failed. Status: ${paymentIntent?.status || "unpaid"}.`;
        setCardError(errMsg);
        onError(errMsg);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || "An unexpected error occurred during payment processing.";
      setCardError(errMsg);
      onError(errMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
        <span className="text-xs font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-emerald-500" /> Enter Credit Card Details
        </span>
        <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
          <Lock className="h-3 w-3 text-emerald-600" /> 256-bit Encrypted
        </span>
      </div>

      {cardError && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-600 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{cardError}</span>
        </div>
      )}

      <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4 shadow-md">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "15px",
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                color: "#ffffff",
                iconColor: "#10b981",
                "::placeholder": {
                  color: "#9ca3af",
                },
              },
              invalid: {
                color: "#f87171",
                iconColor: "#f87171",
              },
            },
          }}
        />
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full h-12 text-xs sm:text-sm font-extrabold"
      >
        {isProcessing ? "Processing Stripe Payment..." : `Pay $${totalPrice} via Stripe`}
        <CheckCircle2 className="ml-2 h-4 w-4" />
      </Button>
    </form>
  );
}
