"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/context/auth-context";
import { StripeCheckoutForm } from "@/components/stripe-checkout-form";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ArrowLeft,
  Lock,
} from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder"
);

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "sslcommerz" | "cash">("stripe");
  const [errorMessage, setErrorMessage] = useState("");

  // Stripe Payment Intent State
  const [paymentData, setPaymentData] = useState<{
    clientSecret: string;
    transactionId: string;
    rentalOrderId: string;
  } | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("gearup_checkout_draft");
    if (!raw) {
      router.push("/");
      return;
    }
    try {
      setDraft(JSON.parse(raw));
    } catch {
      router.push("/");
    }
  }, [router]);

  // TanStack React Query Mutation: Create Rental Order
  const createOrderMutation = useMutation({
    mutationFn: async (orderPayload: any) => {
      const res = await apiClient.post("/rentals", orderPayload);
      return res.data?.data;
    },
  });

  // TanStack React Query Mutation: Create Stripe Payment Intent & Invalidate Customer Queries
  const createPaymentMutation = useMutation({
    mutationFn: async ({
      rentalOrderId,
      method,
      amount,
    }: {
      rentalOrderId: string;
      method: string;
      amount: number;
    }) => {
      const res = await apiClient.post("/payments/create", {
        rentalOrderId,
        method,
        amount,
      });
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-rentals"] });
      queryClient.invalidateQueries({ queryKey: ["customer-payments"] });
      queryClient.invalidateQueries({ queryKey: ["my-rentals"] });
    },
  });

  const handleInitiateOrder = async () => {
    if (!draft || !draft.gearItem) return;
    setErrorMessage("");

    try {
      const orderPayload = {
        startDate: draft.startDate,
        endDate: draft.endDate,
        items: [
          {
            gearItemId: draft.gearItem.id,
            quantity: draft.quantity,
          },
        ],
      };

      // 1. Create Rental Order via TanStack React Query Mutation
      const createdOrder = await createOrderMutation.mutateAsync(orderPayload);
      const rentalOrderId = createdOrder?.id || `ORD-${Date.now()}`;

      // 2. Create Payment Intent via TanStack React Query Mutation
      const paymentDataRes = await createPaymentMutation.mutateAsync({
        rentalOrderId,
        method: paymentMethod,
        amount: draft.totalPrice,
      });

      const { clientSecret, payment } = paymentDataRes || {};
      const transactionId = payment?.transactionId || `TXN-${Date.now()}`;

      if (!clientSecret) {
        throw new Error("Failed to initialize Stripe payment session. Client secret was not provided by server.");
      }

      setPaymentData({
        clientSecret,
        transactionId,
        rentalOrderId,
      });
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || "Failed to process rental order. Please try again.");
    }
  };

  const handlePaymentSuccess = (orderId: string, amount: number) => {
    sessionStorage.removeItem("gearup_checkout_draft");
    router.push(`/payment/success?orderId=${orderId}&amount=${amount}`);
  };

  if (!draft) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  const { gearItem, startDate, endDate, totalDays, quantity, totalPrice } = draft;
  const isSubmitting = createOrderMutation.isPending || createPaymentMutation.isPending;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <Link
        href={`/gear/${gearItem.id}`}
        className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Product Details
      </Link>

      <div className="flex flex-col md:flex-row items-start justify-between gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
            Rental Order Checkout
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Review your dates and select your preferred payment gateway</p>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Equipment Summary & Gateway Selection */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-500" /> Selected Rental Dates
            </h3>

            <div className="flex items-center gap-4 bg-zinc-50 p-4 rounded-2xl dark:bg-zinc-950">
              <div className="relative h-16 w-20 overflow-hidden rounded-xl bg-zinc-200 shrink-0">
                <Image
                  src={gearItem.images?.[0] || "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4"}
                  alt={gearItem.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{gearItem.name}</h4>
                <div className="flex justify-between text-xs text-zinc-500 font-medium">
                  <span>{startDate} → {endDate}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{totalDays} Days ({quantity} unit)</span>
                </div>
              </div>
            </div>
          </div>

          {!paymentData ? (
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-500" /> Payment Gateway
              </h3>

              <div className="rounded-2xl border-2 border-emerald-600 bg-emerald-50/40 p-5 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white">Stripe Secured Card Payment</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Visa, Mastercard, AMEX, Discover (256-bit SSL Encrypted)</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-extrabold text-white shadow">
                  Active
                </span>
              </div>

              <button
                onClick={handleInitiateOrder}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? "Initializing Stripe Session..." : "Proceed with Stripe Payment"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <Elements stripe={stripePromise} options={{ clientSecret: paymentData.clientSecret }}>
                <StripeCheckoutForm
                  clientSecret={paymentData.clientSecret}
                  transactionId={paymentData.transactionId}
                  rentalOrderId={paymentData.rentalOrderId}
                  totalPrice={totalPrice}
                  onSuccess={handlePaymentSuccess}
                  onError={(err) => setErrorMessage(err)}
                />
              </Elements>
            </div>
          )}
        </div>

        {/* Right Column: Cost Breakdown Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-white border-b border-zinc-100 pb-3 dark:border-zinc-800">
              Payment Breakdown
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Equipment Rental Rate (${gearItem.pricePerDay}/day)</span>
                <span className="font-bold text-zinc-900 dark:text-white">${gearItem.pricePerDay * totalDays}</span>
              </div>

              {quantity > 1 && (
                <div className="flex justify-between text-zinc-500">
                  <span>Quantity ({quantity} units)</span>
                  <span className="font-bold text-zinc-900 dark:text-white font-mono">× {quantity}</span>
                </div>
              )}

              <div className="flex justify-between text-zinc-500">
                <span>Damage Protection & Service Fee</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Included ($0)</span>
              </div>

              <div className="flex justify-between border-t border-zinc-100 pt-3 text-base font-extrabold text-zinc-900 dark:text-white dark:border-zinc-800">
                <span>Total Amount Due</span>
                <span className="text-emerald-600 dark:text-emerald-400">${totalPrice}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
