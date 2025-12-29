'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Calendar, Shield, Camera, Zap, ChevronRight, Binary } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect logic for authenticated users
    if (auth.isAuthenticated()) {
      const user = auth.getUser();
      if (user?.role === 'vendor') {
        router.push('/vendor/dashboard');
      } else if (user?.role === 'customer') {
        router.push('/customer/dashboard');
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30 overflow-x-hidden font-sans">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      <main className="relative max-w-7xl mx-auto px-6 pt-32 pb-32">
        <div className="text-center space-y-10">
          
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/10 bg-zinc-900/50 backdrop-blur-md mb-4 group cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-zinc-400 group-hover:text-purple-400 transition-colors">
              System_Online
            </span>
          </div>

          {/* MAIN TITLING */}
          <div className="space-y-4">
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.8]">
              ZAPPY<span className="text-purple-500 not-italic">.</span>
            </h1>
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.5em] ml-2">
              Event_Execution_Protocol_v2.0
            </p>
          </div>
          
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-light tracking-wide leading-relaxed">
            The high-fidelity tracking system for modern vendors. 
            <span className="block text-zinc-600 italic font-medium mt-1">Zero-Trust Verification. Ironclad Forensics.</span>
          </p>

          {/* CALL TO ACTION */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-12">
            <Link
              href="/login"
              className="group relative px-12 py-5 bg-white text-black rounded-full font-black uppercase text-[11px] tracking-[0.2em] hover:bg-zinc-200 transition-all flex items-center gap-3 overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              Initialize_Entry
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              href="/register"
              className="px-12 py-5 bg-transparent border border-white/10 text-white rounded-full font-black uppercase text-[11px] tracking-[0.2em] hover:bg-white/5 hover:border-white/20 transition-all"
            >
              Request_Clearance
            </Link>
          </div>
        </div>

        {/* TACTICAL GRID FEATURES */}
        <div className="mt-48 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
          <FeatureCard 
            icon={Camera} 
            title="Visual Auth" 
            desc="Geotagged photo check-ins with real-time metadata validation."
          />
          <FeatureCard 
            icon={Shield} 
            title="OTP Shield" 
            desc="Multi-factor handshake protocols for mission critical starts."
          />
          <FeatureCard 
            icon={Binary} 
            title="Forensics" 
            desc="Immutable event logs documenting every stage of execution."
          />
          <FeatureCard 
            icon={Zap} 
            title="Live Uplink" 
            desc="Instant status broadcasts to client dashboards via secure channel."
          />
        </div>
      </main>

      {/* FOOTER DECOR */}
      <footer className="py-12 border-t border-white/5 bg-zinc-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-mono tracking-[0.4em] uppercase text-zinc-600">
            © 2025 ZAPPY_CORP // All_Rights_Reserved
          </p>
          <div className="flex gap-8 text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-500">
            <span className="hover:text-white cursor-pointer transition-colors">Terminals</span>
            <span className="hover:text-white cursor-pointer transition-colors">Privacy_Layer</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="bg-black p-12 hover:bg-zinc-900/50 transition-all group relative overflow-hidden">
      {/* Subtle hover glow for the card */}
      <div className="absolute -inset-px bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
        <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center mb-8 border border-white/5 group-hover:border-purple-500/50 group-hover:bg-purple-500/10 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all duration-500">
          <Icon className="w-6 h-6 text-zinc-500 group-hover:text-purple-400 transition-colors" />
        </div>
        <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-4 text-white group-hover:translate-x-1 transition-transform">
          {title}
        </h3>
        <p className="text-xs text-zinc-500 leading-relaxed font-medium uppercase tracking-wider opacity-80 group-hover:opacity-100">
          {desc}
        </p>
      </div>
    </div>
  );
}