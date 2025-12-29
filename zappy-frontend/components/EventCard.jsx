'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, MapPin, User, Clock, ArrowRight } from 'lucide-react';
import { EVENT_STATUS_STYLES, EVENT_STATUS_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function EventCard({ event, role = 'vendor' }) {
  // Use our new Noir-optimized styles
  const statusStyles = EVENT_STATUS_STYLES[event.status] || 'border-zinc-800 bg-zinc-900/50 text-zinc-400';
  const statusLabel = EVENT_STATUS_LABELS[event.status] || event.status;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const detailsLink = role === 'vendor' 
    ? `/vendor/events/${event._id}`
    : `/customer/verify/${event._id}`;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={detailsLink} className="group block">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40 p-6 backdrop-blur-md transition-all hover:border-white/20 hover:bg-zinc-900/60">
          
          {/* Subtle Background Glow based on status */}
          <div className={cn(
            "absolute -right-8 -top-8 h-24 w-24 blur-[60px] transition-opacity opacity-20 group-hover:opacity-40",
            statusStyles.split(' ')[1] // Extracting the bg- color for the glow
          )} />

          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold tracking-tight text-white group-hover:text-purple-400 transition-colors">
                {event.eventName}
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mt-1">
                ID: {event._id.slice(-6)}
              </p>
            </div>
            <span className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
              statusStyles
            )}>
              <span className="mr-1.5 h-1 w-1 rounded-full bg-current animate-pulse" />
              {statusLabel}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center text-zinc-400">
              <Calendar className="w-3.5 h-3.5 mr-2 text-zinc-600" />
              <span className="text-xs font-medium">{formatDate(event.eventDate)}</span>
            </div>
            <div className="flex items-center text-zinc-400">
              <User className="w-3.5 h-3.5 mr-2 text-zinc-600" />
              <span className="text-xs font-medium truncate">
                {role === 'vendor' 
                  ? (event.customerId?.profile?.name || 'Customer') 
                  : (event.vendorId?.profile?.name || 'Vendor')}
              </span>
            </div>
          </div>

          <div className="flex items-center text-zinc-400 mb-6">
            <MapPin className="w-3.5 h-3.5 mr-2 text-zinc-600" />
            <span className="text-xs font-medium truncate">{event.location?.address}</span>
          </div>

          {/* Progress Indicator */}
          <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TimelineDot active={!!event.timeline?.checkInTime} label="In" />
              <TimelineDot active={!!event.timeline?.startTime} label="Start" />
              <TimelineDot active={!!event.timeline?.completionTime} label="Done" />
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function TimelineDot({ active, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn(
        "h-1.5 w-1.5 rounded-full transition-all",
        active ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "bg-zinc-800"
      )} />
      <span className={cn(
        "text-[9px] font-bold uppercase tracking-tighter",
        active ? "text-zinc-200" : "text-zinc-600"
      )}>{label}</span>
    </div>
  );
}