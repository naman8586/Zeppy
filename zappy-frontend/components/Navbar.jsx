'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/lib/auth';
import { 
  Home, 
  LayoutDashboard, 
  LogOut, 
  User, 
  Calendar,
  CheckCircle 
} from 'lucide-react';
import { NavBar } from "@/components/ui/tubelight-navbar";

export default function AppNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  
  // ✅ FIX: Initialize state directly from auth to avoid cascading renders
  // This removes the need for useEffect entirely for the initial load
  const [user] = useState(() => auth.getUser());

  const handleLogout = () => {
    auth.logout();
    router.push('/login');
  };

  // If no user is found, don't render the nav (e.g., on login/register pages)
  if (!user) return null;

  const vendorItems = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'Events', url: '/vendor/dashboard', icon: Calendar },
    { name: 'Check-In', url: '/vendor/check-in', icon: CheckCircle },
    { name: 'Profile', url: '/vendor/profile', icon: User },
  ];

  const customerItems = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'My Events', url: '/customer/dashboard', icon: LayoutDashboard },
    { name: 'Verification', url: '/customer/verify', icon: CheckCircle },
    { name: 'Profile', url: '/customer/profile', icon: User },
  ];

  const navItems = user.role === 'vendor' ? vendorItems : customerItems;

  return (
    <>
      {/* The Floating Tubelight Nav */}
      <NavBar items={navItems} className="top-4" />

      {/* ✅ FIX: z-60 (standard) instead of z-[60]
          Top Right User Profile - Glassmorphism style 
      */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-4 px-4 py-2 rounded-full border border-white/10 bg-black/40 backdrop-blur-md">
        <div className="hidden md:block text-right">
          <p className="text-xs font-semibold text-white tracking-tight">
            {user.profile?.name || 'User'}
          </p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
            {user.role}
          </p>
        </div>
        
        {/* ✅ FIX: w-px instead of w-[1px] */}
        <div className="h-8 w-px bg-white/10 mx-1" />

        <button
          onClick={handleLogout}
          className="group flex items-center justify-center p-2 rounded-full hover:bg-red-500/10 transition-colors"
          title="Logout"
        >
          <LogOut className="w-4 h-4 text-zinc-400 group-hover:text-red-400 transition-colors" />
        </button>
      </div>
    </>
  );
}