'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import EventCard from '@/components/EventCard';
import ProtectedRoute from '@/components/ProtectedRoute';
import { eventsAPI } from '@/lib/api';
import { Filter, RefreshCw, Loader2, CalendarDays } from 'lucide-react'; // Fixed: Removed space
import { cn } from '@/lib/utils';

function CustomerDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await eventsAPI.getVendorEvents(
        filter !== 'all' ? filter : null
      );
      setEvents(response.data.data);
    } catch (err) {
      setError('SIGNAL_LOST: Failed to synchronize event schedule');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const filterOptions = [
    { value: 'all', label: 'All Operations' },
    { value: 'pending', label: 'Pending' },
    { value: 'checked_in', label: 'Awaiting Start' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'History' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Premium Header */}
        <header className="mb-12 border-l-2 border-purple-500 pl-6">
          <h1 className="text-4xl font-bold tracking-tighter uppercase italic">
            Event_Terminal
          </h1>
          <p className="text-zinc-500 text-sm font-mono uppercase tracking-widest mt-2">
            Monitor and verify your active service protocols
          </p>
        </header>

        {/* Tactical Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 bg-zinc-950/50 border border-white/5 p-4 rounded-2xl backdrop-blur-md">
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-zinc-500" />
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                    filter === option.value
                      ? "bg-white text-black"
                      : "bg-zinc-900 text-zinc-500 hover:text-white border border-white/5"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={loadEvents}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
            Sync_Feed
          </button>
        </div>

        {/* Content Area */}
        {loading && events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-20">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Decrypting_Data</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-zinc-950 border border-red-500/10 rounded-3xl">
            <p className="text-red-400 font-mono text-xs uppercase mb-6">{error}</p>
            <button
              onClick={loadEvents}
              className="px-6 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-all"
            >
              Retry_Connection
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-32 bg-zinc-950 border border-white/5 rounded-3xl">
            <CalendarDays className="w-10 h-10 text-zinc-800 mx-auto mb-4" />
            <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">No matching records found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <EventCard key={event._id} event={event} role="customer" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CustomerDashboardPage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <CustomerDashboard />
    </ProtectedRoute>
  );
}