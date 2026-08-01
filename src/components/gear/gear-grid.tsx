"use client";

import React from "react";
import { GearItem } from "@/types";
import { GearCard } from "./gear-card";
import { Skeleton } from "@/components/ui/skeleton";
import { PackageOpen } from "lucide-react";

interface GearGridProps {
  gearItems: GearItem[];
  isLoading: boolean;
}

export const GearGrid: React.FC<GearGridProps> = ({ gearItems, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col space-y-3 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="pt-4 flex justify-between">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (gearItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
          <PackageOpen className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-white">
          No equipment found
        </h3>
        <p className="mt-1 text-xs text-zinc-500 max-w-sm">
          Try adjusting your search keywords, price slider, or selected category filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {gearItems.map((item) => (
        <GearCard key={item.id} gear={item} />
      ))}
    </div>
  );
};
