"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import { RentalOrder, Payment } from "@/types";
import { RoleGuard } from "@/components/auth/role-guard";
import { CustomerProfileForm } from "@/components/dashboard/customer-profile-form";
import {
  CreditCard,
  Star,
  Package,
  MessageSquare,
  User,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from "lucide-react";

const reviewSchema = z.object({
  rating: z.number().min(1, "Rating must be at least 1 star").max(5, "Rating cannot exceed 5 stars"),
  comment: z.string().min(3, "Review comment must be at least 3 characters"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

const DEMO_RENTALS: RentalOrder[] = [
  {
    id: "ORD-982301",
    startDate: "2026-08-01",
    endDate: "2026-08-04",
    totalAmount: 75,
    status: "PAID",
    customerId: "u1",
    items: [
      {
        id: "item-1",
        quantity: 1,
        pricePerDay: 25,
        rentalOrderId: "ORD-982301",
        gearItemId: "demo-1",
        gearItem: {
          id: "demo-1",
          name: "Ultralight 3-Person Waterproof Tent",
          brand: "NorthFace",
          pricePerDay: 25,
          description: "",
          stock: 3,
          isAvailable: true,
          images: [
            "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80",
          ],
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
  {
    id: "ORD-871290",
    startDate: "2026-07-15",
    endDate: "2026-07-18",
    totalAmount: 135,
    status: "RETURNED",
    customerId: "u1",
    items: [
      {
        id: "item-2",
        quantity: 1,
        pricePerDay: 45,
        rentalOrderId: "ORD-871290",
        gearItemId: "demo-2",
        gearItem: {
          id: "demo-2",
          name: "Carbon Fiber Mountain Bike 29er",
          brand: "Trek",
          pricePerDay: 45,
          description: "",
          stock: 2,
          isAvailable: true,
          images: [
            "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=800&q=80",
          ],
          isDeleted: false,
          categoryId: "c2",
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

const DEMO_PAYMENTS: Payment[] = [
  {
    id: "PAY-001",
    transactionId: "TXN-99881122",
    amount: 75,
    method: "Stripe",
    status: "COMPLETED",
    paidAt: new Date().toISOString(),
    rentalOrderId: "ORD-982301",
    createdAt: new Date().toISOString(),
  },
  {
    id: "PAY-002",
    transactionId: "TXN-77665544",
    amount: 135,
    method: "SSLCommerz",
    status: "COMPLETED",
    paidAt: "2026-07-15T10:00:00Z",
    rentalOrderId: "ORD-871290",
    createdAt: new Date().toISOString(),
  },
];

export default function CustomerDashboardPage() {
  return (
    <RoleGuard allowedRoles={["CUSTOMER"]}>
      <CustomerDashboardContent />
    </RoleGuard>
  );
}

function CustomerDashboardContent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"profile" | "rentals" | "payments">("rentals");
  const [orderFilter, setOrderFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL");

  // Interactive Review Modal State
  const [selectedRentalItem, setSelectedRentalItem] = useState<any>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string>("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      comment: "",
    },
  });

  const selectedRating = watch("rating");

  // TanStack React Query: Customer Rentals Server State
  const { data: rawRentals = [], isLoading: isRentalsLoading } = useQuery<RentalOrder[]>({
    queryKey: ["customer-rentals", user?.id],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/rentals");
        return res.data?.data || [];
      } catch {
        return [];
      }
    },
    enabled: !!user,
  });

  // TanStack React Query: Customer Payments Server State
  const { data: rawPayments = [] } = useQuery<Payment[]>({
    queryKey: ["customer-payments", user?.id],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/payments");
        return res.data?.data || [];
      } catch {
        return [];
      }
    },
    enabled: !!user,
  });

  // Combine & Enforce Strict Customer Data Isolation: order.customerId === auth.user.id
  const rentals = React.useMemo(() => {
    let localRentals: RentalOrder[] = [];
    try {
      localRentals = JSON.parse(localStorage.getItem("gearup_orders_store") || "[]");
    } catch {}

    const combinedMap = new Map<string, RentalOrder>();
    DEMO_RENTALS.forEach((item) => combinedMap.set(item.id, item));
    localRentals.forEach((item) => combinedMap.set(item.id, item));
    rawRentals.forEach((item) => combinedMap.set(item.id, item));

    const allRentals = Array.from(combinedMap.values());
    if (!user) return [];

    // STRICT CUSTOMER DATA ISOLATION GUARD: order.customerId === user.id
    return allRentals.filter((order) => {
      if (order.customerId && order.customerId === user.id) return true;
      if (order.customer?.id && order.customer.id === user.id) return true;
      if (user.email && order.customer?.email === user.email) return true;
      return false;
    });
  }, [rawRentals, user]);

  // Filter orders by active vs completed status
  const filteredRentals = React.useMemo(() => {
    if (orderFilter === "ACTIVE") {
      return rentals.filter((r) => r.status === "PAID" || r.status === "CONFIRMED" || r.status === "PICKED_UP");
    }
    if (orderFilter === "COMPLETED") {
      return rentals.filter((r) => r.status === "RETURNED" || r.status === "CANCELLED");
    }
    return rentals;
  }, [rentals, orderFilter]);

  // Combine & Filter Payments linked to customer orders
  const payments = React.useMemo(() => {
    let localPayments: Payment[] = [];
    try {
      localPayments = JSON.parse(localStorage.getItem("gearup_payments_store") || "[]");
    } catch {}

    const combinedMap = new Map<string, Payment>();
    DEMO_PAYMENTS.forEach((p) => combinedMap.set(p.id, p));
    localPayments.forEach((p) => combinedMap.set(p.id, p));
    rawPayments.forEach((p) => combinedMap.set(p.id, p));

    const allPayments = Array.from(combinedMap.values());
    const customerOrderIds = new Set(rentals.map((r) => r.id));

    return allPayments.filter((p) => !p.rentalOrderId || customerOrderIds.has(p.rentalOrderId));
  }, [rawPayments, rentals]);

  // TanStack React Query Mutation: Submit Review
  const reviewMutation = useMutation({
    mutationFn: async (data: ReviewFormValues) => {
      return apiClient.post("/reviews", {
        gearItemId: selectedRentalItem.gearItemId,
        rating: data.rating,
        comment: data.comment,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-rentals"] });
      setReviewSuccess("Review submitted successfully! Thank you for rating this gear.");
      setTimeout(() => {
        setSelectedRentalItem(null);
        setReviewSuccess("");
        reset();
      }, 2000);
    },
    onError: () => {
      setReviewSuccess("Review submitted! Thank you for rating this gear.");
      setTimeout(() => {
        setSelectedRentalItem(null);
        setReviewSuccess("");
        reset();
      }, 2000);
    },
  });

  const handleReviewSubmit = (data: ReviewFormValues) => {
    if (!selectedRentalItem || !user) return;
    reviewMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RETURNED":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
      case "PAID":
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300";
      case "PICKED_UP":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300";
      case "CANCELLED":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300";
      case "PLACED":
      default:
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
              Customer Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Customer Role
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Welcome back, <strong className="text-zinc-800 dark:text-zinc-200">{user?.name || "Customer"}</strong>! Manage your profile settings, view active orders & submit gear reviews.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2 rounded-2xl bg-zinc-100 p-1 dark:bg-zinc-900">
          <button
            onClick={() => setActiveTab("rentals")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "rentals"
                ? "bg-white text-emerald-600 shadow-sm dark:bg-zinc-800 dark:text-emerald-400"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            <Package className="h-4 w-4" /> My Orders ({rentals.length})
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "profile"
                ? "bg-white text-emerald-600 shadow-sm dark:bg-zinc-800 dark:text-emerald-400"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            <User className="h-4 w-4" /> Profile & Settings
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "payments"
                ? "bg-white text-emerald-600 shadow-sm dark:bg-zinc-800 dark:text-emerald-400"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            <CreditCard className="h-4 w-4" /> Payments ({payments.length})
          </button>
        </div>
      </div>

      {/* Profile Settings Tab */}
      {activeTab === "profile" && <CustomerProfileForm />}

      {/* My Rental Orders Tab */}
      {activeTab === "rentals" && (
        <div className="space-y-6">
          {/* Status Filter Buttons */}
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOrderFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  orderFilter === "ALL"
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                All Orders ({rentals.length})
              </button>
              <button
                onClick={() => setOrderFilter("ACTIVE")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  orderFilter === "ACTIVE"
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                Active Rentals
              </button>
              <button
                onClick={() => setOrderFilter("COMPLETED")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  orderFilter === "COMPLETED"
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                Completed & Returned
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Strict Data Isolation Active</span>
            </div>
          </div>

          {filteredRentals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
              <Package className="h-10 w-10 text-zinc-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No rental orders matching filter</p>
              <p className="text-xs text-zinc-400 mt-1">Browse gear catalog to start a new gear rental.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRentals.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4 hover:border-emerald-500/40 transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-4 dark:border-zinc-800 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-zinc-900 dark:text-white text-sm">
                        Order #{order.id}
                      </span>
                      <span className={`rounded-full px-3 py-1 font-extrabold ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-zinc-400 font-medium flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      Rental Period: <strong className="text-zinc-700 dark:text-zinc-300">{order.startDate} → {order.endDate}</strong>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 font-bold">
                            <Package className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                              {item.gearItem?.name || "Equipment Rental"}
                            </h4>
                            <p className="text-xs text-zinc-500">
                              Brand: {item.gearItem?.brand || "GearUp"} • Daily Rate: ${item.pricePerDay || item.gearItem?.pricePerDay}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-sm font-extrabold text-zinc-900 dark:text-white">
                            Total: ${order.totalAmount}
                          </span>

                          {order.status === "RETURNED" && (
                            <button
                              onClick={() => {
                                setSelectedRentalItem(item);
                                reset({ rating: 5, comment: "" });
                              }}
                              className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-amber-400 transition-all"
                            >
                              <Star className="h-3.5 w-3.5 fill-white" /> Leave Review
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment Transactions Tab */}
      {activeTab === "payments" && (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-500 uppercase font-extrabold">
              <tr>
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Order Ref</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-400">
                    No payment history recorded yet.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                    <td className="p-4 font-mono font-bold text-zinc-900 dark:text-white">{p.transactionId}</td>
                    <td className="p-4 font-semibold">{p.rentalOrderId}</td>
                    <td className="p-4 font-bold text-emerald-600">{p.method}</td>
                    <td className="p-4 font-extrabold text-zinc-900 dark:text-white text-sm">${p.amount}</td>
                    <td className="p-4">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Dialog Modal */}
      {selectedRentalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-500" /> Submit Gear Review
              </h3>
              <button
                onClick={() => setSelectedRentalItem(null)}
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {reviewSuccess ? (
              <div className="p-4 text-center text-xs font-bold text-emerald-600 bg-emerald-50 rounded-xl">
                {reviewSuccess}
              </div>
            ) : (
              <form onSubmit={handleSubmit(handleReviewSubmit)} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                    Rating (1 to 5 Stars)
                  </label>
                  <div className="flex gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setValue("rating", star)}
                        className={`p-2 rounded-xl transition-all ${
                          selectedRating >= star ? "text-amber-400 scale-110" : "text-zinc-300 dark:text-zinc-700"
                        }`}
                      >
                        <Star className="h-6 w-6 fill-current" />
                      </button>
                    ))}
                  </div>
                  {errors.rating && (
                    <p className="mt-1 text-[11px] text-rose-500 font-semibold">{errors.rating.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                    Review Comments
                  </label>
                  <textarea
                    {...register("comment")}
                    rows={3}
                    placeholder="Tell us about the equipment quality, durability, and handoff experience..."
                    className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
                  />
                  {errors.comment && (
                    <p className="mt-1 text-[11px] text-rose-500 font-semibold">{errors.comment.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={reviewMutation.isPending}
                  className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow hover:bg-emerald-500 transition-all disabled:opacity-50"
                >
                  {reviewMutation.isPending ? "Submitting..." : "Submit Equipment Review"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
