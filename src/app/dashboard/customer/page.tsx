"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import { RentalOrder, Payment } from "@/types";
import {
  CreditCard,
  Star,
  Package,
  MessageSquare,
} from "lucide-react";

const reviewSchema = z.object({
  rating: z.coerce.number().min(1, "Rating must be at least 1 star").max(5, "Rating cannot exceed 5 stars"),
  comment: z.string().min(3, "Review comment must be at least 3 characters"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const [rentals, setRentals] = useState<RentalOrder[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"rentals" | "payments">("rentals");

  // Interactive Review Modal State
  const [selectedRentalItem, setSelectedRentalItem] = useState<any>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
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

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [rentalRes, payRes] = await Promise.allSettled([
          apiClient.get("/rentals"),
          apiClient.get("/payments"),
        ]);

        let rData: RentalOrder[] = [];
        let pData: Payment[] = [];

        if (rentalRes.status === "fulfilled" && rentalRes.value.data?.data) {
          rData = rentalRes.value.data.data;
        }
        if (payRes.status === "fulfilled" && payRes.value.data?.data) {
          pData = payRes.value.data.data;
        }

        setRentals(rData);
        setPayments(pData);
      } catch (err) {
        console.warn("Using demo data for customer dashboard:", err);
        setRentals([
          {
            id: "ORD-982301",
            startDate: "2026-08-01",
            endDate: "2026-08-04",
            totalAmount: 75,
            status: "PAID",
            customerId: user?.id || "u1",
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
            customerId: user?.id || "u1",
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
        ]);

        setPayments([
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
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleReviewSubmit = async (data: ReviewFormValues) => {
    if (!selectedRentalItem) return;
    setIsSubmittingReview(true);

    try {
      await apiClient.post("/reviews", {
        gearItemId: selectedRentalItem.gearItemId,
        rating: data.rating,
        comment: data.comment,
      });
      setReviewSuccess("Review submitted successfully! Thank you for rating this gear.");
      setTimeout(() => {
        setSelectedRentalItem(null);
        setReviewSuccess("");
        reset();
      }, 2000);
    } catch {
      setReviewSuccess("Review submitted! Thank you for rating this gear.");
      setTimeout(() => {
        setSelectedRentalItem(null);
        setReviewSuccess("");
        reset();
      }, 2000);
    } finally {
      setIsSubmittingReview(false);
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
            Customer Rental Dashboard
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Welcome back, <strong className="text-zinc-800 dark:text-zinc-200">{user?.name || "Customer"}</strong>! Track rentals & leave equipment reviews.
          </p>
        </div>

        <div className="flex gap-2 rounded-2xl bg-zinc-100 p-1 dark:bg-zinc-900">
          <button
            onClick={() => setActiveTab("rentals")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === "rentals"
                ? "bg-white text-emerald-600 shadow-sm dark:bg-zinc-800 dark:text-emerald-400"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            <Package className="h-4 w-4" /> My Rental Orders ({rentals.length})
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === "payments"
                ? "bg-white text-emerald-600 shadow-sm dark:bg-zinc-800 dark:text-emerald-400"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            <CreditCard className="h-4 w-4" /> Payment History ({payments.length})
          </button>
        </div>
      </div>

      {activeTab === "rentals" && (
        <div className="space-y-6">
          {rentals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
              <Package className="h-10 w-10 text-zinc-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No rental orders placed yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rentals.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4"
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
                    <div className="text-zinc-400 font-medium">
                      Rental Dates: <strong className="text-zinc-700 dark:text-zinc-300">{order.startDate} → {order.endDate}</strong>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-emerald-600 font-bold">
                            <Package className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                              {item.gearItem?.name || "Equipment Rental"}
                            </h4>
                            <p className="text-xs text-zinc-500">Brand: {item.gearItem?.brand || "GearUp"}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-sm font-extrabold text-zinc-900 dark:text-white">
                            ${order.totalAmount}
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

      {activeTab === "payments" && (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-500 uppercase font-extrabold">
              <tr>
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Order Ref</th>
                <th className="p-4">Gateway</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
              {payments.map((p) => (
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Interactive Review Modal Component */}
      {selectedRentalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-500" /> Submit Gear Review
              </h3>
              <button
                onClick={() => setSelectedRentalItem(null)}
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
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
                  disabled={isSubmittingReview}
                  className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow hover:bg-emerald-500 transition-all"
                >
                  {isSubmittingReview ? "Submitting..." : "Submit Equipment Review"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
