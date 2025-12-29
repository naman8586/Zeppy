'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function LocationPicker({ onLocationPicked, className }) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Tracks if auto-fetch already happened
  const hasAttemptedFetch = useRef(false);

  const getLocation = useCallback(
    (isAuto = false) => {
      if (isAuto && hasAttemptedFetch.current) return;

      hasAttemptedFetch.current = true;
      setLoading(true);
      setError('');

      if (!navigator.geolocation) {
        setError('SATELLITE_ERROR: Geolocation unsupported');
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };

          setLocation(loc);
          onLocationPicked(loc);
          setLoading(false);
        },
        () => {
          setError('SIGNAL_LOST: Enable location services');
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    },
    [onLocationPicked]
  );

  // ✅ FIX: defer state updates outside the effect execution
  useEffect(() => {
    if (!hasAttemptedFetch.current) {
      requestAnimationFrame(() => {
        getLocation(true);
      });
    }
  }, [getLocation]);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-white/10 bg-zinc-950 p-5 shadow-2xl',
        className
      )}
    >
      {/* Background Radar Animation */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none"
          >
            <div className="absolute h-32 w-32 animate-ping rounded-full border border-white/40" />
            <div className="absolute h-16 w-16 animate-ping rounded-full border border-white/60 [animation-delay:0.5s]" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'rounded-md p-1.5 transition-colors',
                location
                  ? 'bg-white/10 text-white'
                  : 'bg-zinc-900 text-zinc-500'
              )}
            >
              <Navigation
                className={cn('h-4 w-4', loading && 'animate-pulse')}
              />
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                Positioning System
              </h4>
              <p className="font-mono text-xs font-semibold uppercase tracking-tighter text-white">
                GPS_UPLINK_v1.4
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              hasAttemptedFetch.current = false;
              getLocation(false);
            }}
            disabled={loading}
            className="group rounded-full p-2 transition-colors hover:bg-white/5 disabled:opacity-30"
          >
            <RefreshCw
              className={cn(
                'h-3.5 w-3.5 text-zinc-400 group-hover:text-white',
                loading && 'animate-spin'
              )}
            />
          </button>
        </div>

        <div className="min-h-15 flex flex-col justify-center">
          {loading ? (
            <div className="space-y-2">
              <div className="h-2 w-3/4 animate-pulse rounded bg-zinc-800" />
              <div className="h-2 w-1/2 animate-pulse rounded bg-zinc-800" />
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-red-400">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-tighter">
                {error}
              </span>
            </div>
          ) : location ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="border-l border-white/10 pl-3">
                <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-widest text-zinc-600">
                  Lat
                </span>
                <span className="font-mono text-sm font-medium italic tracking-tight text-white">
                  {location.latitude.toFixed(6)}
                </span>
              </div>

              <div className="border-l border-white/10 pl-3">
                <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-widest text-zinc-600">
                  Long
                </span>
                <span className="font-mono text-sm font-medium italic tracking-tight text-white">
                  {location.longitude.toFixed(6)}
                </span>
              </div>

              <div className="col-span-2 mt-2 flex items-center justify-between border-t border-white/5 pt-3">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      location.accuracy < 50
                        ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                        : 'bg-yellow-500'
                    )}
                  />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                    Signal: ±{Math.round(location.accuracy)}m
                  </span>
                </div>
                <span className="font-mono text-[9px] text-zinc-600">
                  VERIFIED
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
