'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { auth } from '@/lib/auth';
import { motion } from 'framer-motion';

export default function ProtectedRoute({ children, requiredRole }) {
  const router = useRouter();
  const redirected = useRef(false);

  // 🔐 Derive auth synchronously (pure)
  const authenticated = auth.isAuthenticated();
  const user = auth.getUser();

  useEffect(() => {
    // Prevent double redirects (StrictMode safe)
    if (redirected.current) return;

    // ⛔ Not logged in
    if (!authenticated) {
      redirected.current = true;
      router.replace('/login');
      return;
    }

    // ⛔ Wrong role
    if (requiredRole && user?.role !== requiredRole) {
      redirected.current = true;
      const fallback =
        user?.role === 'vendor'
          ? '/vendor/dashboard'
          : '/customer/dashboard';

      router.replace(fallback);
    }
  }, [authenticated, requiredRole, user?.role, router]);

  // ⏳ While redirecting or unauthorized, show loader
  if (!authenticated || (requiredRole && user?.role !== requiredRole)) {
    return <LoadingScreen />;
  }

  // ✅ Authorized
  return <>{children}</>;
}

/* --------------------------------------------
   Loading UI (pure, no side effects)
--------------------------------------------- */
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
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
