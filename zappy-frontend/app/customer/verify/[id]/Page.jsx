'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // Next.js Optimization
import Navbar from '@/components/Navbar';
import OTPInput from '@/components/OTPInput';
import ProtectedRoute from '@/components/ProtectedRoute';
import { eventsAPI, otpAPI } from '@/lib/api';
import { EVENT_STATUS_COLORS, EVENT_STATUS_LABELS, API_URL } from '@/lib/constants';
import { 
  Calendar, MapPin, User, Key, CheckCircle, 
  Clock, AlertCircle, Image as ImageIcon, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

function VerifyOTPPage({ params }) {
  const router = useRouter();
  const eventId = params.id;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fix 1: Wrap in useCallback to satisfy exhaustive-deps
  const loadEventDetails = useCallback(async () => {
    try {
      const response = await eventsAPI.getEventDetails(eventId);
      setData(response.data.data);
    } catch (err) {
      setError('UPLINK_ERROR: Failed to load mission parameters');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadEventDetails();
  }, [loadEventDetails]);

  const handleVerifyOTP = async (otpCode, otpType) => {
    setVerifying(true);
    setError('');
    setSuccess('');

    try {
      await otpAPI.verify({
        eventId,
        otpCode,
        otpType,
      });

      setSuccess(`PROTOCOL_CONFIRMED: Event ${otpType === 'event_start' ? 'started' : 'completed'} successfully.`);
      
      // Refresh mission status
      setTimeout(() => {
        loadEventDetails();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'ENCRYPTION_MISMATCH: Invalid Security Key');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin mb-4" />
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500">Scanning Bio-Metrics</p>
      </div>
    );
  }

  const { event, checkIn, progress } = data;
  const statusColor = EVENT_STATUS_COLORS[event.status];
  const statusLabel = EVENT_STATUS_LABELS[event.status];

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header Section */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter uppercase italic">{event.eventName}</h1>
            <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.3em]">Operational_Clearance_Required</p>
          </div>
          <span className={cn("px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border", statusColor)}>
            {statusLabel}
          </span>
        </header>

        {/* Status Alerts */}
        {success && (
          <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center text-emerald-400 font-mono text-[10px] uppercase">
            <CheckCircle className="w-4 h-4 mr-3 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center text-red-400 font-mono text-[10px] uppercase">
            <AlertCircle className="w-4 h-4 mr-3 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Mission Dossier */}
        <section className="bg-zinc-950 border border-white/5 rounded-3xl p-8 mb-8">
          <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> Dossier_Briefing
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <DossierItem icon={Calendar} label="Scheduled Window" value={formatDate(event.eventDate)} />
            <DossierItem icon={MapPin} label="Coordinates" value={event.location.address} />
            <DossierItem icon={User} label="Assigned Operative" value={event.vendorId?.profile?.name} />
          </div>
        </section>

        {/* Interactive Verification Terminals */}
        {(event.status === 'checked_in' || event.status === 'in_progress') && (
          <section className="bg-zinc-950 border border-white/5 rounded-3xl p-8 mb-8 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-white/5 rounded-full mb-6">
                {event.status === 'checked_in' ? (
                  <Key className="w-8 h-8 text-purple-500" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                )}
              </div>
              <h2 className="text-xl font-bold uppercase tracking-tight mb-2">
                {event.status === 'checked_in' ? 'Initialize Mission' : 'Finalize Mission'}
              </h2>
              <p className="text-zinc-500 text-xs font-mono mb-8 max-w-sm">
                Enter the 6-digit synchronization key provided by the operative to verify this phase.
              </p>

              <OTPInput
                length={6}
                onComplete={(code) => handleVerifyOTP(code, event.status === 'checked_in' ? 'event_start' : 'event_completion')}
              />

              {verifying && <Loader2 className="w-6 h-6 animate-spin mt-8 text-white" />}
            </div>
          </section>
        )}

        {/* Intelligence Evidence (Check-In) */}
        {checkIn && (
          <section className="bg-zinc-950 border border-white/5 rounded-3xl p-8 mb-8">
            <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-8">Site_Verification_Capture</h2>
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 group">
              <Image 
                src={`${API_URL.replace('/api', '')}${checkIn.checkInPhoto}`}
                alt="On-site verification evidence"
                fill
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                <span className="text-[10px] font-mono text-zinc-400">Captured: {formatDate(checkIn.timestamp)}</span>
              </div>
            </div>
          </section>
        )}

        {/* Tactical Feed (Progress) */}
        {progress && progress.length > 0 && (
          <section className="bg-zinc-950 border border-white/5 rounded-3xl p-8 mb-8">
            <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Operational_Logs
            </h2>
            
            <div className="space-y-10">
              {progress.map((item, idx) => (
                <div key={idx} className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-white border-b border-white/5 pb-2">
                    Phase: {item.progressType.replace('_', ' ')}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {item.photos.map((photo, pIdx) => (
                      <div key={pIdx} className="relative aspect-square rounded-xl overflow-hidden border border-white/5 grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all">
                        <Image 
                          src={`${API_URL.replace('/api', '')}${photo.url}`}
                          alt="Progress evidence"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  {item.notes && (
                    <p className="text-xs text-zinc-500 italic font-mono bg-white/5 p-4 rounded-xl border-l border-white/20">
                      {/* Fix 2: Escaped quotes */}
                      &quot;{item.notes}&quot;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Success Terminal */}
        {event.status === 'completed' && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-12 text-center shadow-[0_0_50px_rgba(16,185,129,0.05)]">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold tracking-tighter uppercase italic mb-4 text-white">Mission_Success</h2>
            <p className="text-zinc-500 text-sm font-mono max-w-sm mx-auto">
              Operation concluded and verified. Digital record archived at {event.timeline.completionTime ? formatDate(event.timeline.completionTime) : 'Finalization_Time_Error'}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function DossierItem({ icon: Icon, label, value }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-zinc-500">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-sm font-medium text-white truncate">{value || 'NOT_FOUND'}</p>
    </div>
  );
}

export default function VerifyOTPPageWrapper({ params }) {
  return (
    <ProtectedRoute requiredRole="customer">
      <VerifyOTPPage params={params} />
    </ProtectedRoute>
  );
}