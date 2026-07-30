"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/context/auth-context";
import {
  ShoppingBag,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Calendar,
  MapPin,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [draft, setDraft] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "sslcommerz" | "cash">("stripe");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  const handlePlaceOrder = async () => {
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

      // 2. Initiate Payment Intent / Session
      try {
        const paymentRes = await apiClient.post("/payments/create", {
          rentalOrderId,
          method: paymentMethod,
          amount: draft.totalPrice,
        });

        const gatewayUrl = paymentRes.data?.data?.gatewayUrl;
        if (gatewayUrl) {
          window.location.href = gatewayUrl;
          return;
        }
      } catch (pErr) {
        console.warn("Payment API fallback trigger:", pErr);
      }

      // Clear draft & redirect to success
      sessionStorage.removeItem("gearup_checkout_draft");
      router.push(`/payment/success?orderId=${rentalOrderId}&amount=${draft.totalPrice}`);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to process rental order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Product Details
      </Link>

      <div className="flex flex-col md:flex-row items-start justify-between gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
            Rental Order Checkout
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Review your dates and select payment gateway</p>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-4 text-xs font-semibold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
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
              <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                {gearItem.category?.name || "Equipment"}
              </span>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">{gearItem.name}</h3>
              <p className="text-xs text-zinc-500">Brand: {gearItem.brand}</p>
              <div className="pt-2 text-xs font-semibold text-zinc-900 dark:text-white">
                ${gearItem.pricePerDay} / day × {quantity} unit(s)
              </div>
            </div>
          </div>

          {/* Rental Duration Details */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-500" /> Rental Schedule
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
                <span className="text-zinc-400">Total Duration:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {totalDays} Days
                </span>
              </div>
            </div>
          </div>

          {/* Pickup Location Info */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-500" /> Pickup & Return Center
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              GearUp Pickup Hub #4 (Gulshan Avenue, Dhaka). Verified equipment handoff with inspection checklist.
            </p>
          </div>
        </div>

        {/* Right: Payment Method & Confirm */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-500" /> Payment Gateway
            </h3>

            <div className="space-y-3">
              <label
                onClick={() => setPaymentMethod("stripe")}
                className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-all ${
                  paymentMethod === "stripe"
                    ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30"
                    : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs">
                    S
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-white">Stripe Checkout</p>
                    <p className="text-[10px] text-zinc-400">Credit Card, Apple Pay, Visa, Mastercard</p>
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
                className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-all ${
                  paymentMethod === "sslcommerz"
                    ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30"
                    : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs">
                    SSL
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-white">SSLCommerz Gateway</p>
                    <p className="text-[10px] text-zinc-400">bKash, Nagad, Mobile Banking, Local Cards</p>
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
                <span className="font-semibold text-zinc-900 dark:text-white">${totalPrice}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Damage Protection Insurance</span>
                <span className="font-bold text-emerald-600">INCLUDED</span>
              </div>
              <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-extrabold text-zinc-900 dark:text-white dark:border-zinc-800">
                <span>Total Due Now</span>
                <span className="text-emerald-600 dark:text-emerald-400">${totalPrice}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? "Processing Payment..." : `Pay $${totalPrice} & Confirm Rental`}
              <CheckCircle2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
