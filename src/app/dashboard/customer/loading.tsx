import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerDashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-72 rounded-lg" />
        </div>
        <div className="flex gap-2 bg-zinc-100 p-1 rounded-2xl dark:bg-zinc-900">
          <Skeleton className="h-10 w-44 rounded-xl" />
          <Skeleton className="h-10 w-44 rounded-xl" />
        </div>
      </div>

      {/* Customer Rental History Cards Skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <Skeleton className="h-5 w-40 rounded-lg" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-56 rounded" />
                  <Skeleton className="h-3 w-28 rounded" />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-16 rounded-lg" />
                <Skeleton className="h-9 w-32 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
