'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { motion } from 'framer-motion';

export default function ProtectedRoute({ children, requiredRole }) {
  const router = useRouter();
  const [status, setStatus] = useState(() => {
    const user = auth.getUser();
    const authenticated = auth.isAuthenticated();

    if (!authenticated) return 'unauthorized';
    if (requiredRole && user?.role !== requiredRole) return 'forbidden';
    return 'authorized';
  });

  useEffect(() => {
    // Handle the actual redirection in the effect
    if (status === 'unauthorized') {
      router.replace('/login');
    } else if (status === 'forbidden') {
      const user = auth.getUser();
      const fallback = user?.role === 'vendor' ? '/vendor/dashboard' : '/customer/dashboard';
      router.replace(fallback);
    }
  }, [status, router]);

  // Noir-themed Loading State
  // We show this while 'unauthorized' or 'forbidden' is being handled by the router
  if (status !== 'authorized') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
        <div className="relative flex items-center justify-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-12 w-12 rounded-full border-2 border-zinc-800 border-t-white"
          />
          <div className="absolute h-12 w-12 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.15)]" />
        </div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500"
        >
          Securing Session
        </motion.p>
      </div>
    );
  }

  return <>{children}</>;
}