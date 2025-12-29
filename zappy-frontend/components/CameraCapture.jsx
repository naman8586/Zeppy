'use client';

import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, RotateCw, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CameraCapture({ onCapture, onCancel }) {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [isFlash, setIsFlash] = useState(false);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setIsFlash(true);
      setTimeout(() => setIsFlash(false), 150);
      setImage(imageSrc);
    }
  }, []);

  const confirm = async () => {
    const res = await fetch(image);
    const blob = await res.blob();
    const file = new File([blob], `check-in-${Date.now()}.jpg`, {
      type: 'image/jpeg',
    });
    onCapture(file, image);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* Flash Effect */}
      <AnimatePresence>
        {isFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-60 bg-white"
          />
        )}
      </AnimatePresence>

      <div className="relative h-full w-full max-w-4xl overflow-hidden border border-white/10 md:h-[80vh] md:rounded-3xl">
        {/* HUD */}
        <div className="pointer-events-none absolute inset-0 z-20">
          <div className="absolute left-10 top-10 h-10 w-10 border-l-2 border-t-2 border-white/30" />
          <div className="absolute right-10 top-10 h-10 w-10 border-r-2 border-t-2 border-white/30" />
          <div className="absolute bottom-10 left-10 h-10 w-10 border-b-2 border-l-2 border-white/30" />
          <div className="absolute bottom-10 right-10 h-10 w-10 border-b-2 border-r-2 border-white/30" />

          {!image && (
            <motion.div
              animate={{ top: ['10%', '90%', '10%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              className="absolute left-10 right-10 h-px bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.5)]"
            />
          )}
        </div>

        {!image ? (
          <div className="relative flex h-full items-center justify-center bg-zinc-950">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode, width: 1280, height: 720 }}
              className="h-full w-full object-cover"
            />

            <div className="absolute top-12 left-1/2 -translate-x-1/2 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
                LENS_SYSTEM_V.2 //{' '}
                {facingMode === 'user' ? 'FRONT_FACING' : 'REAR_SENSOR'}
              </p>
            </div>

            <div className="absolute bottom-12 left-0 right-0 flex items-center justify-center gap-8 px-6">
              <NavButton onClick={onCancel} icon={X} label="Abort" danger />

              <button
                onClick={capture}
                className="group relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/20 p-1 transition-all active:scale-90"
              >
                <div className="h-full w-full rounded-full bg-white group-hover:scale-95 transition-all" />
                <Camera className="absolute h-6 w-6 text-black" />
              </button>

              <NavButton
                onClick={() =>
                  setFacingMode((f) =>
                    f === 'user' ? 'environment' : 'user'
                  )
                }
                icon={RotateCw}
                label="Rotate"
              />
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative h-full w-full bg-zinc-900"
          >
            {/* ✅ FIXED: next/image */}
            <Image
              src={image}
              alt="Captured photo"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 80vw"
              className="object-cover grayscale-[0.2]"
            />

            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-8">
              <div className="text-center">
                <Check className="mx-auto mb-2 h-16 w-16 text-white" />
                <h3 className="text-xl font-bold uppercase tracking-widest text-white">
                  Capture Verified
                </h3>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setImage(null)}
                  className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-3 text-sm font-bold uppercase tracking-tighter text-white transition-all hover:bg-white/10"
                >
                  <RotateCw className="h-4 w-4" /> Retake
                </button>

                <button
                  onClick={confirm}
                  className="flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-bold uppercase tracking-tighter text-black transition-all hover:bg-zinc-200"
                >
                  Confirm Upload <Check className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function NavButton({ onClick, icon: Icon, label, danger = false }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={onClick}
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-full border border-white/10 backdrop-blur-md transition-all active:scale-95',
          danger
            ? 'bg-red-500/10 hover:bg-red-500/20'
            : 'bg-white/5 hover:bg-white/10'
        )}
      >
        <Icon
          className={cn(
            'h-5 w-5',
            danger ? 'text-red-400' : 'text-white'
          )}
        />
      </button>
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
        {label}
      </span>
    </div>
  );
}
