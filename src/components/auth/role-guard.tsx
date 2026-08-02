"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Role } from "@/types";
import { ShieldAlert, Loader2 } from "lucide-react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Role[];
  redirectTo?: string;
}

export function RoleGuard({
  children,
  allowedRoles,
  redirectTo,
}: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (!allowedRoles.includes(user.role)) {
        const fallback =
          redirectTo ||
          (user.role === "ADMIN"
            ? "/dashboard/admin"
            : user.role === "PROVIDER"
            ? "/dashboard/provider"
            : "/dashboard/customer");
        router.push(fallback);
      }
    }
  }, [user, isLoading, allowedRoles, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Verifying security authorization...
        </p>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Access Denied
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md">
          You do not have authorization to view this area. Redirecting to your assigned dashboard...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
