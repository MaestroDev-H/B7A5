"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import { Role } from "@/types";
import { Dumbbell, ArrowRight, Lock, Mail, User as UserIcon, Store, AlertCircle } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["CUSTOMER", "PROVIDER"]),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get("role") as Role) || "CUSTOMER";

  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: initialRole === "PROVIDER" ? "PROVIDER" : "CUSTOMER",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterFormValues) => {
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await apiClient.post("/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });

      if (res.data?.data) {
        const loginRes = await apiClient.post("/auth/login", {
          email: data.email,
          password: data.password,
        });
        if (loginRes.data?.data?.token) {
          login(loginRes.data.data.token, loginRes.data.data.user);
          router.push(data.role === "PROVIDER" ? "/dashboard/provider" : "/dashboard/customer");
        } else {
          router.push("/login");
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Registration failed. Email may already be registered.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20">
          <Dumbbell className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white">
          Create GearUp Account
        </h2>
        <p className="text-xs text-zinc-500">Join as a Customer or Equipment Provider</p>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3.5 text-xs font-semibold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Account Type / Role
          </label>
          <div className="grid grid-cols-2 gap-3 mt-1.5">
            <button
              type="button"
              onClick={() => setValue("role", "CUSTOMER")}
              className={`flex flex-col items-center justify-center rounded-2xl border p-3.5 text-center transition-all ${
                selectedRole === "CUSTOMER"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-bold dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400"
              }`}
            >
              <UserIcon className="h-5 w-5 mb-1 text-emerald-600" />
              <span className="text-xs">Customer</span>
              <span className="text-[10px] text-zinc-400 font-normal">Rent gear</span>
            </button>

            <button
              type="button"
              onClick={() => setValue("role", "PROVIDER")}
              className={`flex flex-col items-center justify-center rounded-2xl border p-3.5 text-center transition-all ${
                selectedRole === "PROVIDER"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-bold dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400"
              }`}
            >
              <Store className="h-5 w-5 mb-1 text-emerald-600" />
              <span className="text-xs">Provider</span>
              <span className="text-[10px] text-zinc-400 font-normal">Rent out gear</span>
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Full Name
          </label>
          <div className="relative mt-1">
            <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
            <input
              {...register("name")}
              type="text"
              placeholder="John Doe"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-2.5 text-sm text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-[11px] text-rose-500 font-semibold">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Email Address
          </label>
          <div className="relative mt-1">
            <Mail className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
            <input
              {...register("email")}
              type="email"
              placeholder="john@example.com"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-2.5 text-sm text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-[11px] text-rose-500 font-semibold">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Password
          </label>
          <div className="relative mt-1">
            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
            <input
              {...register("password")}
              type="password"
              placeholder="At least 6 characters"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-2.5 text-sm text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-[11px] text-rose-500 font-semibold">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 disabled:opacity-50 transition-all"
        >
          {isLoading ? "Creating Account..." : `Register as ${selectedRole}`}
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <div className="text-center text-xs text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-800">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-emerald-600 hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-xs text-zinc-400">Loading form...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
