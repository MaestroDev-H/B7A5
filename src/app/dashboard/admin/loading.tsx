import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div className="space-y-2">
          <Skeleton className="h-4 w-40 rounded-full" />
          <Skeleton className="h-8 w-80 rounded-xl" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-44 rounded-xl" />
          <Skeleton className="h-10 w-44 rounded-xl" />
        </div>
      </div>

      {/* 4 Stat Counter Boxes Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-zinc-200 bg-white p-5 space-y-3 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <Skeleton className="h-3 w-28 rounded" />
            <Skeleton className="h-7 w-20 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Admin Table Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-56 rounded-lg" />

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950 flex justify-between">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-28 rounded" />
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-4 w-40 rounded" />
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
