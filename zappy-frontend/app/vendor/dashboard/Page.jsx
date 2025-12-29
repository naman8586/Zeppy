'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import EventCard from '@/components/EventCard';
import ProtectedRoute from '@/components/ProtectedRoute';
import { eventsAPI } from '@/lib/api';
import { Plus, Filter, RefreshCw, layoutGrid, Activity, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

function VendorDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await eventsAPI.getVendorEvents(
        filter !== 'all' ? filter : null
      );
      setEvents(response.data.data);
    } catch (err) {
      setError('UPLINK_FAILURE: Could not retrieve mission data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [filter]);

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'checked_in', label: 'Active' },
    { value: 'completed', label: 'Archive' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-zinc-500">
              <Activity className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">System_Live</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tighter uppercase italic">Operations_Board</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadEvents}
              className="p-3 bg-zinc-900 border border-white/5 rounded-xl hover:bg-zinc-800 transition-colors"
              title="Refresh Uplink"
            >
              <RefreshCw className={cn("w-4 h-4 text-zinc-400", loading && "animate-spin")} />
            </button>
            <Link
              href="/vendor/events/new"
              className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              <Plus className="w-4 h-4" />
              New Deployment
            </Link>
          </div>
        </header>

        {/* Tactical Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-8 bg-zinc-900/40 p-1.5 rounded-2xl border border-white/5 w-fit">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={cn(
                "px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                filter === option.value 
                  ? "bg-white text-black shadow-lg" 
                  : "text-zinc-500 hover:text-white"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="relative min-h-[400px]">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 rounded-3xl bg-zinc-900/50 animate-pulse border border-white/5" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-red-500/20 rounded-3xl bg-red-500/5">
              <AlertTriangle className="w-8 h-8 text-red-500 mb-4" />
              <p className="text-xs font-mono text-red-400 uppercase tracking-widest">{error}</p>
              <button onClick={loadEvents} className="mt-4 text-[10px] font-bold uppercase underline underline-offset-4">Retry_Sync</button>
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-white/10 rounded-3xl">
              <p className="text-zinc-600 font-mono text-xs uppercase tracking-[0.3em]">No active signatures found</p>
            </div>
          ) : (
            <motion.div 
              layout
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {events.map((event) => (
                  <motion.div
                    key={event._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <EventCard event={event} role="vendor" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Decorative Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150" />
    </div>
  );
}

export default function VendorDashboardPage() {
  return (
    <ProtectedRoute requiredRole="vendor">
      <VendorDashboard />
    </ProtectedRoute>
  );
}