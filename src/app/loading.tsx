import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
      {/* Hero Banner Skeleton */}
      <div className="rounded-3xl bg-zinc-100 dark:bg-zinc-900 p-8 sm:p-12 space-y-6">
        <Skeleton className="h-6 w-32 rounded-full" />
        <Skeleton className="h-12 w-3/4 max-w-2xl rounded-2xl" />
        <Skeleton className="h-6 w-1/2 max-w-lg rounded-xl" />
        <div className="flex gap-4 pt-4">
          <Skeleton className="h-12 w-36 rounded-xl" />
          <Skeleton className="h-12 w-36 rounded-xl" />
        </div>
      </div>

      {/* Filter Pills Skeleton */}
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-full" />
        ))}
      </div>

      {/* Grid of Product Skeleton Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-3xl border border-zinc-200 bg-white p-5 space-y-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <Skeleton className="h-48 w-full rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-6 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-1/2 rounded" />
            </div>
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-6 w-20 rounded" />
              <Skeleton className="h-9 w-28 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
