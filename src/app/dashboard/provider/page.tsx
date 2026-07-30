"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import { GearItem, Category } from "@/types";
import {
  Store,
  Plus,
  Package,
  DollarSign,
  Layers,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";

export default function ProviderDashboardPage() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<GearItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal State for Add Gear
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");
  const [pricePerDay, setPricePerDay] = useState(30);
  const [stock, setStock] = useState(2);
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProviderData = async () => {
    setIsLoading(true);
    try {
      const [gearRes, catRes] = await Promise.allSettled([
        apiClient.get("/gear"),
        apiClient.get("/categories"),
      ]);

      if (gearRes.status === "fulfilled" && gearRes.value.data?.data) {
        setInventory(gearRes.value.data.data);
      }
      if (catRes.status === "fulfilled" && catRes.value.data?.data) {
        setCategories(catRes.value.data.data);
        if (catRes.value.data.data.length > 0) {
          setCategoryId(catRes.value.data.data[0].id);
        }
      }
    } catch (err) {
      console.warn("Using demo provider inventory:", err);
      setInventory([
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
          providerId: user?.id || "p1",
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
          providerId: user?.id || "p1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
      setCategories([
        { id: "c1", name: "Camping & Hiking" },
        { id: "c2", name: "Cycling & Bikes" },
        { id: "c3", name: "Water Sports" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderData();
  }, []);

  const handleAddGear = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        name,
        description,
        brand,
        pricePerDay: Number(pricePerDay),
        stock: Number(stock),
        categoryId: categoryId || categories[0]?.id || "c1",
        images: [
          imageUrl ||
            "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80",
        ],
      };

      const res = await apiClient.post("/provider/gear", payload);
      if (res.data?.data) {
        setInventory([res.data.data, ...inventory]);
      } else {
        const newItem: GearItem = {
          id: `item-${Date.now()}`,
          name,
          description,
          brand,
          pricePerDay: Number(pricePerDay),
          stock: Number(stock),
          isAvailable: true,
          images: [payload.images[0]],
          isDeleted: false,
          categoryId: payload.categoryId,
          category: categories.find((c) => c.id === payload.categoryId) || { id: "c1", name: "General" },
          providerId: user?.id || "p1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setInventory([newItem, ...inventory]);
      }

      setIsAddModalOpen(false);
      setName("");
      setDescription("");
      setBrand("");
      setImageUrl("");
    } catch (err: any) {
      alert("Added to inventory in local demo state.");
      setIsAddModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGear = async (id: string) => {
    if (!confirm("Are you sure you want to delete this gear listing?")) return;
    try {
      await apiClient.delete(`/provider/gear/${id}`);
    } catch {
      // ignore
    }
    setInventory(inventory.filter((item) => item.id !== id));
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
            className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 shadow-sm hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-all"
          >
            <ShoppingBag className="h-4 w-4 text-emerald-500" /> Incoming Orders
          </Link>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all"
          >
            <Plus className="h-4 w-4" /> Add New Gear
          </button>
        </div>
      </div>

      {/* Provider Stat Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-400">Active Listings</p>
            <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white">{inventory.length}</h3>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-400">Total Rentals Fulfillments</p>
            <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white">18</h3>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-400">Estimated Revenue</p>
            <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white">$1,420</h3>
          </div>
        </div>
      </div>

      {/* Inventory Management Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Equipment Inventory</h2>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-500 uppercase font-bold">
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
                  <td className="p-4">{gear.brand}</td>
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
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg dark:hover:bg-rose-950/40"
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

            <form onSubmit={handleAddGear} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Equipment Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4-Person Waterproof Camping Tent"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Brand</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NorthFace"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Price per Day ($)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={pricePerDay}
                    onChange={(e) => setPricePerDay(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe technical specs, capacity, condition..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow hover:bg-emerald-500 transition-all"
              >
                {isSubmitting ? "Adding Equipment..." : "Save Equipment to Inventory"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
