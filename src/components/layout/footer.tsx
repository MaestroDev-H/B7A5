import React from "react";
import Link from "next/link";
import { Dumbbell, ShieldCheck, Truck, Clock, HeartHandshake } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-900 text-zinc-300 border-t border-zinc-800">
      {/* Feature Badges */}
      <div className="border-b border-zinc-800 bg-zinc-950/50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Insured Gear</h4>
              <p className="text-xs text-zinc-400">All equipment quality checked</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Flexible Pickup</h4>
              <p className="text-xs text-zinc-400">Convenient local locations</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Daily & Weekly</h4>
              <p className="text-xs text-zinc-400">Rent as long as you need</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Verified Providers</h4>
              <p className="text-xs text-zinc-400">Top-rated rental vendors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
              <Dumbbell className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Gear<span className="text-emerald-400">Up</span>
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Rent premium sports and outdoor gear instantly from local providers. Save money, travel light, and explore the outdoors.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Categories</h3>
          <ul className="mt-4 space-y-2 text-xs">
            <li><Link href="/#gear-catalog" className="hover:text-emerald-400">Camping & Hiking</Link></li>
            <li><Link href="/#gear-catalog" className="hover:text-emerald-400">Cycling & Bikes</Link></li>
            <li><Link href="/#gear-catalog" className="hover:text-emerald-400">Water Sports</Link></li>
            <li><Link href="/#gear-catalog" className="hover:text-emerald-400">Fitness & Training</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Platform</h3>
          <ul className="mt-4 space-y-2 text-xs">
            <li><Link href="/login" className="hover:text-emerald-400">Customer Login</Link></li>
            <li><Link href="/register?role=PROVIDER" className="hover:text-emerald-400">Become a Provider</Link></li>
            <li><Link href="/#how-it-works" className="hover:text-emerald-400">How It Works</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Support</h3>
          <ul className="mt-4 space-y-2 text-xs text-zinc-400">
            <li>Email: support@gearup-rentals.com</li>
            <li>Hours: Mon - Sat (9 AM - 8 PM)</li>
            <li>Location: Dhaka, Bangladesh</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-zinc-800 py-6 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} GearUp Rentals. All rights reserved.
      </div>
    </footer>
  );
};
