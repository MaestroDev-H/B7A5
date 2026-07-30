"use client";

import React, { useEffect, useState, useMemo } from "react";
import { apiClient } from "@/lib/api-client";
import { GearItem, Category } from "@/types";
import { GearGrid } from "@/components/gear/gear-grid";
import { GearFilter } from "@/components/gear/gear-filter";
import {
  Dumbbell,
  Compass,
  ShieldCheck,
  Zap,
  Sparkles,
  Search,
  Flame,
  CheckCircle2,
  PackageCheck,
  TrendingUp,
} from "lucide-react";

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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    avgRating: 4.8,
  },
];

export default function HomePage() {
  const [gearList, setGearList] = useState<GearItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState<number>(300);
  const [selectedBrand, setSelectedBrand] = useState("");

  const fetchCatalogData = async () => {
    setIsLoading(true);
    try {
      const [gearRes, catRes] = await Promise.allSettled([
        apiClient.get("/gear"),
        apiClient.get("/categories"),
      ]);

      let fetchedGear: GearItem[] = [];
      let fetchedCats: Category[] = [];

      if (gearRes.status === "fulfilled" && gearRes.value.data?.data) {
        fetchedGear = gearRes.value.data.data;
      }
      if (catRes.status === "fulfilled" && catRes.value.data?.data) {
        fetchedCats = catRes.value.data.data;
      }

      setGearList(fetchedGear.length > 0 ? fetchedGear : DEMO_GEAR);
      setCategories(fetchedCats.length > 0 ? fetchedCats : DEMO_CATEGORIES);
    } catch (err) {
      console.warn("Using demo data due to API status:", err);
      setGearList(DEMO_GEAR);
      setCategories(DEMO_CATEGORIES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogData();
  }, []);

  const brandsList = useMemo(() => {
    const brands = new Set<string>();
    gearList.forEach((item) => {
      if (item.brand) brands.add(item.brand);
    });
    return Array.from(brands);
  }, [gearList]);

  const filteredGear = useMemo(() => {
    return gearList.filter((item) => {
      const matchesQuery =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        !selectedCategory || item.category?.name === selectedCategory;
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
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-zinc-900 to-zinc-950 text-white py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-600/25 via-transparent to-transparent" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-400 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            Instant Sports & Outdoor Equipment Rental Service
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl max-w-4xl mx-auto leading-tight">
            Rent Premium Gear for Your Next{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
              Outdoor Adventure
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Skip buying expensive equipment. Rent verified tents, kayaks, mountain bikes & fitness gear from local rental shops with flexible dates and full insurance coverage.
          </p>

          {/* Quick Hero Search Bar */}
          <div className="max-w-2xl mx-auto bg-white/10 p-2 rounded-2xl backdrop-blur-xl border border-white/15 flex flex-col sm:flex-row gap-2 shadow-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search gear (e.g. Tent, Kayak, Bike)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-white/10 pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-400 focus:bg-white/20 focus:outline-none font-medium"
              />
            </div>
            <a
              href="#gear-catalog"
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition-all"
            >
              Explore Catalog
            </a>
          </div>

          {/* Features Checklist */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-zinc-300 pt-2">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Insured Equipment
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Verified Vendors
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Flexible Dates
            </span>
          </div>
        </div>
      </section>

      {/* Main Catalog & Filter Section */}
      <section id="gear-catalog" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold uppercase tracking-wider">
              <Flame className="h-4 w-4" /> Live Gear Inventory
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mt-1">
              Available Gear for Rent
            </h2>
          </div>
          <p className="text-xs text-zinc-500">
            Showing <strong className="text-zinc-900 dark:text-white">{filteredGear.length}</strong> equipment options
          </p>
        </div>

        {/* Catalog Grid + Filter Sidebar Layout */}
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
            <GearGrid gearItems={filteredGear} isLoading={isLoading} />
          </main>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="bg-zinc-100/80 dark:bg-zinc-900/50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
              How GearUp Works
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500">
              Rent sports & outdoor equipment in 3 simple steps with complete confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 font-extrabold text-lg mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Choose Gear & Dates</h3>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                Browse our catalog, filter by category or price, and select your rental start and return dates.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 font-extrabold text-lg mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Instant Checkout</h3>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                Pay securely via Stripe or SSLCommerz. Your rental order is instantly confirmed with the provider.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 font-extrabold text-lg mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Pick Up & Enjoy</h3>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                Pick up your equipment, enjoy your adventure, and return it when finished. Leave a review!
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
