'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import CameraCapture from '@/components/CameraCapture';
import LocationPicker from '@/components/LocationPicker';
import ProtectedRoute from '@/components/ProtectedRoute';
import { eventsAPI, mediaAPI } from '@/lib/api';
import { Camera, MapPin, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

function CheckInPage({ params }) {
  const router = useRouter();
  const eventId = params.id;
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const response = await eventsAPI.getEventDetails(eventId);
      setEvent(response.data.data.event);
      
      if (response.data.data.checkIn) {
        setError('PROTOCOL_ERROR: Already checked in to this deployment');
      }
    } catch (err) {
      setError('SYSTEM_FAILURE: Failed to load event parameters');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoCapture = (file, preview) => {
    setCapturedPhoto(file);
    setPhotoPreview(preview);
    setShowCamera(false);
  };

  const handleSubmit = async () => {
    if (!capturedPhoto || !location) return;

    setSubmitting(true);
    setError('');

    try {
      // 1. Upload visual evidence (Binary Data)
      const formData = new FormData();
      formData.append('photo', capturedPhoto);
      const uploadResponse = await mediaAPI.uploadCheckIn(formData);
      const photoUrl = uploadResponse.data.data.url;

      // 2. Finalize telemetry check-in (JSON Data)
      await eventsAPI.checkIn({
        eventId,
        latitude: location.latitude,
        longitude: location.longitude,
        photoUrl,
      });

      router.push(`/vendor/events/${eventId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'UPLINK_ERROR: Check-in sequence failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading Viewport
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500">Syncing Parameters</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <Navbar />

      <main className="max-w-xl mx-auto px-6 pt-10">
        {/* Header Unit */}
        <div className="mb-10 border-l-2 border-white pl-4">
          <h1 className="text-2xl font-bold tracking-tighter uppercase italic">Mission_CheckIn</h1>
          <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest mt-1">
            TARGET: {event?.eventName || 'UNKNOWN_ID'}
          </p>
        </div>

        {/* System Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start text-red-400"
            >
              <AlertCircle className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-xs font-mono uppercase leading-tight">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-8">
          {/* Visual Evidence Module */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center">
                <Camera className="w-3.5 h-3.5 mr-2" /> Visual_Verification
              </h2>
              {photoPreview && (
                <button 
                  onClick={() => { setCapturedPhoto(null); setPhotoPreview(null); }}
                  className="text-[9px] font-bold text-red-500 uppercase tracking-widest hover:text-red-400"
                >
                  Reset_Lens
                </button>
              )}
            </div>

            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-zinc-950 shadow-2xl">
              {!photoPreview ? (
                <button
                  onClick={() => setShowCamera(true)}
                  className="w-full h-full flex flex-col items-center justify-center group hover:bg-white/[0.02] transition-colors"
                >
                  <div className="h-14 w-14 rounded-full border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6 text-zinc-600 group-hover:text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] group-hover:text-zinc-400">
                    Open Viewport
                  </span>
                </button>
              ) : (
                <motion.img
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  src={photoPreview}
                  className="w-full h-full object-cover grayscale contrast-125"
                />
              )}
            </div>
          </section>

          {/* Telemetry Module */}
          <section className="space-y-4">
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-2" /> GPS_Telemetry
            </h2>
            <LocationPicker 
              onLocationPicked={handleLocationPicked} 
              className="bg-zinc-950 border-white/5" 
            />
          </section>

          {/* Execution Button */}
          <button
            onClick={handleSubmit}
            disabled={!capturedPhoto || !location || submitting}
            className={cn(
              "w-full py-5 rounded-2xl font-bold uppercase text-[11px] tracking-[0.3em] transition-all",
              "flex items-center justify-center gap-3 relative overflow-hidden",
              capturedPhoto && location 
                ? "bg-white text-black hover:bg-zinc-200" 
                : "bg-zinc-900 text-zinc-600 cursor-not-allowed"
            )}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uplinking Data...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Finalize_Deployment
              </>
            )}
          </button>
        </div>
      </main>

      {/* Overlay Camera Container */}
      <AnimatePresence>
        {showCamera && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black"
          >
            <CameraCapture
              onCapture={handlePhotoCapture}
              onCancel={() => setShowCamera(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CheckInPageWrapper({ params }) {
  return (
    <ProtectedRoute requiredRole="vendor">
      <CheckInPage params={params} />
    </ProtectedRoute>
  );
}