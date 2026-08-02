import React from "react";
import Link from "next/link";
import { Dumbbell, ShieldCheck, Truck, Clock, HeartHandshake, Mail, Phone, MapPin } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-950 text-zinc-300 border-t border-zinc-800/80">
      {/* Feature Badges Grid */}
      <div className="border-b border-zinc-800/80 bg-zinc-900/40 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Insured Gear</h4>
              <p className="text-[11px] text-zinc-400">All equipment quality checked</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Flexible Handoff</h4>
              <p className="text-[11px] text-zinc-400">Convenient pickup centers</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Daily & Weekly</h4>
              <p className="text-[11px] text-zinc-400">Rent as long as needed</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Verified Shops</h4>
              <p className="text-[11px] text-zinc-400">Top-rated equipment vendors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold shadow-md shadow-emerald-500/20">
              <Dumbbell className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">
              Gear<span className="text-emerald-400">Up</span>
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Rent premium sports and outdoor gear instantly from local providers. Save money, travel light, and explore your next adventure.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">Categories</h3>
          <ul className="mt-4 space-y-2.5 text-xs text-zinc-400">
            <li><Link href="/#gear-catalog" className="hover:text-emerald-400 transition-colors">Camping & Hiking</Link></li>
            <li><Link href="/#gear-catalog" className="hover:text-emerald-400 transition-colors">Cycling & Bikes</Link></li>
            <li><Link href="/#gear-catalog" className="hover:text-emerald-400 transition-colors">Water Sports</Link></li>
            <li><Link href="/#gear-catalog" className="hover:text-emerald-400 transition-colors">Fitness & Gym Equipment</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">Platform</h3>
          <ul className="mt-4 space-y-2.5 text-xs text-zinc-400">
            <li><Link href="/login" className="hover:text-emerald-400 transition-colors">Customer Login</Link></li>
            <li><Link href="/register?role=PROVIDER" className="hover:text-emerald-400 transition-colors">Become a Provider</Link></li>
            <li><Link href="/#how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">Support & Contact</h3>
          <ul className="mt-4 space-y-2.5 text-xs text-zinc-400">
            <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-emerald-400" /> support@gearup-rentals.com</li>
            <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-emerald-400" /> +880 1762-518411</li>
            <li className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-emerald-400" /> Mirapara, Sylhet, Bangladesh</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-zinc-800/80 py-6 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} GearUp Rentals. All rights reserved.
      </div>
    </footer>
  );
};
