"use client";

import React from "react";
import { Category } from "@/types";
import { Search, Filter, RotateCcw, Tag, DollarSign, Sparkles } from "lucide-react";

interface GearFilterProps {
  categories: Category[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  maxPrice: number;
  setMaxPrice: (price: number) => void;
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  brands: string[];
  onReset: () => void;
}

export const GearFilter: React.FC<GearFilterProps> = ({
  categories,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  maxPrice,
  setMaxPrice,
  selectedBrand,
  setSelectedBrand,
  brands,
  onReset,
}) => {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">Filter Gear</h3>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs font-bold text-zinc-400 hover:text-emerald-600 transition-colors"
        >
          <RotateCcw className="h-3 w-3" /> Reset All
        </button>
      </div>

      {/* Search Input */}
      <div>
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
          Search Equipment
        </label>
        <div className="relative mt-1.5">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Tents, Kayaks, Bikes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-2 text-xs text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
          />
        </div>
      </div>

      {/* Category Selection */}
      <div>
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
          Category
        </label>
        <div className="mt-2 space-y-1 max-h-52 overflow-y-auto pr-1">
          <button
            onClick={() => setSelectedCategory("")}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all ${
              selectedCategory === ""
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-sm"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            <span>All Categories</span>
            {selectedCategory === "" && <Sparkles className="h-3.5 w-3.5 text-emerald-500" />}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                selectedCategory === cat.name
                  ? "bg-emerald-50 text-emerald-700 font-bold dark:bg-emerald-950/60 dark:text-emerald-300 shadow-sm"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Max Price Range Slider */}
      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            Max Daily Rate
          </label>
          <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
            ${maxPrice} / day
          </span>
        </div>
        <input
          type="range"
          min="10"
          max="500"
          step="10"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="mt-2.5 w-full accent-emerald-600 cursor-pointer"
        />
      </div>

      {/* Brand Select */}
      {brands.length > 0 && (
        <div>
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            Brand
          </label>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
