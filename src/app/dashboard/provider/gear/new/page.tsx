"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import { Category } from "@/types";
import { RoleGuard } from "@/components/auth/role-guard";
import CloudinaryUpload from "@/components/ui/cloudinary-upload";
import { ArrowLeft, Plus, Package } from "lucide-react";

const gearFormSchema = z.object({
  name: z.string().min(2, "Equipment title must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  brand: z.string().min(1, "Brand is required"),
  pricePerDay: z.number().min(1, "Daily rental rate must be at least $1"),
  stock: z.number().min(1, "Stock quantity must be at least 1 unit"),
  categoryId: z.string().optional(),
  imageUrl: z.string().optional(),
});

type GearFormValues = z.infer<typeof gearFormSchema>;

export default function NewGearPage() {
  return (
    <RoleGuard allowedRoles={["PROVIDER", "ADMIN"]}>
      <NewGearContent />
    </RoleGuard>
  );
}

function NewGearContent() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<GearFormValues>({
    resolver: zodResolver(gearFormSchema),
    defaultValues: {
      name: "",
      description: "",
      brand: "",
      pricePerDay: 25,
      stock: 2,
      categoryId: "",
      imageUrl: "",
    },
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["gear-categories"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/categories");
        return res.data?.data || [];
      } catch {
        return [];
      }
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
          "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80",
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
      alert("Equipment listing created successfully!");
      router.push("/dashboard/provider");
    },
    onError: (err: Error) => {
      alert(`Failed to save equipment: ${err.message || "Please verify form inputs."}`);
    },
  });

  const onSubmit = (data: GearFormValues) => {
    addGearMutation.mutate(data);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <Link
        href="/dashboard/provider"
        className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Provider Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
            <Plus className="h-7 w-7 text-emerald-500" /> Create New Gear Listing
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Add sports or outdoor rental equipment to your inventory list.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-xs">
          <div>
            <label className="font-bold text-zinc-700 dark:text-zinc-300">Equipment Title / Name *</label>
            <input
              {...form.register("name")}
              placeholder="e.g. Ultralight 3-Person Waterproof Tent"
              className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
            />
            {form.formState.errors.name && (
              <p className="mt-1 text-rose-500 font-semibold">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-zinc-700 dark:text-zinc-300">Brand *</label>
              <input
                {...form.register("brand")}
                placeholder="e.g. NorthFace, Trek, Burton"
                className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
              />
              {form.formState.errors.brand && (
                <p className="mt-1 text-rose-500 font-semibold">{form.formState.errors.brand.message}</p>
              )}
            </div>

            <div>
              <label className="font-bold text-zinc-700 dark:text-zinc-300">Category</label>
              <select
                {...form.register("categoryId")}
                className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-zinc-700 dark:text-zinc-300">Price per Day ($) *</label>
              <input
                type="number"
                {...form.register("pricePerDay", { valueAsNumber: true })}
                className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
              />
              {form.formState.errors.pricePerDay && (
                <p className="mt-1 text-rose-500 font-semibold">{form.formState.errors.pricePerDay.message}</p>
              )}
            </div>

            <div>
              <label className="font-bold text-zinc-700 dark:text-zinc-300">Stock Quantity *</label>
              <input
                type="number"
                {...form.register("stock", { valueAsNumber: true })}
                className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
              />
              {form.formState.errors.stock && (
                <p className="mt-1 text-rose-500 font-semibold">{form.formState.errors.stock.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="font-bold text-zinc-700 dark:text-zinc-300">Detailed Description *</label>
            <textarea
              {...form.register("description")}
              rows={4}
              placeholder="Describe equipment specifications, condition, included accessories, and pickup instructions..."
              className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
            />
            {form.formState.errors.description && (
              <p className="mt-1 text-rose-500 font-semibold">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="font-bold text-zinc-700 dark:text-zinc-300">Equipment Image Upload</label>
            <div className="mt-1.5">
              <CloudinaryUpload
                onChange={(url) => form.setValue("imageUrl", url)}
                value={form.watch("imageUrl")}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800">
            <Link
              href="/dashboard/provider"
              className="rounded-xl border border-zinc-200 px-5 py-3 font-bold text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={addGearMutation.isPending}
              className="rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 disabled:opacity-50 transition-all"
            >
              {addGearMutation.isPending ? "Creating Listing..." : "Publish Gear Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
