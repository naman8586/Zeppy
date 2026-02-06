'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { eventsAPI, otpAPI } from '@/lib/api';
import { auth } from '@/lib/auth';
import { EVENT_STATUS_LABELS } from '@/lib/constants';

import {
  Calendar,
  MapPin,
  User,
  Phone,
  Camera,
  Image as ImageIcon,
  ShieldCheck,
  Loader2,
  Key,
} from 'lucide-react';

/* ======================================================
   EVENT DETAILS PAGE
====================================================== */
function EventDetailsPage() {
  const router = useRouter();
  const { id: eventId } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingOTP, setGeneratingOTP] = useState(false);
  const [error, setError] = useState('');

  const loadEventDetails = useCallback(async () => {
    try {
      const response = await eventsAPI.getEventDetails(eventId);
      setData(response.data.data);
    } catch {
      setError('CRITICAL_FAILURE: Unable to synchronize event stream');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  /* --------------------------------------------------
     🔐 CRITICAL FIX
     Gate protected API behind auth readiness
  -------------------------------------------------- */
  useEffect(() => {
    if (!eventId) return;
    if (!auth.isAuthenticated()) return;

    loadEventDetails();
  }, [eventId, loadEventDetails]);

  const handleGenerateOTP = async (otpType) => {
    setGeneratingOTP(true);
    setError('');

    try {
      const response = await otpAPI.generate({ eventId, otpType });

      alert(
        response.data.data?.otpCode
          ? `Manual Override Code: ${response.data.data.otpCode}`
          : 'OTP sent to customer device'
      );

      await loadEventDetails();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'UPLINK_ERROR: Key generation failed'
      );
    } finally {
      setGeneratingOTP(false);
    }
  };

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin mb-4" />
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500">
          Decrypting Mission Data
        </p>
      </div>
    );
  }

  if (!data) return null;

  const { event } = data;
  const statusLabel = EVENT_STATUS_LABELS[event.status];

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 pt-10">
        {/* HEADER */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Live_Signal_Active
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tighter uppercase italic">
              {event.eventName}
            </h1>
          </div>

          <div className="bg-zinc-900 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Status:
            </span>
            <span className="text-xs font-bold uppercase">
              {statusLabel}
            </span>
          </div>
        </header>

        {/* ACTIONS */}
        <section className="space-y-4">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-mono uppercase"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {event.status === 'pending' && (
            <Link
              href={`/vendor/check-in/${eventId}`}
              className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-2xl font-bold uppercase text-[10px]"
            >
              <Camera className="w-4 h-4" />
              Initialize_CheckIn
            </Link>
          )}

          {event.status === 'checked_in' && (
            <button
              onClick={() => handleGenerateOTP('event_start')}
              disabled={generatingOTP}
              className="w-full flex items-center justify-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 py-4 rounded-2xl font-bold uppercase text-[10px]"
            >
              {generatingOTP ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Key className="w-4 h-4" />
              )}
              Generate_Start_Key
            </button>
          )}

          {event.status === 'in_progress' && (
            <>
              <Link
                href={`/vendor/progress/${eventId}`}
                className="w-full flex items-center justify-center gap-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 py-4 rounded-2xl font-bold uppercase text-[10px]"
              >
                <ImageIcon className="w-4 h-4" />
                Log_Progress
              </Link>

              <button
                onClick={() => handleGenerateOTP('event_completion')}
                disabled={generatingOTP}
                className="w-full flex items-center justify-center gap-3 bg-purple-500 text-white py-4 rounded-2xl font-bold uppercase text-[10px]"
              >
                {generatingOTP ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                Finalize_Mission
              </button>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

/* ======================================================
   WRAPPER (PROTECTED)
====================================================== */
export default function EventDetailsPageWrapper() {
  return (
    <ProtectedRoute requiredRole="vendor">
      <EventDetailsPage />
    </ProtectedRoute>
  );
}
