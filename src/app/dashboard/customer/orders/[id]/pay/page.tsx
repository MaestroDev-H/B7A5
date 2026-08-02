"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/context/auth-context";
import { RentalOrder } from "@/types";
import { RoleGuard } from "@/components/auth/role-guard";
import { StripeCheckoutForm } from "@/components/stripe-checkout-form";
import {
  CreditCard,
  AlertCircle,
  Calendar,
  ArrowLeft,
  Package,
  ShieldCheck,
} from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder"
);

export default function OrderPaymentInitiationPage() {
  return (
    <RoleGuard allowedRoles={["CUSTOMER", "ADMIN"]}>
      <OrderPaymentContent />
    </RoleGuard>
  );
}

function OrderPaymentContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const orderId = params?.id as string;

  const [errorMessage, setErrorMessage] = useState("");
  const [paymentData, setPaymentData] = useState<{
    clientSecret: string;
    transactionId: string;
    rentalOrderId: string;
  } | null>(null);

  // TanStack React Query: Fetch Specific Rental Order
  const { data: order, isLoading } = useQuery<RentalOrder | null>({
    queryKey: ["order-detail", orderId],
    queryFn: async () => {
      try {
        const res = await apiClient.get(`/rentals/${orderId}`);
        if (res.data?.data) return res.data.data;
      } catch {}

      // Fallback local store check
      try {
        const stored = JSON.parse(localStorage.getItem("gearup_orders_store") || "[]");
        const found = stored.find((o: any) => o.id === orderId);
        if (found) return found;
      } catch {}

      return null;
    },
    enabled: !!orderId,
  });

  // TanStack React Query Mutation: Create Payment Intent
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
    },
  });

  const handleInitiatePayment = async () => {
    if (!order) return;
    setErrorMessage("");

    try {
      let paymentRes = null;
      try {
        paymentRes = await createPaymentMutation.mutateAsync({
          rentalOrderId: order.id,
          method: "Stripe",
          amount: order.totalAmount,
        });
      } catch (e) {
        console.warn("Payment intent API warning, operating with Stripe session:", e);
      }

      const { clientSecret, payment } = paymentRes || {};
      const transactionId = payment?.transactionId || `TXN-${Date.now()}`;

      setPaymentData({
        clientSecret: clientSecret || `pi_demo_${order.id}_secret_abc123`,
        transactionId,
        rentalOrderId: order.id,
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to initialize payment gateway.");
    }
  };

  const handlePaymentSuccess = (paidOrderId: string, amount: number) => {
    try {
      const storedOrders = JSON.parse(localStorage.getItem("gearup_orders_store") || "[]");
      const updatedOrders = storedOrders.map((o: any) =>
        o.id === paidOrderId ? { ...o, status: "PAID" } : o
      );
      localStorage.setItem("gearup_orders_store", JSON.stringify(updatedOrders));

      const storedPayments = JSON.parse(localStorage.getItem("gearup_payments_store") || "[]");
      const newPayment = {
        id: `PAY-${Date.now()}`,
        transactionId: `TXN-STRIPE-${Date.now()}`,
        amount,
        method: "Stripe Card",
        status: "COMPLETED",
        paidAt: new Date().toISOString(),
        rentalOrderId: paidOrderId,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem("gearup_payments_store", JSON.stringify([newPayment, ...storedPayments.filter((p: any) => p.rentalOrderId !== paidOrderId)]));
    } catch (e) {
      console.error(e);
    }

    queryClient.invalidateQueries({ queryKey: ["customer-rentals"] });
    router.push(`/payment/success?orderId=${paidOrderId}&amount=${amount}`);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-md py-20 text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Rental Order Not Found</h2>
        <Link href="/dashboard/customer" className="text-xs font-bold text-emerald-600 hover:underline">
          Return to Customer Dashboard
        </Link>
      </div>
    );
  }

  const gearName = order.items?.[0]?.gearItem?.name || "Equipment Rental";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      <Link
        href="/dashboard/customer"
        className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Customer Orders
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
            Initiate Payment for Order #{order.id}
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Your rental order is confirmed. Complete secure payment to finalize booking.
          </p>
        </div>
        <span className="rounded-full bg-blue-100 px-3.5 py-1 text-xs font-extrabold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
          Status: {order.status}
        </span>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Order Details */}
        <div className="md:col-span-6 space-y-4">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
              <Package className="h-5 w-5 text-emerald-500" /> Order Summary
            </h3>

            <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950 space-y-2 text-xs">
              <div className="flex justify-between font-bold text-zinc-900 dark:text-white">
                <span>{gearName}</span>
                <span className="text-emerald-600">${order.totalAmount}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Rental Dates:</span>
                <span>{order.startDate} → {order.endDate}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Customer:</span>
                <span>{user?.name || "Customer User"}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800 text-sm font-extrabold">
              <span>Total Payment Amount:</span>
              <span className="text-emerald-600 text-xl">${order.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Payment Gateway Action */}
        <div className="md:col-span-6 space-y-4">
          {!paymentData ? (
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-500" /> Payment Gateway
              </h3>

              <div className="rounded-2xl border-2 border-emerald-600 bg-emerald-50/40 p-4 dark:bg-emerald-950/20 text-xs text-zinc-700 dark:text-zinc-300">
                <p className="font-bold text-zinc-900 dark:text-white">Stripe Secured Checkout</p>
                <p className="text-[11px] text-zinc-500 mt-1">Encrypted card processing (Visa, MasterCard, AMEX).</p>
              </div>

              <button
                onClick={handleInitiatePayment}
                disabled={createPaymentMutation.isPending}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-extrabold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 disabled:opacity-50 transition-all"
              >
                {createPaymentMutation.isPending ? "Connecting Gateway..." : `Pay $${order.totalAmount} Now`}
              </button>
            </div>
          ) : (
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <Elements stripe={stripePromise} options={{ clientSecret: paymentData.clientSecret }}>
                <StripeCheckoutForm
                  clientSecret={paymentData.clientSecret}
                  transactionId={paymentData.transactionId}
                  rentalOrderId={paymentData.rentalOrderId}
                  totalPrice={order.totalAmount}
                  onSuccess={handlePaymentSuccess}
                  onError={(err) => setErrorMessage(err)}
                />
              </Elements>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
