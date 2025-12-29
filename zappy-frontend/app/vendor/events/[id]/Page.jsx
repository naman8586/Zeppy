'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { eventsAPI, otpAPI } from '@/lib/api';
import { EVENT_STATUS_LABELS, API_URL } from '@/lib/constants';
import { 
  Calendar, MapPin, User, Phone, Camera, 
  Image as ImageIcon, CheckCircle, ShieldCheck, Loader2, Info, Key
} from 'lucide-react';
import { cn } from '@/lib/utils';

function EventDetailsPage({ params }) {
  const router = useRouter();
  const eventId = params.id;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingOTP, setGeneratingOTP] = useState(false);
  const [error, setError] = useState('');

  // Fixed: Wrapped in useCallback to satisfy react-hooks/exhaustive-deps
  const loadEventDetails = useCallback(async () => {
    try {
      const response = await eventsAPI.getEventDetails(eventId);
      setData(response.data.data);
    } catch (err) {
      setError('CRITICAL_FAILURE: Unable to synchronize event stream');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadEventDetails();
  }, [loadEventDetails]);

  const handleGenerateOTP = async (otpType) => {
    setGeneratingOTP(true);
    setError('');

    try {
      const response = await otpAPI.generate({ eventId, otpType });
      alert(`ENCRYPTED_KEY_SENT: ${response.data.data.otpCode ? `Manual Override: ${response.data.data.otpCode}` : 'Check customer device'}`);
      await loadEventDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'UPLINK_ERROR: Key generation failed');
    } finally {
      setGeneratingOTP(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin mb-4" />
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500">Decrypting Mission Data</p>
      </div>
    );
  }

  const { event, checkIn, progress } = data;
  const statusLabel = EVENT_STATUS_LABELS[event.status];

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 pt-10">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Live_Signal_Active</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tighter uppercase italic">{event.eventName}</h1>
          </div>
          
          <div className="bg-zinc-900 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status:</span>
            <span className="text-xs font-bold uppercase tracking-tighter text-white">{statusLabel}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            
            <section className="bg-zinc-950 border border-white/5 rounded-3xl p-6 shadow-2xl">
              <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <Info className="w-3.5 h-3.5" /> Mission_Intelligence
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                <DetailItem icon={Calendar} label="Operational Date" value={new Date(event.eventDate).toLocaleDateString()} />
                <DetailItem icon={MapPin} label="Coordinates" value={event.location.address} />
                <DetailItem icon={User} label="Target Contact" value={event.customerId?.profile?.name} />
                <DetailItem icon={Phone} label="Comm-Link" value={event.customerPhone} />
              </div>
            </section>

            {checkIn && (
              <section className="bg-zinc-950 border border-white/5 rounded-3xl p-6">
                <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                  <Camera className="w-3.5 h-3.5" /> Site_Verification
                </h2>
                {/* Fixed: Used next/image and added meaningful alt text */}
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 mb-4">
                  <Image 
                    src={`${API_URL.replace('/api', '')}${checkIn.checkInPhoto}`} 
                    alt={`Check-in verification for ${event.eventName}`}
                    fill
                    className="object-cover grayscale contrast-125" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                    <p className="text-[10px] font-mono text-zinc-400 uppercase">Timestamp: {new Date(checkIn.timestamp).toISOString()}</p>
                  </div>
                </div>
              </section>
            )}

            {progress && progress.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5" /> Operational_Logs
                </h2>
                {progress.map((item, idx) => (
                  <div key={idx} className="bg-zinc-950 border border-white/5 rounded-2xl p-4">
                    <p className="text-[10px] font-bold uppercase text-white mb-3">{item.progressType.replace('_', ' ')}</p>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {item.photos.map((p, pIdx) => (
                        <div key={pIdx} className="relative aspect-square rounded-lg overflow-hidden border border-white/5">
                          <Image 
                            src={`${API_URL.replace('/api', '')}${p.url}`} 
                            alt={`${item.progressType} evidence`}
                            fill
                            className="object-cover grayscale opacity-70 hover:opacity-100 transition-opacity"
                          />
                        </div>
                      ))}
                    </div>
                    {item.notes && (
                      <p className="text-[10px] text-zinc-500 italic font-mono">
                        {/* Fixed: Escaped quotes */}
                        &quot;{item.notes}&quot;
                      </p>
                    )}
                  </div>
                ))}
              </section>
            )}
          </div>

          <aside className="space-y-8">
            <section className="bg-zinc-950 border border-white/5 rounded-3xl p-6">
              <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-6">Execution_Timeline</h2>
              <div className="space-y-6">
                <TimelineStep title="Scheduled" time={event.timeline.scheduledTime} active />
                <TimelineStep title="Site Arrival" time={event.timeline.checkInTime} active={!!event.timeline.checkInTime} />
                <TimelineStep title="Operational Start" time={event.timeline.startTime} active={!!event.timeline.startTime} />
                <TimelineStep title="Mission Success" time={event.timeline.completionTime} active={!!event.timeline.completionTime} />
              </div>
            </section>

            <section className="space-y-4">
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-mono uppercase">
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {event.status === 'pending' && (
                <Link href={`/vendor/check-in/${eventId}`} className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-zinc-200 transition-all">
                  <Camera className="w-4 h-4" /> Initialize_CheckIn
                </Link>
              )}

              {event.status === 'checked_in' && (
                <button onClick={() => handleGenerateOTP('event_start')} disabled={generatingOTP} className="w-full flex items-center justify-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-emerald-500/20 transition-all disabled:opacity-50">
                  {generatingOTP ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                  Generate_Start_Key
                </button>
              )}

              {event.status === 'in_progress' && (
                <>
                  <Link href={`/vendor/progress/${eventId}`} className="w-full flex items-center justify-center gap-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-blue-500/20 transition-all mb-3">
                    <ImageIcon className="w-4 h-4" /> Log_Progress
                  </Link>
                  <button onClick={() => handleGenerateOTP('event_completion')} disabled={generatingOTP} className="w-full flex items-center justify-center gap-3 bg-purple-500 text-white py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-purple-600 transition-all disabled:opacity-50">
                    {generatingOTP ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    Finalize_Mission
                  </button>
                </>
              )}
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-zinc-500">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-xs font-medium text-white pl-5 truncate">{value || 'NOT_FOUND'}</p>
    </div>
  );
}

function TimelineStep({ title, time, active }) {
  return (
    <div className="flex gap-4 group">
      <div className="flex flex-col items-center">
        <div className={cn("w-2 h-2 rounded-full border mb-1", active ? "bg-white border-white" : "border-zinc-700 bg-black")} />
        <div className="w-[1px] h-10 bg-zinc-800 group-last:hidden" />
      </div>
      <div>
        <p className={cn("text-[10px] font-bold uppercase tracking-widest", active ? "text-white" : "text-zinc-700")}>{title}</p>
        <p className="text-[9px] font-mono text-zinc-500 mt-1">
          {time ? new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---:---'}
        </p>
      </div>
    </div>
  );
}

export default function EventDetailsPageWrapper({ params }) {
  return (
    <ProtectedRoute requiredRole="vendor">
      <EventDetailsPage params={params} />
    </ProtectedRoute>
  );
}