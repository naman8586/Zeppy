'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { authAPI } from '@/lib/api';
import { UserPlus, Mail, Lock, User, Briefcase, Zap, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState('vendor'); 
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'vendor'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      
      const submissionData = { ...formData, role };
      await authAPI.register(submissionData);
      
      
      router.push('/login?registered=true');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration sequence aborted.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-zinc-900/30 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full z-10"
      >
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          
          <div className="flex flex-col items-center mb-8">
            <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              <UserPlus className="text-black w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-[0.2em] uppercase text-white">Login</h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mt-2 text-center">
              Deploy your Account
            </p>
          </div>

          <div className="flex bg-black/60 p-1 rounded-2xl border border-white/5 mb-8">
            <button
              onClick={() => setRole('vendor')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                role === 'vendor' ? "bg-white text-black" : "text-zinc-500 hover:text-white"
              )}
            >
              <Briefcase className="w-3.5 h-3.5" /> Vendor
            </button>
            <button
              onClick={() => setRole('customer')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                role === 'customer' ? "bg-white text-black" : "text-zinc-500 hover:text-white"
              )}
            >
              <User className="w-3.5 h-3.5" /> Customer
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] ml-1">Entity Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-white" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-white/20 transition-all"
                  placeholder="John Doe / Company"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] ml-1">Comm Link (Email)</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-white" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-white/20 transition-all"
                  placeholder="operator@zappy.net"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] ml-1">Security Cipher</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-white" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-white/20 transition-all"
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
              className="w-full bg-white text-black py-4 rounded-2xl font-bold uppercase text-[10px] tracking-[0.3em] hover:bg-zinc-200 transition-all disabled:opacity-50 mt-6 shadow-[0_10px_20px_rgba(255,255,255,0.05)]"
            >
              {loading ? "Establishing Account..." : "Confirm Deployment"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/register" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
              New User? <span className="underline underline-offset-4 decoration-zinc-700">Initialize Sign In</span>
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