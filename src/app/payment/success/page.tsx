"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, LayoutDashboard } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || `ORD-${Math.floor(Math.random() * 900000 + 100000)}`;
  const amount = searchParams.get("amount") || "75";

  return (
    <div className="w-full max-w-lg space-y-6 rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
        <CheckCircle2 className="h-10 w-10" />
      </div>

      <div className="space-y-2">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          Payment Confirmed
        </span>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
          Rental Order Placed!
        </h1>
        <p className="text-xs text-zinc-500">
          Your rental order <strong className="text-zinc-800 dark:text-zinc-200">#{orderId}</strong> has been successfully processed.
        </p>
      </div>

      <div className="rounded-2xl bg-zinc-50 p-5 text-left dark:bg-zinc-950 space-y-3 text-xs">
        <div className="flex justify-between text-zinc-500">
          <span>Transaction ID:</span>
          <span className="font-mono text-zinc-900 dark:text-white font-semibold">
            TXN-{Date.now().toString().slice(-8)}
          </span>
        </div>
        <div className="flex justify-between text-zinc-500">
          <span>Amount Paid:</span>
          <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">${amount}</span>
        </div>
        <div className="flex justify-between text-zinc-500">
          <span>Payment Status:</span>
          <span className="font-bold text-emerald-600">COMPLETED</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Link
          href="/dashboard/customer"
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all"
        >
          <LayoutDashboard className="h-4 w-4" /> Go to Dashboard
        </Link>
        <Link
          href="/"
          className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-zinc-200 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-all"
        >
          Browse More Gear
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-16">
      <Suspense fallback={<div className="text-xs text-zinc-400">Loading receipt...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
