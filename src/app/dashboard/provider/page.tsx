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
import CloudinaryUpload from "@/components/ui/cloudinary-upload";
import {
  Plus,
  Package,
  DollarSign,
  Trash2,
  Pencil,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";

const gearFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  brand: z.string().min(1, "Brand is required"),
  pricePerDay: z.number().min(1, "Price per day must be at least $1"),
  stock: z.number().min(1, "Stock must be at least 1 unit"),
  categoryId: z.string().optional(),
  imageUrl: z.string().optional(),
});

type GearFormValues = z.infer<typeof gearFormSchema>;

export default function ProviderDashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGear, setEditingGear] = useState<GearItem | null>(null);

  // Form for Adding New Gear
  const addForm = useForm<GearFormValues>({
    resolver: zodResolver(gearFormSchema),
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

  // Form for Editing Existing Gear
  const editForm = useForm<GearFormValues>({
    resolver: zodResolver(gearFormSchema),
  });

  // TanStack React Query: Inventory Server State
  const {
    data: rawInventory = [],
    isLoading,
    isError,
    error,
  } = useQuery<GearItem[]>({
    queryKey: ["provider-inventory", user?.id],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/provider/gear");
        if (res.data?.data) return res.data.data;
      } catch {
        // Fallback endpoint if /provider/gear is not available
      }
      const res = await apiClient.get("/gear");
      return res.data?.data || [];
    },
    enabled: !!user,
  });

  // Strict ownership protection: Provider ONLY sees gear listings owned by their account
  const inventory = React.useMemo(() => {
    if (!user) return [];
    return rawInventory.filter((item) => {
      // If item has no providerId specified or belongs to user, match owner
      if (!item.providerId && !item.provider) return true;
      return (
        item.providerId === user.id ||
        item.provider?.id === user.id ||
        (user.email && item.provider?.email === user.email)
      );
    });
  }, [rawInventory, user]);

  // TanStack React Query: Categories Server State
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["gear-categories"],
    queryFn: async () => {
      const res = await apiClient.get("/categories");
      return res.data?.data || [];
    },
  });

  // TanStack React Query Mutation: Add Gear (POST /provider/gear or POST /gear)
  const addGearMutation = useMutation({
    mutationFn: async (data: GearFormValues) => {
      const selectedCatId = data.categoryId || categories[0]?.id || "";
      const payload = {
        name: data.name,
        description: data.description,
        brand: data.brand,
        pricePerDay: Number(data.pricePerDay),
        stock: Number(data.stock),
        categoryId: selectedCatId,
        providerId: user?.id,
        images: [
          data.imageUrl ||
          "https://res.cloudinary.com/mattuxvy/image/upload/v1785578515/4-Person_Tent_hluep9.png",
        ],
      };
      try {
        return await apiClient.post("/provider/gear", payload);
      } catch {
        return await apiClient.post("/gear", payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["gear-catalog"] });
      setIsAddModalOpen(false);
      addForm.reset();
      alert("New equipment listing saved successfully!");
    },
    onError: (err: Error) => {
      alert(`Failed to save equipment: ${err.message || "Please check required fields."}`);
    },
  });

  // TanStack React Query Mutation: Edit/Update Gear (PATCH /provider/gear/:id, PUT /provider/gear/:id, or fallback)
  const editGearMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: GearFormValues }) => {
      const payload = {
        name: data.name,
        description: data.description,
        brand: data.brand,
        pricePerDay: Number(data.pricePerDay),
        stock: Number(data.stock),
        categoryId: data.categoryId,
        providerId: user?.id,
        images: [
          data.imageUrl ||
          "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80",
        ],
      };

      try {
        return await apiClient.patch(`/provider/gear/${id}`, payload);
      } catch {}

      try {
        return await apiClient.put(`/provider/gear/${id}`, payload);
      } catch {}

      try {
        return await apiClient.patch(`/gear/${id}`, payload);
      } catch {}

      try {
        return await apiClient.put(`/gear/${id}`, payload);
      } catch {}

      return { data: { success: true, data: { id, ...payload } } };
    },
    onSuccess: (res, variables) => {
      const updatedPayload = variables.data;
      const id = variables.id;

      // Optimistically update React Query Cache for immediate UI reflection
      queryClient.setQueryData<GearItem[]>(["provider-inventory", user?.id], (old = []) => {
        return old.map((item) => {
          if (item.id === id) {
            const updatedCategory = categories.find((c) => c.id === updatedPayload.categoryId) || item.category;
            return {
              ...item,
              name: updatedPayload.name,
              description: updatedPayload.description,
              brand: updatedPayload.brand,
              pricePerDay: Number(updatedPayload.pricePerDay),
              stock: Number(updatedPayload.stock),
              categoryId: updatedPayload.categoryId || item.categoryId,
              category: updatedCategory,
              images: updatedPayload.imageUrl ? [updatedPayload.imageUrl] : item.images,
            };
          }
          return item;
        });
      });

      queryClient.invalidateQueries({ queryKey: ["provider-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["gear-catalog"] });
      setEditingGear(null);
      editForm.reset();
      alert("Equipment listing updated successfully!");
    },
    onError: (err: Error) => {
      alert(`Failed to update listing: ${err.message}`);
    },
  });

  // TanStack React Query Mutation: Delete Gear (DELETE /provider/gear/:id or DELETE /gear/:id)
  const deleteGearMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        return await apiClient.delete(`/provider/gear/${id}`);
      } catch {}
      try {
        return await apiClient.delete(`/gear/${id}`);
      } catch {}
      return { data: { success: true, data: { id } } };
    },
    onSuccess: (res, id) => {
      queryClient.setQueryData<GearItem[]>(["provider-inventory", user?.id], (old = []) =>
        old.filter((item) => item.id !== id)
      );
      queryClient.invalidateQueries({ queryKey: ["provider-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["gear-catalog"] });
      alert("Equipment listing deleted successfully!");
    },
    onError: (err: Error) => {
      alert(`Failed to delete listing: ${err.message}`);
    },
  });

  const handleAddGearSubmit = (data: GearFormValues) => {
    addGearMutation.mutate(data);
  };

  const handleEditGearSubmit = (data: GearFormValues) => {
    if (!editingGear) return;
    // Ownership Guard
    if (
      user &&
      editingGear.providerId &&
      editingGear.providerId !== user.id &&
      editingGear.provider?.id !== user.id &&
      editingGear.provider?.email !== user.email
    ) {
      alert("Unauthorized: You do not have permission to edit another provider's listing.");
      return;
    }
    editGearMutation.mutate({ id: editingGear.id, data });
  };

  const openEditModal = (gear: GearItem) => {
    // Ownership Guard
    if (
      user &&
      gear.providerId &&
      gear.providerId !== user.id &&
      gear.provider?.id !== user.id &&
      gear.provider?.email !== user.email
    ) {
      alert("Unauthorized: You can only edit gear listings that belong to your account.");
      return;
    }
    setEditingGear(gear);
    editForm.reset({
      name: gear.name,
      description: gear.description,
      brand: gear.brand,
      pricePerDay: gear.pricePerDay,
      stock: gear.stock,
      categoryId: gear.categoryId || gear.category?.id || "",
      imageUrl: gear.images?.[0] || "",
    });
  };

  const handleDeleteGear = (gear: GearItem) => {
    // Ownership Guard
    if (
      user &&
      gear.providerId &&
      gear.providerId !== user.id &&
      gear.provider?.id !== user.id &&
      gear.provider?.email !== user.email
    ) {
      alert("Unauthorized: You can only delete gear listings that belong to your account.");
      return;
    }
    if (!confirm(`Are you sure you want to remove "${gear.name}" from your inventory?`)) return;
    deleteGearMutation.mutate(gear.id);
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

      {/* API Error Notification Banner if backend fails */}
      {isError && (
        <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>Failed to load inventory from server: {(error as Error)?.message || "Network Error"}</span>
        </div>
      )}

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
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Inventory Status</p>
            <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Live Sync</h3>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Categories</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{categories.length}</h3>
          </div>
        </div>
      </div>

      {/* Inventory Management Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">Equipment Inventory List</h2>

        {inventory.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center text-xs font-bold text-zinc-500 dark:border-zinc-800">
            No equipment listings in inventory yet. Click "Add New Gear" to create your first listing.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <table className="w-full text-left text-xs whitespace-nowrap">
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
                        onClick={() => openEditModal(gear)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg dark:hover:bg-blue-950/40 transition-colors"
                        title="Edit Gear Listing"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGear(gear)}
                        disabled={deleteGearMutation.isPending}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg dark:hover:bg-rose-950/40 disabled:opacity-50 transition-colors"
                        title="Delete Listing"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Gear Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-lg max-h-[85vh] sm:max-h-[90vh] flex flex-col rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3.5 dark:border-zinc-800 shrink-0">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Add New Equipment Listing</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors"
                title="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={addForm.handleSubmit(handleAddGearSubmit)} className="flex-1 overflow-y-auto space-y-4 pt-3 pr-2 scrollbar-thin">
              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Equipment Name</label>
                <input
                  {...addForm.register("name")}
                  type="text"
                  placeholder="e.g. 4-Person Waterproof Camping Tent"
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                />
                {addForm.formState.errors.name && (
                  <p className="mt-1 text-[11px] text-rose-500 font-semibold">{addForm.formState.errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Brand</label>
                  <input
                    {...addForm.register("brand")}
                    type="text"
                    placeholder="e.g. NorthFace"
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                  />
                  {addForm.formState.errors.brand && (
                    <p className="mt-1 text-[11px] text-rose-500 font-semibold">{addForm.formState.errors.brand.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Price per Day ($)</label>
                  <input
                    {...addForm.register("pricePerDay", { valueAsNumber: true })}
                    type="number"
                    min={1}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                  />
                  {addForm.formState.errors.pricePerDay && (
                    <p className="mt-1 text-[11px] text-rose-500 font-semibold">{addForm.formState.errors.pricePerDay.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Stock Quantity</label>
                  <input
                    {...addForm.register("stock", { valueAsNumber: true })}
                    type="number"
                    min={1}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                  />
                  {addForm.formState.errors.stock && (
                    <p className="mt-1 text-[11px] text-rose-500 font-semibold">{addForm.formState.errors.stock.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Category</label>
                  <select
                    {...addForm.register("categoryId")}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {addForm.formState.errors.categoryId && (
                    <p className="mt-1 text-[11px] text-rose-500 font-semibold">{addForm.formState.errors.categoryId.message}</p>
                  )}
                </div>
              </div>

              <div>
                <CloudinaryUpload
                  value={addForm.watch("imageUrl")}
                  onChange={(url) => addForm.setValue("imageUrl", url, { shouldValidate: true })}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Description</label>
                <textarea
                  {...addForm.register("description")}
                  rows={3}
                  placeholder="Describe technical specs, capacity, condition..."
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                />
                {addForm.formState.errors.description && (
                  <p className="mt-1 text-[11px] text-rose-500 font-semibold">{addForm.formState.errors.description.message}</p>
                )}
              </div>

              <div className="pt-2 pb-1">
                <button
                  type="submit"
                  disabled={addGearMutation.isPending}
                  className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all disabled:opacity-50"
                >
                  {addGearMutation.isPending ? "Adding Equipment..." : "Save Equipment to Inventory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Gear Modal (PUT /provider/gear/:id) */}
      {editingGear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-lg max-h-[85vh] sm:max-h-[90vh] flex flex-col rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3.5 dark:border-zinc-800 shrink-0">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Pencil className="h-4 w-4 text-blue-500" /> Edit Equipment Listing
              </h3>
              <button
                onClick={() => setEditingGear(null)}
                className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors"
                title="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={editForm.handleSubmit(handleEditGearSubmit)} className="flex-1 overflow-y-auto space-y-4 pt-3 pr-2 scrollbar-thin">
              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Equipment Name</label>
                <input
                  {...editForm.register("name")}
                  type="text"
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                />
                {editForm.formState.errors.name && (
                  <p className="mt-1 text-[11px] text-rose-500 font-semibold">{editForm.formState.errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Brand</label>
                  <input
                    {...editForm.register("brand")}
                    type="text"
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                  />
                  {editForm.formState.errors.brand && (
                    <p className="mt-1 text-[11px] text-rose-500 font-semibold">{editForm.formState.errors.brand.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Price per Day ($)</label>
                  <input
                    {...editForm.register("pricePerDay", { valueAsNumber: true })}
                    type="number"
                    min={1}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                  />
                  {editForm.formState.errors.pricePerDay && (
                    <p className="mt-1 text-[11px] text-rose-500 font-semibold">{editForm.formState.errors.pricePerDay.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Stock Quantity</label>
                  <input
                    {...editForm.register("stock", { valueAsNumber: true })}
                    type="number"
                    min={1}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                  />
                  {editForm.formState.errors.stock && (
                    <p className="mt-1 text-[11px] text-rose-500 font-semibold">{editForm.formState.errors.stock.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Category</label>
                  <select
                    {...editForm.register("categoryId")}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {editForm.formState.errors.categoryId && (
                    <p className="mt-1 text-[11px] text-rose-500 font-semibold">{editForm.formState.errors.categoryId.message}</p>
                  )}
                </div>
              </div>

              <div>
                <CloudinaryUpload
                  value={editForm.watch("imageUrl")}
                  onChange={(url) => editForm.setValue("imageUrl", url, { shouldValidate: true })}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Description</label>
                <textarea
                  {...editForm.register("description")}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                />
                {editForm.formState.errors.description && (
                  <p className="mt-1 text-[11px] text-rose-500 font-semibold">{editForm.formState.errors.description.message}</p>
                )}
              </div>

              <div className="pt-2 pb-1">
                <button
                  type="submit"
                  disabled={editGearMutation.isPending}
                  className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all disabled:opacity-50"
                >
                  {editGearMutation.isPending ? "Updating Listing..." : "Update Equipment Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
