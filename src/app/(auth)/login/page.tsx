"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import { Dumbbell, ArrowRight, Lock, Mail, AlertCircle } from "lucide-react";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/dashboard";

  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await apiClient.post("/auth/login", {
        email: data.email,
        password: data.password,
      });
      if (res.data?.data?.token) {
        const { token, user } = res.data.data;
        login(token, user);

        if (user.role === "ADMIN") {
          router.push("/dashboard/admin");
        } else if (user.role === "PROVIDER") {
          router.push("/dashboard/provider");
        } else {
          router.push(from === "/dashboard" ? "/dashboard/customer" : from);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid credentials. Please check your email and password.");
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
          Welcome Back to GearUp
        </h2>
        <p className="text-xs text-zinc-500">Sign in to manage rentals & access your role dashboard</p>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/50">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
            Email Address
          </label>
          <div className="relative mt-1">
            <Mail className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
            <input
              {...register("email")}
              type="email"
              placeholder="customer@example.com"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-2.5 text-xs font-medium text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-[11px] text-rose-500 font-semibold">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
            Password
          </label>
          <div className="relative mt-1">
            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
            <input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-2.5 text-xs font-medium text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-[11px] text-rose-500 font-semibold">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 disabled:opacity-50 transition-all"
        >
          {isLoading ? "Signing in..." : "Sign In to Account"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <div className="text-center text-xs text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-800">
        Don't have an account?{" "}
        <Link href="/register" className="font-extrabold text-emerald-600 hover:underline">
          Register now
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-xs text-zinc-400 font-bold">Loading authentication form...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
