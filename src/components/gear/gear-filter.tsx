"use client";

import React from "react";
import { Category } from "@/types";
import { Search, Filter, RotateCcw, Tag, DollarSign } from "lucide-react";

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
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">Filter Gear</h3>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-emerald-600 transition-colors"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      {/* Search Input */}
      <div>
        <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
          Search Equipment
        </label>
        <div className="relative mt-1.5">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Tents, Kayaks, Bikes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-4 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
          />
        </div>
      </div>

      {/* Category Dropdown/List */}
      <div>
        <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Category</label>
        <div className="mt-2 space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => setSelectedCategory("")}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              selectedCategory === ""
                ? "bg-emerald-50 text-emerald-700 font-bold dark:bg-emerald-950/50 dark:text-emerald-300"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                selectedCategory === cat.name
                  ? "bg-emerald-50 text-emerald-700 font-bold dark:bg-emerald-950/50 dark:text-emerald-300"
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
          <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            Max Daily Rate
          </label>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
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
          className="mt-2 w-full accent-emerald-600"
        />
      </div>

      {/* Brand Select */}
      {brands.length > 0 && (
        <div>
          <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Brand</label>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
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
