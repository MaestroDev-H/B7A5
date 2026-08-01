"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { GearItem } from "@/types";
import { Star, ShieldCheck, Tag, ArrowRight } from "lucide-react";

interface GearCardProps {
  gear: GearItem;
}

export const GearCard: React.FC<GearCardProps> = ({ gear }) => {
  const getCategoryFallback = () => {
    const catName = (gear.category?.name || "").toLowerCase();
    const itemName = (gear.name || "").toLowerCase();
    if (catName.includes("bike") || itemName.includes("bike")) {
      return "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=800&q=80";
    }
    if (catName.includes("water") || catName.includes("kayak") || itemName.includes("kayak")) {
      return "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80";
    }
    if (catName.includes("winter") || catName.includes("snow") || itemName.includes("snow")) {
      return "https://images.unsplash.com/photo-1565992441121-4367c2967103?auto=format&fit=crop&w=800&q=80";
    }
    if (catName.includes("fitness") || catName.includes("gym") || itemName.includes("dumbbell")) {
      return "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80";
    }
    return "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80";
  };

  const fallbackImage = getCategoryFallback();

  const rawImage =
    gear.images && gear.images.length > 0 && gear.images[0]
      ? gear.images[0]
      : (gear as any).imageUrl;

  const validImage =
    rawImage && !rawImage.includes("placehold.co") ? rawImage : fallbackImage;

  const [imgSrc, setImgSrc] = React.useState(validImage);

  React.useEffect(() => {
    setImgSrc(validImage);
  }, [validImage]);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={gear.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgSrc(fallbackImage)}
        />

        {/* Stock Status Pill */}
        <div className="absolute top-3 left-3 flex gap-2">
          {gear.isAvailable && gear.stock > 0 ? (
            <span className="rounded-full bg-emerald-500/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
              In Stock ({gear.stock})
            </span>
          ) : (
            <span className="rounded-full bg-rose-500/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
              Rented Out
            </span>
          )}

          {gear.category?.name && (
            <span className="rounded-full bg-zinc-900/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-zinc-100">
              {gear.category.name}
            </span>
          )}
        </div>

        {/* Brand Tag */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md dark:bg-zinc-900/90 px-2.5 py-0.5 rounded-md text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
          {gear.brand || "GearUp Verified"}
        </div>
      </div>

      {/* Details Container */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2 text-xs text-zinc-500">
          <span className="flex items-center gap-1 font-bold text-amber-500">
            <Star className="h-3.5 w-3.5 fill-amber-400" />
            {gear.avgRating ? gear.avgRating.toFixed(1) : "4.9"} (12 reviews)
          </span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
            <ShieldCheck className="h-3.5 w-3.5" /> Insured
          </span>
        </div>

        <h3 className="mt-2 text-base font-bold text-zinc-900 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400 line-clamp-1 transition-colors">
          {gear.name}
        </h3>

        <p className="mt-1 text-xs text-zinc-500 line-clamp-2 dark:text-zinc-400 leading-relaxed">
          {gear.description}
        </p>

        {/* Pricing and Action */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
          <div>
            <span className="text-lg font-extrabold text-zinc-900 dark:text-white">
              ${gear.pricePerDay}
            </span>
            <span className="text-xs text-zinc-400"> / day</span>
          </div>

          <Link
            href={`/gear/${gear.id}`}
            className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-600 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-emerald-500 dark:hover:text-white transition-all shadow-sm"
          >
            Rent Now
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
