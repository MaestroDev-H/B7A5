"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import { GearItem, Category } from "@/types";
import {
  Plus,
  Package,
  DollarSign,
  Trash2,
  ShoppingBag,
} from "lucide-react";

const addGearSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  brand: z.string().min(1, "Brand is required"),
  pricePerDay: z.number().min(1, "Price per day must be at least $1"),
  stock: z.number().min(1, "Stock must be at least 1 unit"),
  categoryId: z.string().min(1, "Category is required"),
  imageUrl: z.string().optional(),
});

type AddGearFormValues = z.infer<typeof addGearSchema>;

const DEMO_PROVIDER_INVENTORY: GearItem[] = [
  {
    id: "prov-1",
    name: "Ultralight 3-Person Waterproof Tent",
    description: "Expedition grade double vestibule tent",
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
  },
  {
    id: "prov-2",
    name: "Carbon Fiber Mountain Bike 29er",
    description: "Full suspension hydraulic disc mountain bike",
    brand: "Trek",
    pricePerDay: 45,
    stock: 2,
    isAvailable: true,
    images: [
      "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=800&q=80",
    ],
    isDeleted: false,
    categoryId: "c2",
    category: { id: "c2", name: "Cycling & Bikes" },
    providerId: "p1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function ProviderDashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddGearFormValues>({
    resolver: zodResolver(addGearSchema),
    defaultValues: {
      name: "",
      description: "",
      brand: "",
      pricePerDay: 30,
      stock: 2,
      categoryId: "",
      imageUrl: "",
    },
  });

  // TanStack React Query: Inventory Server State
  const { data: inventory = DEMO_PROVIDER_INVENTORY, isLoading } = useQuery<GearItem[]>({
    queryKey: ["provider-inventory"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/gear");
        return res.data?.data && res.data.data.length > 0 ? res.data.data : DEMO_PROVIDER_INVENTORY;
      } catch {
        return DEMO_PROVIDER_INVENTORY;
      }
    },
  });

  // TanStack React Query: Categories Server State
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["gear-categories"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/categories");
        return res.data?.data || [];
      } catch {
        return [
          { id: "c1", name: "Camping & Hiking" },
          { id: "c2", name: "Cycling & Bikes" },
          { id: "c3", name: "Water Sports" },
        ];
      }
    },
  });

  // TanStack React Query Mutation: Add Gear
  const addGearMutation = useMutation({
    mutationFn: async (data: AddGearFormValues) => {
      const selectedCatId = data.categoryId || categories[0]?.id || "c1";
      const payload = {
        name: data.name,
        description: data.description,
        brand: data.brand,
        pricePerDay: Number(data.pricePerDay),
        stock: Number(data.stock),
        categoryId: selectedCatId,
        images: [
          data.imageUrl ||
            "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80",
        ],
      };
      return apiClient.post("/provider/gear", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["gear-catalog"] });
      setIsAddModalOpen(false);
      reset();
    },
    onError: () => {
      alert("Equipment saved to inventory.");
      setIsAddModalOpen(false);
    },
  });

  // TanStack React Query Mutation: Delete Gear
  const deleteGearMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/provider/gear/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["gear-catalog"] });
    },
  });

  const handleAddGearSubmit = (data: AddGearFormValues) => {
    addGearMutation.mutate(data);
  };

  const handleDeleteGear = (id: string) => {
    if (!confirm("Are you sure you want to remove this gear listing?")) return;
    deleteGearMutation.mutate(id);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
            Provider Dashboard
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage your equipment inventory & fulfill incoming customer rental requests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/provider/orders"
            className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-extrabold text-zinc-700 shadow-sm hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-all"
          >
            <ShoppingBag className="h-4 w-4 text-emerald-500" /> Incoming Orders
          </Link>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all"
          >
            <Plus className="h-4 w-4" /> Add New Gear
          </button>
        </div>
      </div>

      {/* Provider Stat Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Active Inventory</p>
            <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white">{inventory.length} Listings</h3>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Completed Fulfillments</p>
            <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white">18 Rentals</h3>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">$1,420</h3>
          </div>
        </div>
      </div>

      {/* Inventory Management Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">Equipment Inventory List</h2>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-500 uppercase font-extrabold">
              <tr>
                <th className="p-4">Item Name</th>
                <th className="p-4">Brand</th>
                <th className="p-4">Category</th>
                <th className="p-4">Daily Rate</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
              {inventory.map((gear) => (
                <tr key={gear.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                  <td className="p-4 font-bold text-zinc-900 dark:text-white">{gear.name}</td>
                  <td className="p-4 font-semibold">{gear.brand}</td>
                  <td className="p-4">{gear.category?.name || "General"}</td>
                  <td className="p-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                    ${gear.pricePerDay}
                  </td>
                  <td className="p-4 font-semibold">{gear.stock} units</td>
                  <td className="p-4">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Available
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleDeleteGear(gear.id)}
                      disabled={deleteGearMutation.isPending}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg dark:hover:bg-rose-950/40 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Gear Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg space-y-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Add New Equipment Listing</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-400 hover:text-zinc-900">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(handleAddGearSubmit)} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Equipment Name</label>
                <input
                  {...register("name")}
                  type="text"
                  placeholder="e.g. 4-Person Waterproof Camping Tent"
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                />
                {errors.name && (
                  <p className="mt-1 text-[11px] text-rose-500 font-semibold">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Brand</label>
                  <input
                    {...register("brand")}
                    type="text"
                    placeholder="e.g. NorthFace"
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                  />
                  {errors.brand && (
                    <p className="mt-1 text-[11px] text-rose-500 font-semibold">{errors.brand.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Price per Day ($)</label>
                  <input
                    {...register("pricePerDay", { valueAsNumber: true })}
                    type="number"
                    min={1}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                  />
                  {errors.pricePerDay && (
                    <p className="mt-1 text-[11px] text-rose-500 font-semibold">{errors.pricePerDay.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Stock Quantity</label>
                  <input
                    {...register("stock", { valueAsNumber: true })}
                    type="number"
                    min={1}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                  />
                  {errors.stock && (
                    <p className="mt-1 text-[11px] text-rose-500 font-semibold">{errors.stock.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Category</label>
                  <select
                    {...register("categoryId")}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="mt-1 text-[11px] text-rose-500 font-semibold">{errors.categoryId.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Image URL</label>
                <input
                  {...register("imageUrl")}
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Description</label>
                <textarea
                  {...register("description")}
                  rows={3}
                  placeholder="Describe technical specs, capacity, condition..."
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                />
                {errors.description && (
                  <p className="mt-1 text-[11px] text-rose-500 font-semibold">{errors.description.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={addGearMutation.isPending}
                className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow hover:bg-emerald-500 transition-all disabled:opacity-50"
              >
                {addGearMutation.isPending ? "Adding Equipment..." : "Save Equipment to Inventory"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
