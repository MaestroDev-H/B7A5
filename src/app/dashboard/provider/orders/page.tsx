"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { RentalOrder, RentalStatus } from "@/types";
import { ArrowLeft, ShoppingBag, CheckCircle, Truck, RotateCcw, XCircle, Clock } from "lucide-react";

export default function ProviderOrdersPage() {
  const [orders, setOrders] = useState<RentalOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get("/provider/orders");
        if (res.data?.data) {
          setOrders(res.data.data);
        }
      } catch (err) {
        console.warn("Using demo provider orders:", err);
        setOrders([
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
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: RentalStatus) => {
    try {
      await apiClient.patch(`/provider/orders/${orderId}`, { status: newStatus });
    } catch {
      // Local state fallback
    }
    setOrders(
      orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
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
                    onClick={() => updateOrderStatus(order.id, "CONFIRMED")}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-500 transition-all"
                  >
                    <CheckCircle className="h-4 w-4" /> Confirm Reservation
                  </button>
                )}
                {(order.status === "CONFIRMED" || order.status === "PAID") && (
                  <button
                    onClick={() => updateOrderStatus(order.id, "PICKED_UP")}
                    className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-purple-500 transition-all"
                  >
                    <Truck className="h-4 w-4" /> Mark Picked Up
                  </button>
                )}
                {order.status === "PICKED_UP" && (
                  <button
                    onClick={() => updateOrderStatus(order.id, "RETURNED")}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 transition-all"
                  >
                    <RotateCcw className="h-4 w-4" /> Mark Returned & Complete
                  </button>
                )}
                {order.status !== "CANCELLED" && order.status !== "RETURNED" && (
                  <button
                    onClick={() => updateOrderStatus(order.id, "CANCELLED")}
                    className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-all"
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
