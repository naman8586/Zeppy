"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { authAPI } from "@/lib/api";
import { auth } from "@/lib/auth";
import { Mail, Lock, LogIn, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
      });

      const { user, token } = response.data.data;

      // ✅ SINGLE source of truth
      auth.login(user, token);

      // ✅ Role-based redirect
      router.push(
        user.role === "vendor" ? "/vendor/dashboard" : "/customer/dashboard",
      );
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <motion.div
        suppressHydrationWarning
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full z-10"
      >
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center mb-4">
              <LogIn className="text-black w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-[0.2em] uppercase text-white">
              Login
            </h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mt-2 text-center">
              Authenticate Session
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] ml-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-white/20"
                  placeholder="operator@zappy.net"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-white/20"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <p className="text-[10px] text-red-400 font-bold uppercase tracking-tight py-2 italic">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-4 rounded-2xl font-bold uppercase text-[10px] tracking-[0.3em] hover:bg-zinc-200 transition-all disabled:opacity-50 mt-6"
            >
              {loading ? "Authenticating…" : "Enter System"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link
              href="/register"
              className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
            >
              New here?{" "}
              <span className="underline underline-offset-4">
                Create Account
              </span>
            </Link>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4 opacity-20 grayscale">
          <div className="h-px w-12 bg-white" />
          <ShieldCheck className="w-4 h-4 text-white" />
          <div className="h-px w-12 bg-white" />
        </div>
      </motion.div>
    </div>
  );
}
