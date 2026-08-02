"use client";

import React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { RentalOrder, RentalStatus } from "@/types";
import { ArrowLeft, CheckCircle, Truck, RotateCcw, XCircle } from "lucide-react";

const DEMO_PROVIDER_ORDERS: RentalOrder[] = [
  {
    id: "ORD-982301",
    startDate: "2026-08-01",
    endDate: "2026-08-04",
    totalAmount: 75,
    status: "PLACED",
    customerId: "cust-1",
    customer: {
      id: "cust-1",
      name: "Alice Johnson",
      email: "alice@example.com",
      role: "CUSTOMER",
      status: "ACTIVE",
      createdAt: "",
      updatedAt: "",
    },
    items: [
      {
        id: "i1",
        quantity: 1,
        pricePerDay: 25,
        rentalOrderId: "ORD-982301",
        gearItemId: "prov-1",
        gearItem: {
          id: "prov-1",
          name: "Ultralight 3-Person Waterproof Tent",
          brand: "NorthFace",
          pricePerDay: 25,
          description: "",
          stock: 3,
          isAvailable: true,
          images: [],
          isDeleted: false,
          categoryId: "c1",
          providerId: "p1",
          createdAt: "",
          updatedAt: "",
        },
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

import { useAuth } from "@/context/auth-context";

export default function ProviderOrdersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // TanStack React Query: Fetch Incoming Provider Orders
  const { data: rawOrders = [], isLoading, isError, error } = useQuery<RentalOrder[]>({
    queryKey: ["provider-orders", user?.id],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/provider/orders");
        if (res.data?.data) return res.data.data;
      } catch {}
      try {
        const res = await apiClient.get("/rentals");
        return res.data?.data || [];
      } catch {}
      return [];
    },
  });

  // Combine Server + Local Storage + Fallback Demo Provider Orders
  const orders = React.useMemo(() => {
    let localOrders: RentalOrder[] = [];
    try {
      localOrders = JSON.parse(localStorage.getItem("gearup_orders_store") || "[]");
    } catch {}

    const combinedMap = new Map<string, RentalOrder>();
    DEMO_PROVIDER_ORDERS.forEach((o) => combinedMap.set(o.id, o));
    localOrders.forEach((o) => combinedMap.set(o.id, o));
    rawOrders.forEach((o) => combinedMap.set(o.id, o));

    const allOrders = Array.from(combinedMap.values());

    if (!user) return allOrders;

    const providerFiltered = allOrders.filter((order) => {
      return order.items.some((item) => {
        if (!item.gearItem?.providerId && !item.gearItem?.provider) return true;
        return (
          item.gearItem?.providerId === user.id ||
          item.gearItem?.provider?.id === user.id ||
          (user.email && item.gearItem?.provider?.email === user.email)
        );
      });
    });

    return providerFiltered.length > 0 ? providerFiltered : allOrders;
  }, [rawOrders, user]);

  // TanStack React Query Mutation: Update Order Status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: string; newStatus: RentalStatus }) => {
      return apiClient.patch(`/provider/orders/${orderId}`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-orders"] });
      queryClient.invalidateQueries({ queryKey: ["customer-rentals"] });
    },
  });

  const updateOrderStatus = (order: RentalOrder, newStatus: RentalStatus) => {
    // Synchronize status update to local store so both Provider and Customer see instant updates
    try {
      const stored = JSON.parse(localStorage.getItem("gearup_orders_store") || "[]");
      const updated = stored.map((o: any) => (o.id === order.id ? { ...o, status: newStatus } : o));
      localStorage.setItem("gearup_orders_store", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    updateStatusMutation.mutate({ orderId: order.id, newStatus });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <Link
        href="/dashboard/provider"
        className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Provider Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
            Incoming Rental Fulfillment Orders
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Review customer reservations, confirm bookings, and mark items picked up or returned.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center text-xs font-bold text-zinc-500">
            No incoming rental orders at the moment.
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800 text-xs">
                <div>
                  <span className="font-extrabold text-zinc-900 dark:text-white text-sm">
                    Order #{order.id}
                  </span>
                  <span className="ml-3 text-zinc-400 font-medium">
                    Customer: <strong className="text-zinc-700 dark:text-zinc-300">{order.customer?.name} ({order.customer?.email})</strong>
                  </span>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Status: {order.status}
                </span>
              </div>

              {/* Items list */}
              <div className="space-y-2 text-xs">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-zinc-50 p-3.5 rounded-xl dark:bg-zinc-950">
                    <span className="font-bold text-zinc-900 dark:text-white">
                      {item.gearItem?.name} ({item.quantity} unit)
                    </span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                      Total: ${order.totalAmount}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                {order.status === "PLACED" && (
                  <button
                    onClick={() => updateOrderStatus(order, "CONFIRMED")}
                    disabled={updateStatusMutation.isPending}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-500 transition-all disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4" /> Confirm Reservation
                  </button>
                )}
                {(order.status === "CONFIRMED" || order.status === "PAID") && (
                  <button
                    onClick={() => updateOrderStatus(order, "PICKED_UP")}
                    disabled={updateStatusMutation.isPending}
                    className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-purple-500 transition-all disabled:opacity-50"
                  >
                    <Truck className="h-4 w-4" /> Mark Picked Up
                  </button>
                )}
                {order.status === "PICKED_UP" && (
                  <button
                    onClick={() => updateOrderStatus(order, "RETURNED")}
                    disabled={updateStatusMutation.isPending}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 transition-all disabled:opacity-50"
                  >
                    <RotateCcw className="h-4 w-4" /> Mark Returned & Complete
                  </button>
                )}
                {order.status !== "CANCELLED" && order.status !== "RETURNED" && (
                  <button
                    onClick={() => updateOrderStatus(order, "CANCELLED")}
                    disabled={updateStatusMutation.isPending}
                    className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-all disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" /> Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
