'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import {
  Home,
  LayoutDashboard,
  LogOut,
  User,
  Calendar,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/* ---------------------------------
   TUBELIGHT NAV
---------------------------------- */
const LocalNavBar = ({ items, className }) => {
  const pathname = usePathname();

  return (
    <div className={cn(
      'fixed bottom-8 left-1/2 -translate-x-1/2 z-50 sm:top-4 sm:bottom-auto',
      className
    )}>
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-lg p-1 rounded-full shadow-2xl">
        {items.map((item) => {
          const isActive = pathname === item.url;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.url}
              className={cn(
                'relative px-4 py-2 rounded-full transition-colors',
                isActive
                  ? 'text-blue-400'
                  : 'text-zinc-400 hover:text-white'
              )}
            >
              <div className="flex items-center gap-2">
                <Icon size={18} />
                <span className="hidden md:inline text-sm font-medium">
                  {item.name}
                </span>
              </div>

              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 rounded-full bg-blue-400/5 -z-10"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-400 rounded-t-full shadow-[0_-4px_10px_#60a5fa]" />
                </motion.div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

/* ---------------------------------
   MAIN NAVBAR
---------------------------------- */
export default function AppNavbar() {
  const router = useRouter();
  const user = auth.getUser();

  if (!user) return null;

  const handleLogout = () => {
    auth.logout();
    router.push('/login');
  };

  // ✅ ONLY ROUTES THAT ACTUALLY EXIST
  const navItems =
    user.role === 'vendor'
      ? [
          { name: 'Home', url: '/', icon: Home },
          { name: 'Dashboard', url: '/vendor/dashboard', icon: Calendar },
        ]
      : [
          { name: 'Home', url: '/', icon: Home },
          { name: 'My Events', url: '/customer/dashboard', icon: LayoutDashboard },
        ];

  return (
    <>
      <LocalNavBar items={navItems} />

      {/* USER PILL */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-4 px-4 py-2 rounded-full border border-white/10 bg-black/40 backdrop-blur-md">
        <div className="hidden md:block text-right">
          <p className="text-xs font-semibold text-white">
            {user.profile?.name || 'User'}
          </p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
            {user.role}
          </p>
        </div>

        <div className="h-8 w-px bg-white/10 mx-1" />

        <button
          onClick={handleLogout}
          className="p-2 rounded-full hover:bg-red-500/10"
          title="Logout"
        >
          <LogOut className="w-4 h-4 text-zinc-400 hover:text-red-400" />
        </button>
      </div>
    </>
  );
}
