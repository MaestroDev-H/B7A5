import React from "react";
import Link from "next/link";
import { Compass, Home, Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
          <Compass className="h-10 w-10 animate-spin" style={{ animationDuration: "16s" }} />
        </div>

        <div className="space-y-2">
          <span className="text-4xl font-extrabold text-emerald-600">404</span>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">
            Page Not Found
          </h1>
          <p className="text-xs text-zinc-500 leading-relaxed font-medium">
            The page or equipment listing you are looking for doesn't exist or may have been removed.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-extrabold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all"
        >
          <Home className="h-4 w-4" /> Return to Catalog
        </Link>
      </div>
    </div>
  );
}
