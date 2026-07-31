"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
} from "lucide-react";

const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function AdminDashboardPage() {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "categories">("users");

  // Category modal
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [usersRes, catRes] = await Promise.allSettled([
          apiClient.get("/admin/users"),
          apiClient.get("/categories"),
        ]);

        if (usersRes.status === "fulfilled" && usersRes.value.data?.data) {
          setUsers(usersRes.value.data.data);
        }
        if (catRes.status === "fulfilled" && catRes.value.data?.data) {
          setCategories(catRes.value.data.data);
        }
      } catch (err) {
        console.warn("Using demo admin data:", err);
        setUsers([
          {
            id: "u1",
            name: "John Customer",
            email: "customer@example.com",
            role: "CUSTOMER",
            status: "ACTIVE",
            createdAt: "2026-07-01",
            updatedAt: "",
          },
          {
            id: "u2",
            name: "Summit Rental Store",
            email: "provider@summit.com",
            role: "PROVIDER",
            status: "ACTIVE",
            createdAt: "2026-07-05",
            updatedAt: "",
          },
          {
            id: "u3",
            name: "Flagged User Account",
            email: "spam@example.com",
            role: "CUSTOMER",
            status: "SUSPENDED",
            createdAt: "2026-07-10",
            updatedAt: "",
          },
        ]);
        setCategories([
          { id: "1", name: "Camping & Hiking" },
          { id: "2", name: "Cycling & Bikes" },
          { id: "3", name: "Water Sports" },
          { id: "4", name: "Winter Sports" },
          { id: "5", name: "Fitness & Gym" },
        ]);
      }
    };

    fetchAdminData();
  }, []);

  const toggleUserStatus = async (userId: string, currentStatus: UserStatus) => {
    const nextStatus: UserStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await apiClient.patch(`/admin/users/${userId}`, { status: nextStatus });
    } catch {
      // Fallback
    }
    setUsers(
      users.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
    );
  };

  const handleAddCategorySubmit = async (data: CategoryFormValues) => {
    try {
      const res = await apiClient.post("/categories", { name: data.name });
      if (res.data?.data) {
        setCategories([...categories, res.data.data]);
      } else {
        setCategories([...categories, { id: `cat-${Date.now()}`, name: data.name }]);
      }
    } catch {
      setCategories([...categories, { id: `cat-${Date.now()}`, name: data.name }]);
    } finally {
      reset();
      setIsCatModalOpen(false);
    }
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

          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <table className="w-full text-left text-xs">
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
                          className={`inline-flex items-center gap-1 rounded-xl px-3.5 py-1.5 font-bold text-xs transition-colors ${
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span className="font-bold text-sm text-zinc-900 dark:text-white">{cat.name}</span>
                <span className="text-xs text-zinc-400 font-mono">ID: {cat.id}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Create Gear Category</h3>
              <button onClick={() => setIsCatModalOpen(false)} className="text-zinc-400 hover:text-zinc-900">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(handleAddCategorySubmit)} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Category Name</label>
                <input
                  {...register("name")}
                  type="text"
                  placeholder="e.g. Climbing & Mountaineering"
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                />
                {errors.name && (
                  <p className="mt-1 text-[11px] text-rose-500 font-semibold">{errors.name.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow hover:bg-emerald-500 transition-all"
              >
                Create Category
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
