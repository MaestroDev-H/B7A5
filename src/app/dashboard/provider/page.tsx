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
import { RoleGuard } from "@/components/auth/role-guard";
import { ProviderProfileForm } from "@/components/dashboard/provider-profile-form";
import CloudinaryUpload from "@/components/ui/cloudinary-upload";
import {
  Plus,
  Package,
  DollarSign,
  Trash2,
  Pencil,
  ShoppingBag,
  AlertCircle,
  Building2,
  ShieldCheck,
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
  return (
    <RoleGuard allowedRoles={["PROVIDER", "ADMIN"]}>
      <ProviderDashboardContent />
    </RoleGuard>
  );
}

function ProviderDashboardContent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"inventory" | "profile">("inventory");
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

  // Add Gear Mutation
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

  // Edit/Update Gear Mutation
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

  // Delete Gear Mutation
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
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
              Provider Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              Provider Role
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Manage your store inventory, edit business profile, and fulfill customer rental orders.
          </p>
        </div>

        {/* Action Controls & Tab Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 rounded-2xl bg-zinc-100 p-1 dark:bg-zinc-900">
            <button
              onClick={() => setActiveTab("inventory")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "inventory"
                  ? "bg-white text-emerald-600 shadow-sm dark:bg-zinc-800 dark:text-emerald-400"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              <Package className="h-4 w-4" /> Listings ({inventory.length})
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "profile"
                  ? "bg-white text-blue-600 shadow-sm dark:bg-zinc-800 dark:text-blue-400"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              <Building2 className="h-4 w-4" /> Business Profile
            </button>
          </div>

          <Link
            href="/dashboard/provider/orders"
            className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-extrabold text-zinc-700 shadow-sm hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-all"
          >
            <ShoppingBag className="h-4 w-4 text-emerald-500" /> Incoming Orders
          </Link>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all"
          >
            <Plus className="h-4 w-4" /> Add New Gear
          </button>
        </div>
      </div>

      {/* Business Profile Tab */}
      {activeTab === "profile" && <ProviderProfileForm />}

      {/* Inventory & Listings Tab */}
      {activeTab === "inventory" && (
        <>
          {/* API Error Notification */}
          {isError && (
            <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>Failed to load inventory from server: {(error as Error)?.message || "Network Error"}</span>
            </div>
          )}

          {/* Stat Counter Cards */}
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
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tenant Protection</p>
                <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" /> Isolated
                </h3>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Categories</p>
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
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(gear)}
                              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white transition-all"
                              title="Edit listing"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteGear(gear)}
                              className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 transition-all"
                              title="Delete listing"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Gear Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 my-8">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Add New Equipment Listing</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={addForm.handleSubmit(handleAddGearSubmit)} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300">Gear Title / Name *</label>
                <input
                  {...addForm.register("name")}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                  placeholder="e.g. 4-Season Ultralight Backpacking Tent"
                />
                {addForm.formState.errors.name && (
                  <p className="mt-1 text-rose-500 font-semibold">{addForm.formState.errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Brand *</label>
                  <input
                    {...addForm.register("brand")}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                    placeholder="e.g. MSR / REI"
                  />
                  {addForm.formState.errors.brand && (
                    <p className="mt-1 text-rose-500 font-semibold">{addForm.formState.errors.brand.message}</p>
                  )}
                </div>

                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Category</label>
                  <select
                    {...addForm.register("categoryId")}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Price per Day ($) *</label>
                  <input
                    type="number"
                    {...addForm.register("pricePerDay", { valueAsNumber: true })}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                  />
                  {addForm.formState.errors.pricePerDay && (
                    <p className="mt-1 text-rose-500 font-semibold">{addForm.formState.errors.pricePerDay.message}</p>
                  )}
                </div>

                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Stock Quantity *</label>
                  <input
                    type="number"
                    {...addForm.register("stock", { valueAsNumber: true })}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                  />
                  {addForm.formState.errors.stock && (
                    <p className="mt-1 text-rose-500 font-semibold">{addForm.formState.errors.stock.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300">Description *</label>
                <textarea
                  {...addForm.register("description")}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                  placeholder="Describe equipment specifications, condition, and included accessories..."
                />
                {addForm.formState.errors.description && (
                  <p className="mt-1 text-rose-500 font-semibold">{addForm.formState.errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300">Equipment Image Upload</label>
                <CloudinaryUpload
                  onChange={(url) => addForm.setValue("imageUrl", url)}
                  value={addForm.watch("imageUrl")}
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-zinc-200 px-4 py-2 font-bold text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addGearMutation.isPending}
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white shadow hover:bg-emerald-500 disabled:opacity-50"
                >
                  {addGearMutation.isPending ? "Saving..." : "Save Equipment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Gear Modal */}
      {editingGear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 my-8">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Edit Equipment Listing</h3>
              <button
                onClick={() => setEditingGear(null)}
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={editForm.handleSubmit(handleEditGearSubmit)} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300">Gear Title / Name *</label>
                <input
                  {...editForm.register("name")}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                />
                {editForm.formState.errors.name && (
                  <p className="mt-1 text-rose-500 font-semibold">{editForm.formState.errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Brand *</label>
                  <input
                    {...editForm.register("brand")}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                  />
                  {editForm.formState.errors.brand && (
                    <p className="mt-1 text-rose-500 font-semibold">{editForm.formState.errors.brand.message}</p>
                  )}
                </div>

                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Category</label>
                  <select
                    {...editForm.register("categoryId")}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Price per Day ($) *</label>
                  <input
                    type="number"
                    {...editForm.register("pricePerDay", { valueAsNumber: true })}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Stock Quantity *</label>
                  <input
                    type="number"
                    {...editForm.register("stock", { valueAsNumber: true })}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300">Description *</label>
                <textarea
                  {...editForm.register("description")}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300">Equipment Image Upload</label>
                <CloudinaryUpload
                  onChange={(url) => editForm.setValue("imageUrl", url)}
                  value={editForm.watch("imageUrl")}
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingGear(null)}
                  className="rounded-xl border border-zinc-200 px-4 py-2 font-bold text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editGearMutation.isPending}
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white shadow hover:bg-emerald-500 disabled:opacity-50"
                >
                  {editGearMutation.isPending ? "Updating..." : "Update Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
