import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div className="flex justify-between items-center border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-80 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-48 rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-6 w-48 rounded-lg" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
}
