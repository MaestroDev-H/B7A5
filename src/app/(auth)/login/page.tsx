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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

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
    <Card className="w-full max-w-md shadow-xl border-zinc-200 dark:border-zinc-800">
      <CardHeader className="text-center space-y-2 pb-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20">
          <Dumbbell className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-extrabold">Welcome Back to GearUp</CardTitle>
        <CardDescription>Sign in to manage rentals & access your role dashboard</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {errorMessage && (
          <div className="flex items-center gap-2.5 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/50">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400 z-10" />
              <Input
                id="email"
                {...register("email")}
                type="email"
                placeholder="customer@example.com"
                className="pl-10"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-[11px] text-rose-500 font-semibold">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400 z-10" />
              <Input
                id="password"
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="pl-10"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-[11px] text-rose-500 font-semibold">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 text-xs sm:text-sm font-extrabold mt-2"
          >
            {isLoading ? "Signing in..." : "Sign In to Account"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center border-t border-zinc-100 dark:border-zinc-800 pt-4 text-xs text-zinc-500">
        Don't have an account?{" "}
        <Link href="/register" className="font-extrabold text-emerald-600 hover:underline ml-1">
          Register now
        </Link>
      </CardFooter>
    </Card>
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
