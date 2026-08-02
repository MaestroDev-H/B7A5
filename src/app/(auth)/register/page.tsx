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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

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

  const from = searchParams.get("from");

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
          if (data.role === "CUSTOMER" && from) {
            router.push(from);
          } else {
            router.push(data.role === "PROVIDER" ? "/dashboard/provider" : "/dashboard/customer");
          }
        } else {
          router.push(from ? `/login?from=${encodeURIComponent(from)}` : "/login");
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Registration failed. Email may already be registered.");
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
        <CardTitle className="text-2xl font-extrabold">Create GearUp Account</CardTitle>
        <CardDescription>Join as a Customer or Equipment Provider</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3.5 text-xs font-semibold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Account Type / Role</Label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <Button
                type="button"
                variant={selectedRole === "CUSTOMER" ? "default" : "outline"}
                className={`h-auto flex-col p-3.5 ${
                  selectedRole === "CUSTOMER"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-bold dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100"
                    : "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400"
                }`}
                onClick={() => setValue("role", "CUSTOMER")}
              >
                <UserIcon className="h-5 w-5 mb-1 text-emerald-600" />
                <span className="text-xs">Customer</span>
                <span className="text-[10px] text-zinc-400 font-normal">Rent gear</span>
              </Button>

              <Button
                type="button"
                variant={selectedRole === "PROVIDER" ? "default" : "outline"}
                className={`h-auto flex-col p-3.5 ${
                  selectedRole === "PROVIDER"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-bold dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100"
                    : "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400"
                }`}
                onClick={() => setValue("role", "PROVIDER")}
              >
                <Store className="h-5 w-5 mb-1 text-emerald-600" />
                <span className="text-xs">Provider</span>
                <span className="text-[10px] text-zinc-400 font-normal">Rent out gear</span>
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400 z-10" />
              <Input
                id="name"
                {...register("name")}
                type="text"
                placeholder="John Doe"
                className="pl-10"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-[11px] text-rose-500 font-semibold">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400 z-10" />
              <Input
                id="email"
                {...register("email")}
                type="email"
                placeholder="john@example.com"
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
                placeholder="At least 6 characters"
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
            {isLoading ? "Creating Account..." : `Register as ${selectedRole}`}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center border-t border-zinc-100 dark:border-zinc-800 pt-4 text-xs text-zinc-500">
        Already have an account?{" "}
        <Link
          href={from ? `/login?from=${encodeURIComponent(from)}` : "/login"}
          className="font-extrabold text-emerald-600 hover:underline ml-1"
        >
          Sign in
        </Link>
      </CardFooter>
    </Card>
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
