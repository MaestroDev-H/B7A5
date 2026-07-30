"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
          <AlertTriangle className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">
            Payment Cancelled
          </h1>
          <p className="text-xs text-zinc-500">
            Your rental order payment transaction was cancelled or interrupted. No charges were made to your account.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Link
            href="/checkout"
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all"
          >
            <RefreshCw className="h-4 w-4" /> Try Checkout Again
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Return to Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
