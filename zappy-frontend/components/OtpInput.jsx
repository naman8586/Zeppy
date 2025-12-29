'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function OTPInput({ length = 6, onComplete, disabled = false }) {
  const [otp, setOtp] = useState(new Array(length).fill(''));
  const [activeSlot, setActiveSlot] = useState(0);
  const inputRefs = useRef([]);

  // Focus the first empty slot on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (val, index) => {
    if (isNaN(val)) return;

    const newOtp = [...otp];
    // Only take the last character (handles mobile keyboard edge cases)
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);

    // Move focus forward
    if (val && index < length - 1) {
      inputRefs.current[index + 1].focus();
      setActiveSlot(index + 1);
    }

    // Trigger completion logic
    if (newOtp.every((digit) => digit !== '')) {
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move focus back if current is empty
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
        setActiveSlot(index - 1);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, length);
    const newOtp = [...otp];

    pastedData.split('').forEach((char, i) => {
      newOtp[i] = char;
    });

    setOtp(newOtp);
    
    // Set focus to the last filled slot or the last box
    const nextIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[nextIndex].focus();
    setActiveSlot(nextIndex);

    if (newOtp.every((digit) => digit !== '')) {
      onComplete(newOtp.join(''));
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-3 justify-center">
        {otp.map((digit, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <input
              ref={(ref) => (inputRefs.current[index] = ref)}
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={1}
              value={digit}
              disabled={disabled}
              onFocus={(e) => {
                e.target.select();
                setActiveSlot(index);
              }}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              className={cn(
                "w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-mono font-bold transition-all duration-200",
                "bg-zinc-900/50 border-2 rounded-xl outline-none",
                activeSlot === index 
                  ? "border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.3)] ring-1 ring-white/20" 
                  : "border-white/10 text-zinc-500 hover:border-white/20",
                disabled && "opacity-30 cursor-not-allowed"
              )}
            />
          </motion.div>
        ))}
      </div>
      
      {/* Tactical Status Line */}
      <div className="flex items-center gap-2">
        <div className={cn(
          "h-1.5 w-1.5 rounded-full animate-pulse",
          otp.every(d => d !== '') ? "bg-emerald-500" : "bg-zinc-700"
        )} />
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">
          {otp.every(d => d !== '') ? "Code Ready" : "Awaiting Input"}
        </span>
      </div>
    </div>
  );
}