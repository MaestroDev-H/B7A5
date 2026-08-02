"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { GearItem, Category } from "@/types";
import { GearGrid } from "@/components/gear/gear-grid";
import { GearFilter } from "@/components/gear/gear-filter";
import { Compass } from "lucide-react";

const DEMO_CATEGORIES: Category[] = [
  { id: "1", name: "Camping & Hiking" },
  { id: "2", name: "Cycling & Bikes" },
  { id: "3", name: "Water Sports" },
  { id: "4", name: "Winter Sports" },
  { id: "5", name: "Fitness & Gym" },
];

const DEMO_GEAR: GearItem[] = [
  {
    id: "demo-1",
    name: "Ultralight 3-Person Waterproof Tent",
    description: "Full weather protection lightweight expedition tent with double vestibules for hiking.",
    brand: "NorthFace",
    pricePerDay: 25,
    stock: 4,
    isAvailable: true,
    images: [
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80",
    ],
    isDeleted: false,
    categoryId: "1",
    category: { id: "1", name: "Camping & Hiking" },
    providerId: "p1",
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
    avgRating: 4.9,
  },
  {
    id: "demo-2",
    name: "Carbon Fiber Mountain Bike 29er",
    description: "Full suspension hydraulic disc brakes aluminum mountain bike ready for high mountain trails.",
    brand: "Trek",
    pricePerDay: 45,
    stock: 2,
    isAvailable: true,
    images: [
      "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=800&q=80",
    ],
    isDeleted: false,
    categoryId: "2",
    category: { id: "2", name: "Cycling & Bikes" },
    providerId: "p1",
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
    avgRating: 4.8,
  },
  {
    id: "demo-3",
    name: "Inflatable Tandem Ocean Kayak + Paddles",
    description: "Heavy-duty puncture resistant 2-person kayak with high back seats, dual paddles & pump.",
    brand: "Intex",
    pricePerDay: 35,
    stock: 3,
    isAvailable: true,
    images: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
    ],
    isDeleted: false,
    categoryId: "3",
    category: { id: "3", name: "Water Sports" },
    providerId: "p2",
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
    avgRating: 5.0,
  },
  {
    id: "demo-4",
    name: "Pro Alpine Snowboard with Bindings",
    description: "All-mountain freestyle snowboard deck with adjustable quick-entry ratchet bindings.",
    brand: "Burton",
    pricePerDay: 40,
    stock: 5,
    isAvailable: true,
    images: [
      "https://images.unsplash.com/photo-1565992441121-4367c2967103?auto=format&fit=crop&w=800&q=80",
    ],
    isDeleted: false,
    categoryId: "4",
    category: { id: "4", name: "Winter Sports" },
    providerId: "p2",
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
    avgRating: 4.7,
  },
  {
    id: "demo-5",
    name: "Adjustable PowerDumbbell Set (5-50 lbs)",
    description: "Space-saving quick select weight dumbbell pair with ergonomic grip handles.",
    brand: "Bowflex",
    pricePerDay: 18,
    stock: 6,
    isAvailable: true,
    images: [
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80",
    ],
    isDeleted: false,
    categoryId: "5",
    category: { id: "5", name: "Fitness & Gym" },
    providerId: "p3",
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
    avgRating: 4.9,
  },
  {
    id: "demo-6",
    name: "4-Season Cold Protection Sleeping Bag",
    description: "Down insulated mummy sleeping bag rated down to -10°C with compression sack.",
    brand: "REI Co-op",
    pricePerDay: 15,
    stock: 8,
    isAvailable: true,
    images: [
      "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80",
    ],
    isDeleted: false,
    categoryId: "1",
    category: { id: "1", name: "Camping & Hiking" },
    providerId: "p3",
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
    avgRating: 4.8,
  },
];

function GearCatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  // TanStack React Query for Server State & Caching
  const { data: gearList = [], isLoading: isGearLoading } = useQuery<GearItem[]>({
    queryKey: ["gear-catalog-full"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/gear");
        if (res.data?.data && res.data.data.length > 0) return res.data.data;
      } catch {}
      return DEMO_GEAR;
    },
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["gear-categories"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/categories");
        if (res.data?.data && res.data.data.length > 0) return res.data.data;
      } catch {}
      return DEMO_CATEGORIES;
    },
  });

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [maxPrice, setMaxPrice] = useState<number>(300);
  const [selectedBrand, setSelectedBrand] = useState("");

  const brandsList = useMemo(() => {
    const brands = new Set<string>();
    gearList.forEach((item) => {
      if (item.brand) brands.add(item.brand);
    });
    return Array.from(brands);
  }, [gearList]);

  const filteredGear = useMemo(() => {
    return gearList.filter((item) => {
      if (item.provider?.status === "SUSPENDED") return false;

      const matchesQuery =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        !selectedCategory || item.category?.name === selectedCategory || item.categoryId === selectedCategory;
      const matchesPrice = item.pricePerDay <= maxPrice;
      const matchesBrand = !selectedBrand || item.brand === selectedBrand;

      return matchesQuery && matchesCategory && matchesPrice && matchesBrand;
    });
  }, [gearList, searchQuery, selectedCategory, maxPrice, selectedBrand]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setMaxPrice(300);
    setSelectedBrand("");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold uppercase tracking-wider">
            <Compass className="h-4 w-4" /> Sports & Outdoor Gear Directory
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-1">
            Browse All Gear Listings
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Filter high-performance tents, kayaks, bikes & fitness gear from verified local shops.
          </p>
        </div>
        <p className="text-xs font-semibold text-zinc-500">
          Showing <strong className="text-zinc-900 dark:text-white">{filteredGear.length}</strong> equipment options
        </p>
      </div>

      {/* Catalog Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <GearFilter
            categories={categories}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            brands={brandsList}
            onReset={resetFilters}
          />
        </aside>

        <main className="lg:col-span-3">
          <GearGrid gearItems={filteredGear} isLoading={isGearLoading} />
        </main>
      </div>
    </div>
  );
}

export default function GearPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto" />
      </div>
    }>
      <GearCatalogContent />
    </Suspense>
  );
}
