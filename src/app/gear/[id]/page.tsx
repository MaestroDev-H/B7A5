"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { GearItem, Review } from "@/types";
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
  Clock,
  Sparkles,
} from "lucide-react";

export default function GearDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const gearId = params?.id as string;

  const [gear, setGear] = useState<GearItem | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Booking date picker states
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

  useEffect(() => {
    if (!gearId) return;

    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get(`/gear/${gearId}`);
        if (res.data?.data) {
          setGear(res.data.data);
          if (res.data.data.images && res.data.data.images.length > 0) {
            setSelectedImage(res.data.data.images[0]);
          }
        }
      } catch (err) {
        console.warn("Using fallback data for gear detail:", err);
        const demo: GearItem = {
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
            "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80",
          ],
          isDeleted: false,
          categoryId: "c1",
          category: { id: "c1", name: "Camping & Hiking" },
          providerId: "p1",
          provider: {
            id: "p1",
            name: "Summit Outfitters Shop",
            email: "provider@summit.com",
            role: "PROVIDER",
            status: "ACTIVE",
            createdAt: "",
            updatedAt: "",
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          avgRating: 4.9,
        };
        setGear(demo);
        setSelectedImage(demo.images[0]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [gearId]);

  // Calculate rental duration in days
  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const totalDays = calculateDays();
  const totalPrice = gear ? gear.pricePerDay * totalDays * quantity : 0;

  const handleBookingRedirect = () => {
    if (!user) {
      router.push(`/login?from=/gear/${gearId}`);
      return;
    }

    const bookingDetails = {
      gearItem: gear,
      startDate,
      endDate,
      totalDays,
      quantity,
      totalPrice,
    };
    sessionStorage.setItem("gearup_checkout_draft", JSON.stringify(bookingDetails));
    router.push("/checkout");
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8 animate-pulse">
        <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="h-96 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!gear) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold">Gear Item Not Found</h2>
        <Link href="/" className="inline-block text-xs text-emerald-600 font-bold underline">
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

      {/* Main Grid: Gallery & Info + Booking Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Gallery & Details (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
              <Image
                src={selectedImage || gear.images[0]}
                alt={gear.name}
                fill
                priority
                className="object-cover"
              />
              <span className="absolute top-4 left-4 rounded-full bg-emerald-600 px-3 py-1 text-xs font-extrabold text-white shadow-md">
                {gear.category?.name || "Equipment"}
              </span>
            </div>

            {/* Thumbnail Selector */}
            {gear.images && gear.images.length > 1 && (
              <div className="flex gap-3">
                {gear.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative h-20 w-20 overflow-hidden rounded-xl border-2 transition-all ${
                      selectedImage === img
                        ? "border-emerald-600 scale-105 shadow-md"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt="Thumbnail" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Brand */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-zinc-100 px-3 py-1 text-xs font-extrabold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                Brand: {gear.brand}
              </span>
              <span className="flex items-center gap-1 text-xs font-extrabold text-amber-500">
                <Star className="h-4 w-4 fill-amber-400" />
                {gear.avgRating ? gear.avgRating.toFixed(1) : "4.9"} (12 reviews)
              </span>
            </div>

            <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
              {gear.name}
            </h1>
          </div>

          {/* Product Specifications & Overview */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 space-y-4 shadow-sm">
            <h3 className="text-xs font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider">
              Product Overview & Specifications
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {gear.description}
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs">
              <div>
                <span className="text-zinc-400 font-medium">Availability Status:</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {gear.isAvailable ? "In Stock & Ready" : "Currently Rented Out"}
                </p>
              </div>
              <div>
                <span className="text-zinc-400 font-medium">Available Units:</span>
                <p className="font-bold text-zinc-900 dark:text-white mt-0.5">
                  {gear.stock} Units
                </p>
              </div>
            </div>
          </div>

          {/* Verified Provider Info Card */}
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-950 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white font-extrabold text-lg">
                <UserIcon className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                  {gear.provider?.name || "Summit Outfitters Shop"}
                </h4>
                <p className="text-xs text-zinc-500">Verified Equipment Provider</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4" /> Verified
            </span>
          </div>
        </div>

        {/* Right Column: Booking Card (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
            <div className="flex items-baseline justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <div>
                <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">
                  ${gear.pricePerDay}
                </span>
                <span className="text-xs text-zinc-400"> / day</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                ★ 100% Insured Rental
              </span>
            </div>

            {/* Booking Date Range */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                    Return Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || new Date().toISOString().split("T")[0]}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                  />
                </div>
              </div>

              {/* Quantity Selector */}
              <div>
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                  Quantity Needed
                </label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                >
                  {Array.from({ length: Math.min(gear.stock, 5) }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} item{i > 0 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price Calculation Summary */}
            <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>
                  ${gear.pricePerDay} × {totalDays} day{totalDays > 1 ? "s" : ""} × {quantity}
                </span>
                <span className="font-bold text-zinc-900 dark:text-white">
                  ${totalPrice}
                </span>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Damage Protection Insurance</span>
                <span className="font-bold text-emerald-600">INCLUDED</span>
              </div>
              <div className="border-t border-zinc-200 pt-2 flex justify-between font-extrabold text-sm text-zinc-900 dark:text-white dark:border-zinc-800">
                <span>Total Estimated Rate</span>
                <span className="text-emerald-600 dark:text-emerald-400">${totalPrice}</span>
              </div>
            </div>

            {/* Action CTA */}
            <button
              onClick={handleBookingRedirect}
              disabled={!gear.isAvailable || gear.stock === 0}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 disabled:opacity-50 transition-all"
            >
              <ShoppingBag className="h-4 w-4" />
              {user ? "Proceed to Checkout" : "Sign In to Rent Equipment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
