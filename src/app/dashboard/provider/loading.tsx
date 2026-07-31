import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProviderDashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-36 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>

      {/* 3 Stat Counter Boxes Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-3 dark:border-zinc-800 dark:bg-zinc-900 flex items-center gap-4"
          >
            <Skeleton className="h-12 w-12 rounded-2xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-28 rounded" />
              <Skeleton className="h-7 w-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Inventory Table Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-48 rounded-lg" />

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950 flex justify-between">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-12 rounded" />
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <Skeleton className="h-4 w-48 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
