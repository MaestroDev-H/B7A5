"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { GearItem } from "@/types";
import { useAuth } from "@/context/auth-context";
import {
  Star,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  AlertCircle,
  User as UserIcon,
  ArrowLeft,
  ShoppingBag,
} from "lucide-react";

export default function GearDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const gearId = params?.id as string;

  // Rental date selection state
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImage, setSelectedImage] = useState<string>("");

  useEffect(() => {
    // Set default dates (today to +3 days)
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);

    setStartDate(today.toISOString().split("T")[0]);
    setEndDate(threeDaysLater.toISOString().split("T")[0]);
  }, []);

  // TanStack React Query for Single Gear Item Server State
  const { data: gear, isLoading } = useQuery<GearItem | null>({
    queryKey: ["gear-detail", gearId],
    queryFn: async () => {
      if (!gearId) return null;
      try {
        const res = await apiClient.get(`/gear/${gearId}`);
        return res.data?.data || null;
      } catch {
        return {
          id: gearId,
          name: "Ultralight 3-Person Waterproof Tent",
          description:
            "Full weather protection lightweight expedition tent with double vestibules for hiking. Designed for harsh alpine conditions with DAC aluminum poles and taped seams.",
          brand: "NorthFace",
          pricePerDay: 25,
          stock: 4,
          isAvailable: true,
          images: [
            "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80",
          ],
          isDeleted: false,
          categoryId: "c1",
          category: { id: "c1", name: "Camping & Hiking" },
          providerId: "p1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          avgRating: 4.9,
          reviews: [
            {
              id: "r1",
              rating: 5,
              comment: "Amazing tent! Kept us dry during heavy rain in the mountains.",
              createdAt: "2026-07-20",
              updatedAt: "",
              gearItemId: gearId,
              customerId: "c1",
              customer: { id: "c1", name: "Alex Rover", email: "", role: "CUSTOMER", status: "ACTIVE", createdAt: "", updatedAt: "" },
            },
          ],
        };
      }
    },
    enabled: !!gearId,
  });

  const mainImage = selectedImage || gear?.images?.[0] || "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4";

  // Calculate rental duration & price
  const calculateTotalDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const totalDays = calculateTotalDays();
  const totalPrice = (gear?.pricePerDay || 0) * totalDays * quantity;

  const handleProceedToCheckout = () => {
    if (!user) {
      router.push(`/login?from=/gear/${gearId}`);
      return;
    }

    const checkoutDraft = {
      gearItem: gear,
      startDate,
      endDate,
      totalDays,
      quantity,
      totalPrice,
    };

    sessionStorage.setItem("gearup_checkout_draft", JSON.stringify(checkoutDraft));
    router.push("/checkout");
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center space-y-4">
        <div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto" />
        <p className="text-xs font-bold text-zinc-500">Loading equipment details...</p>
      </div>
    );
  }

  if (!gear) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Equipment Not Found</h2>
        <Link href="/" className="text-xs font-bold text-emerald-600 hover:underline">
          Return to Equipment Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Equipment Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative h-96 sm:h-[450px] w-full overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
            <Image
              src={mainImage}
              alt={gear.name}
              fill
              className="object-cover transition-all"
              priority
            />
          </div>

          {gear.images && gear.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {gear.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${
                    mainImage === img
                      ? "border-emerald-600 scale-105 shadow-md"
                      : "border-zinc-200 dark:border-zinc-800 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Description & Technical Specs */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">
              Equipment Description & Features
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {gear.description}
            </p>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-zinc-400 font-medium">Brand</span>
                <p className="font-bold text-zinc-900 dark:text-white">{gear.brand}</p>
              </div>
              <div>
                <span className="text-zinc-400 font-medium">Category</span>
                <p className="font-bold text-zinc-900 dark:text-white">{gear.category?.name || "General"}</p>
              </div>
              <div>
                <span className="text-zinc-400 font-medium">Availability</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">
                  {gear.stock} units in stock
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Booking Summary & Date Picker Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                  {gear.category?.name || "Equipment"}
                </span>
                <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                  <Star className="h-4 w-4 fill-amber-400" />
                  <span>{gear.avgRating || 4.9}</span>
                </div>
              </div>

              <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-1">
                {gear.name}
              </h1>
            </div>

            <div className="flex items-baseline gap-2 border-y border-zinc-100 py-4 dark:border-zinc-800">
              <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                ${gear.pricePerDay}
              </span>
              <span className="text-xs font-semibold text-zinc-400">/ day</span>
            </div>

            {/* Date Picker Form */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-500" /> Select Rental Period
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">Pickup Date</label>
                  <input
                    type="date"
                    value={startDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 font-bold text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">Return Date</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 font-bold text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">Quantity</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs font-bold text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                >
                  {Array.from({ length: gear.stock || 1 }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} unit(s)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price Summary Box */}
            <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Duration</span>
                <span className="font-bold text-zinc-900 dark:text-white">{totalDays} Days</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Daily Rate (${gear.pricePerDay} × {quantity})</span>
                <span className="font-bold text-zinc-900 dark:text-white">${gear.pricePerDay * quantity}/day</span>
              </div>
              <div className="flex justify-between border-t border-zinc-200 pt-2 text-sm font-extrabold text-zinc-900 dark:text-white dark:border-zinc-800">
                <span>Total Calculated Rental</span>
                <span className="text-emerald-600 dark:text-emerald-400">${totalPrice}</span>
              </div>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all"
            >
              <ShoppingBag className="h-4 w-4" />
              Book Now & Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
