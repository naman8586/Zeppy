'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import CameraCapture from '@/components/CameraCapture';
import { eventsAPI, mediaAPI } from '@/lib/api';
import { Camera, Image as ImageIcon, Upload, X, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

function ProgressUploadPage({ params }) {
  const router = useRouter();
  const eventId = params.id;
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progressType, setProgressType] = useState('pre_setup');
  const [photos, setPhotos] = useState([]);
  const [notes, setNotes] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const loadEvent = useCallback(async () => {
    try {
      const response = await eventsAPI.getEventDetails(eventId);
      setEvent(response.data.data.event);
    } catch (err) {
      setError('UPLINK_FAILURE: Could not retrieve mission details');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  const handlePhotoCapture = (file, preview) => {
    setPhotos(prev => [...prev, { file, preview }]);
    setShowCamera(false);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const newPhotos = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (photos.length === 0) {
      setError('VALIDATION_ERROR: At least one visual record is required');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      photos.forEach(photo => {
        formData.append('photos', photo.file);
      });

      const uploadResponse = await mediaAPI.uploadProgress(formData);
      const photoUrls = uploadResponse.data.data.map(file => file.url);

      await eventsAPI.uploadProgress({
        eventId,
        progressType,
        photoUrls,
        notes,
      });

      router.push(`/vendor/events/${eventId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'SUBMISSION_FAILURE: Upload protocol interrupted');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin mb-4" />
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500">Accessing Mission Log</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Abort_Entry</span>
          </button>
          <h1 className="text-3xl font-bold tracking-tighter uppercase italic">Log_Progress</h1>
          <p className="text-zinc-500 text-xs font-mono uppercase tracking-wider mt-1">{event?.eventName}</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-mono uppercase">
            {error}
          </div>
        )}

        <div className="space-y-8">
          {/* Progress Type Selection */}
          <section className="bg-zinc-950 border border-white/5 rounded-3xl p-6">
            <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-6">Phase_Selector</h2>
            <div className="grid grid-cols-2 gap-4">
              {['pre_setup', 'post_setup'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setProgressType(type)}
                  className={cn(
                    "py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border",
                    progressType === type
                      ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                      : "bg-zinc-900/50 text-zinc-500 border-white/5 hover:border-white/20"
                  )}
                >
                  {type.replace('_', '-')}
                </button>
              ))}
            </div>
          </section>

          {/* Visual Evidence Area */}
          <section className="bg-zinc-950 border border-white/5 rounded-3xl p-6">
            <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-6 flex items-center justify-between">
              Visual_Evidence 
              <span className="text-zinc-700">[{photos.length}/6]</span>
            </h2>

            {/* Tactical Grid */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group">
                    <Image
                      src={photo.preview}
                      alt={`Evidence ${index + 1}`}
                      fill
                      className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 p-1.5 bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity border border-white/10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setShowCamera(true)}
                className="flex-1 py-10 border border-dashed border-white/10 rounded-2xl hover:border-white/30 hover:bg-white/5 transition-all flex flex-col items-center justify-center gap-3 group"
              >
                <div className="p-3 bg-zinc-900 rounded-full group-hover:scale-110 transition-transform">
                  <Camera className="w-5 h-5 text-zinc-400" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Field_Capture</span>
              </button>

              <label className="flex-1 py-10 border border-dashed border-white/10 rounded-2xl hover:border-white/30 hover:bg-white/5 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group">
                <div className="p-3 bg-zinc-900 rounded-full group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5 text-zinc-400" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Import_Log</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          </section>

          {/* Detailed Observations */}
          <section className="bg-zinc-950 border border-white/5 rounded-3xl p-6">
            <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-6">Observations</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="4"
              placeholder="Enter field notes here..."
              className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl px-4 py-4 text-xs font-mono focus:ring-1 focus:ring-white/20 focus:border-white/40 outline-none transition-all resize-none"
            />
          </section>

          {/* Finalize Action */}
          <button
            onClick={handleSubmit}
            disabled={photos.length === 0 || uploading}
            className="w-full py-5 bg-white text-black rounded-2xl font-bold uppercase text-xs tracking-[0.2em] hover:bg-zinc-200 transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(255,255,255,0.05)]"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Commit_To_Uplink
              </>
            )}
          </button>
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handlePhotoCapture}
          onCancel={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}

export default function ProgressUploadPageWrapper({ params }) {
  return (
    <ProtectedRoute requiredRole="vendor">
      <ProgressUploadPage params={params} />
    </ProtectedRoute>
  );
}