"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import { User, Category, UserStatus } from "@/types";
import {
  ShieldCheck,
  Users,
  Layers,
  Plus,
  UserCheck,
  UserX,
  Pencil,
  Trash2,
  AlertCircle,
} from "lucide-react";

const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function AdminDashboardPage() {
  const { user: currentAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"users" | "categories">("users");

  // Modals state
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form for Adding Category
  const addCategoryForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "" },
  });

  // Form for Editing Category
  const editCategoryForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
  });

  // TanStack React Query: Fetch Admin Users Server State (Strictly fetching real API data without demo fallbacks)
  const {
    data: users = [],
    isLoading: isUsersLoading,
    isError: isUsersError,
    error: usersError,
  } = useQuery<User[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await apiClient.get("/admin/users");
      return res.data?.data || [];
    },
  });

  // TanStack React Query: Fetch Categories Server State (Strictly fetching real API data without demo fallbacks)
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    error: categoriesError,
  } = useQuery<Category[]>({
    queryKey: ["gear-categories"],
    queryFn: async () => {
      const res = await apiClient.get("/categories");
      return res.data?.data || [];
    },
  });

  // TanStack React Query Mutation: Toggle User Status
  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ userId, nextStatus }: { userId: string; nextStatus: UserStatus }) => {
      return apiClient.patch(`/admin/users/${userId}`, { status: nextStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  // TanStack React Query Mutation: Add Category (POST /categories)
  const addCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      return apiClient.post("/categories", { name: data.name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gear-categories"] });
      addCategoryForm.reset();
      setIsCatModalOpen(false);
    },
  });

  // TanStack React Query Mutation: Edit Category (PUT /categories/:id)
  const editCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CategoryFormValues }) => {
      return apiClient.put(`/categories/${id}`, { name: data.name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gear-categories"] });
      setEditingCategory(null);
      editCategoryForm.reset();
    },
  });

  // TanStack React Query Mutation: Delete Category (DELETE /categories/:id)
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gear-categories"] });
    },
  });

  const toggleUserStatus = (userId: string, currentStatus: UserStatus) => {
    const nextStatus: UserStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    toggleUserStatusMutation.mutate({ userId, nextStatus });
  };

  const handleAddCategorySubmit = (data: CategoryFormValues) => {
    addCategoryMutation.mutate(data);
  };

  const handleEditCategorySubmit = (data: CategoryFormValues) => {
    if (!editingCategory) return;
    editCategoryMutation.mutate({ id: editingCategory.id, data });
  };

  const openEditCategoryModal = (cat: Category) => {
    setEditingCategory(cat);
    editCategoryForm.reset({ name: cat.name });
  };

  const handleDeleteCategory = (id: string) => {
    if (!confirm("Are you sure you want to delete this gear category?")) return;
    deleteCategoryMutation.mutate(id);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" /> Platform Moderation Portal
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-1">
            Global Admin Management & Moderation
          </h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 rounded-2xl bg-zinc-100 p-1 dark:bg-zinc-900">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === "users"
                ? "bg-white text-emerald-600 shadow-sm dark:bg-zinc-800 dark:text-emerald-400"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            <Users className="h-4 w-4" /> Users Management ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === "categories"
                ? "bg-white text-emerald-600 shadow-sm dark:bg-zinc-800 dark:text-emerald-400"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            <Layers className="h-4 w-4" /> Gear Categories ({categories.length})
          </button>
        </div>
      </div>

      {/* Admin Analytics Counter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Platform Users</p>
          <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-1">{users.length} Accounts</h3>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Rental Vendors / Shops</p>
          <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {users.filter((u) => u.role === "PROVIDER").length} Providers
          </h3>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Active Gear Categories</p>
          <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-1">{categories.length} Categories</h3>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Suspended Accounts</p>
          <h3 className="text-2xl font-extrabold text-rose-500 mt-1">
            {users.filter((u) => u.status === "SUSPENDED").length} Suspended
          </h3>
        </div>
      </div>

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">Platform User Accounts List</h2>

          {isUsersError && (
            <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>Failed to load users from server: {(usersError as Error)?.message || "Network Error"}</span>
            </div>
          )}

          {users.length === 0 && !isUsersError ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center text-xs font-bold text-zinc-500 dark:border-zinc-800">
              No registered platform users found.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-500 uppercase font-extrabold">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Moderation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                      <td className="p-4 font-bold text-zinc-900 dark:text-white">{u.name}</td>
                      <td className="p-4 font-medium">{u.email}</td>
                      <td className="p-4 font-bold">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] uppercase font-bold ${
                            u.role === "ADMIN"
                              ? "bg-purple-100 text-purple-800"
                              : u.role === "PROVIDER"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 font-extrabold ${
                            u.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {u.role !== "ADMIN" && (
                          <button
                            onClick={() => toggleUserStatus(u.id, u.status)}
                            disabled={toggleUserStatusMutation.isPending}
                            className={`inline-flex items-center gap-1 rounded-xl px-3.5 py-1.5 font-bold text-xs transition-colors disabled:opacity-50 ${
                              u.status === "ACTIVE"
                                ? "bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400"
                                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400"
                            }`}
                          >
                            {u.status === "ACTIVE" ? (
                              <>
                                <UserX className="h-3.5 w-3.5" /> Suspend
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-3.5 w-3.5" /> Activate
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">Gear Categories</h2>
            <button
              onClick={() => setIsCatModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-500 transition-all"
            >
              <Plus className="h-4 w-4" /> Add New Category
            </button>
          </div>

          {isCategoriesError && (
            <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>Failed to load categories: {(categoriesError as Error)?.message || "Network Error"}</span>
            </div>
          )}

          {categories.length === 0 && !isCategoriesError ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center text-xs font-bold text-zinc-500 dark:border-zinc-800">
              No gear categories created yet. Click "Add New Category" to create one.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-zinc-900 dark:text-white">{cat.name}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">ID: {cat.id}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditCategoryModal(cat)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg dark:hover:bg-blue-950/40 transition-colors"
                      title="Edit Category"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      disabled={deleteCategoryMutation.isPending}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg dark:hover:bg-rose-950/40 disabled:opacity-50 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Category Modal (POST /categories) */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-sm max-h-[85vh] sm:max-h-[90vh] flex flex-col rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800 shrink-0">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Create Gear Category</h3>
              <button
                onClick={() => setIsCatModalOpen(false)}
                className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors"
                title="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={addCategoryForm.handleSubmit(handleAddCategorySubmit)} className="flex-1 overflow-y-auto space-y-4 pt-3 pr-1">
              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Category Name</label>
                <input
                  {...addCategoryForm.register("name")}
                  type="text"
                  placeholder="e.g. Climbing & Mountaineering"
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                />
                {addCategoryForm.formState.errors.name && (
                  <p className="mt-1 text-[11px] text-rose-500 font-semibold">
                    {addCategoryForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="pt-2 pb-1">
                <button
                  type="submit"
                  disabled={addCategoryMutation.isPending}
                  className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all disabled:opacity-50"
                >
                  {addCategoryMutation.isPending ? "Creating Category..." : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal (PUT /categories/:id) */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-sm max-h-[85vh] sm:max-h-[90vh] flex flex-col rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800 shrink-0">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Pencil className="h-4 w-4 text-blue-500" /> Edit Gear Category
              </h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors"
                title="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={editCategoryForm.handleSubmit(handleEditCategorySubmit)} className="flex-1 overflow-y-auto space-y-4 pt-3 pr-1">
              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Category Name</label>
                <input
                  {...editCategoryForm.register("name")}
                  type="text"
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                />
                {editCategoryForm.formState.errors.name && (
                  <p className="mt-1 text-[11px] text-rose-500 font-semibold">
                    {editCategoryForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="pt-2 pb-1">
                <button
                  type="submit"
                  disabled={editCategoryMutation.isPending}
                  className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all disabled:opacity-50"
                >
                  {editCategoryMutation.isPending ? "Updating Category..." : "Update Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
