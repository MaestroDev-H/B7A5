"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/context/auth-context";
import { StripeCheckoutForm } from "@/components/stripe-checkout-form";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Calendar,
  MapPin,
  ArrowLeft,
  Lock,
} from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder"
);

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [draft, setDraft] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "sslcommerz" | "cash">("stripe");
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleInitiateOrder = async () => {
    if (!draft || !draft.gearItem) return;
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // 1. Create rental order on backend
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

      const res = await apiClient.post("/rentals", orderPayload);
      const createdOrder = res.data?.data;
      const rentalOrderId = createdOrder?.id || `ORD-${Date.now()}`;

      // 2. Create PaymentIntent on backend -> returns { clientSecret, payment }
      const paymentRes = await apiClient.post("/payments/create", {
        rentalOrderId,
        method: paymentMethod,
        amount: draft.totalPrice,
      });

      const { clientSecret, payment } = paymentRes.data?.data || {};
      const transactionId = payment?.transactionId || `TXN-${Date.now()}`;

      if (clientSecret) {
        setPaymentData({
          clientSecret,
          transactionId,
          rentalOrderId,
        });
      } else if (transactionId) {
        // Confirm payment with backend & verify explicit response
        const confirmRes = await apiClient.post("/payments/confirm", { transactionId });
        if (confirmRes.data?.success || confirmRes.status === 200 || confirmRes.status === 201) {
          handlePaymentSuccess(rentalOrderId, draft.totalPrice);
        } else {
          throw new Error("Payment session confirmation failed on server.");
        }
      } else {
        throw new Error("Failed to initialize payment gateway session from server.");
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || "Failed to process rental order. Please try again.");
    } finally {
      setIsSubmitting(false);
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
        <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Summary & Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Gear item summary card */}
          <div className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
              <Image
                src={gearItem.images?.[0] || "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4"}
                alt={gearItem.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400">
                {gearItem.category?.name || "Equipment"}
              </span>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">{gearItem.name}</h3>
              <p className="text-xs text-zinc-500">Brand: {gearItem.brand}</p>
              <div className="pt-2 text-xs font-extrabold text-zinc-900 dark:text-white">
                ${gearItem.pricePerDay} / day × {quantity} unit(s)
              </div>
            </div>
          </div>

          {/* Rental Duration Details */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-500" /> Rental Schedule Overview
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs bg-zinc-50 p-4 rounded-xl dark:bg-zinc-950">
              <div>
                <span className="text-zinc-400">Pickup Date:</span>
                <p className="font-bold text-zinc-900 dark:text-white text-sm">{startDate}</p>
              </div>
              <div>
                <span className="text-zinc-400">Return Date:</span>
                <p className="font-bold text-zinc-900 dark:text-white text-sm">{endDate}</p>
              </div>
              <div className="col-span-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between">
                <span className="text-zinc-400 font-medium">Total Duration:</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                  {totalDays} Days
                </span>
              </div>
            </div>
          </div>

          {/* Pickup Location Info */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-500" /> Pickup & Return Center
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              GearUp Pickup Hub #4 (Gulshan Avenue, Dhaka). Verified equipment handoff with mandatory inspection checklist upon pickup.
            </p>
          </div>
        </div>

        {/* Right: Payment Method & Confirm */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
            <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
              <CreditCard className="h-5 w-5 text-emerald-500" /> Payment Gateway
            </h3>

            {!paymentData ? (
              <>
                <div className="space-y-3">
                  <label
                    onClick={() => setPaymentMethod("stripe")}
                    className={`flex items-center justify-between rounded-2xl border p-4 cursor-pointer transition-all ${
                      paymentMethod === "stripe"
                        ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-sm"
                        : "border-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-extrabold text-xs shadow-sm">
                        S
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-900 dark:text-white">Stripe Payment Gateway</p>
                        <p className="text-[10px] text-zinc-400 font-medium">Credit Card, Visa, Mastercard, Apple Pay</p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "stripe"}
                      onChange={() => {}}
                      className="accent-emerald-600"
                    />
                  </label>

                  <label
                    onClick={() => setPaymentMethod("sslcommerz")}
                    className={`flex items-center justify-between rounded-2xl border p-4 cursor-pointer transition-all ${
                      paymentMethod === "sslcommerz"
                        ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-sm"
                        : "border-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold text-xs shadow-sm">
                        SSL
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-900 dark:text-white">SSLCommerz Gateway</p>
                        <p className="text-[10px] text-zinc-400 font-medium">bKash, Nagad, Mobile Banking, Local Cards</p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "sslcommerz"}
                      onChange={() => {}}
                      className="accent-emerald-600"
                    />
                  </label>
                </div>

                {/* Price Summary */}
                <div className="space-y-2 border-t border-zinc-100 pt-4 text-xs dark:border-zinc-800">
                  <div className="flex justify-between text-zinc-500">
                    <span>Equipment Rental (${gearItem.pricePerDay} × {totalDays}d)</span>
                    <span className="font-bold text-zinc-900 dark:text-white">${totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Damage Protection Insurance</span>
                    <span className="font-extrabold text-emerald-600">INCLUDED</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-extrabold text-zinc-900 dark:text-white dark:border-zinc-800">
                    <span>Total Due Now</span>
                    <span className="text-emerald-600 dark:text-emerald-400">${totalPrice}</span>
                  </div>
                </div>

                <button
                  onClick={handleInitiateOrder}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? "Creating Payment Intent..." : `Proceed to Pay $${totalPrice}`}
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              </>
            ) : (
              /* Stripe Elements Form Active State */
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
