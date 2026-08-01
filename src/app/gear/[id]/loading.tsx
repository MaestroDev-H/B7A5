import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function GearDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <Skeleton className="h-6 w-36 rounded-lg" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Image Gallery Skeleton */}
        <div className="lg:col-span-7 space-y-4">
          <Skeleton className="h-96 w-full rounded-3xl" />
          <div className="flex gap-4">
            <Skeleton className="h-20 w-24 rounded-2xl" />
            <Skeleton className="h-20 w-24 rounded-2xl" />
            <Skeleton className="h-20 w-24 rounded-2xl" />
          </div>
        </div>

        {/* Right Product Summary Skeleton */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 space-y-6 dark:border-zinc-800 dark:bg-zinc-900">
            <Skeleton className="h-4 w-28 rounded-full" />
            <Skeleton className="h-8 w-3/4 rounded-xl" />
            <Skeleton className="h-6 w-1/3 rounded-lg" />

            <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
