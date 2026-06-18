'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Info, HelpCircle, Activity, MapPin, ShieldAlert, Heart, Calendar, ArrowRight } from 'lucide-react';

export default function AboutSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on pressing escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Prevent scroll propagation when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Floating Vertical Tab Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 50, opacity: 0 }}
            whileHover={{ x: -4 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={() => setIsOpen(true)}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-[80] flex items-center gap-2.5 pl-3.5 pr-2 py-5 bg-zinc-950/85 hover:bg-zinc-900 border-l border-y border-white/10 hover:border-pink-500/35 rounded-l-2xl shadow-[0_0_20px_rgba(255,0,127,0.15)] text-white hover:text-pink-400 transition-all duration-300 group cursor-pointer"
            title="Learn about FlashMob Connect"
          >
            <div className="flex flex-col items-center gap-2">
              <Sparkles size={14} className="text-pink-500 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 animate-pulse" />
              <span className="[writing-mode:vertical-lr] rotate-180 text-[10px] font-black uppercase tracking-widest select-none">
                About FlashMob
              </span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Sidebar Drawer Component */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs"
            />

            {/* Sidebar Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md z-[101] bg-[#08080E]/95 backdrop-blur-2xl border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.85)] flex flex-col text-white"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="bg-gradient-to-tr from-pink-500 to-purple-650 p-2 rounded-xl text-white shadow-[0_0_12px_rgba(255,0,127,0.4)]">
                    <Sparkles size={16} className="fill-white" />
                  </span>
                  <div>
                    <h3 className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent font-black text-lg tracking-tight select-none">
                      FlashMob Connect
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                      Coordinated Spontaneity
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-all cursor-pointer"
                  title="Close sidebar"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Information Body */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8">
                {/* Intro concept */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Activity size={12} className="text-pink-500" />
                    <span>What is a Flashmob?</span>
                  </h4>
                  <p className="text-zinc-350 text-xs sm:text-sm leading-relaxed">
                    A flashmob is a group of people who assemble suddenly in a public place, perform an unusual and brief performance, then quickly disperse. 
                  </p>
                  <p className="text-zinc-350 text-xs sm:text-sm leading-relaxed">
                    Whether it&apos;s synchronized dances, live music choirs, or artistic statue freezes, flashmobs disrupt the routine of daily life, spreading wonder, joy, and laughter to local communities.
                  </p>
                </div>

                {/* Key Pillars */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Info size={12} className="text-cyan-400" />
                    <span>How it works</span>
                  </h4>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/5">
                      <div className="mt-0.5 p-1.5 rounded-lg bg-pink-500/10 border border-pink-500/25 text-pink-400">
                        <Calendar size={13} />
                      </div>
                      <div className="space-y-0.5">
                        <h5 className="text-xs font-bold text-white">1. Discovery</h5>
                        <p className="text-[11px] text-zinc-400 leading-normal">
                          Explore list of active dance, vocal, or performance flashmobs scheduled in your city.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/5">
                      <div className="mt-0.5 p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-cyan-400">
                        <ShieldAlert size={13} />
                      </div>
                      <div className="space-y-0.5">
                        <h5 className="text-xs font-bold text-white">2. Secret Guidelines</h5>
                        <p className="text-[11px] text-zinc-400 leading-normal">
                          To keep the surprise element intact, rehearsal videos, instructions, and exact coordinates are locked until you RSVP.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/5">
                      <div className="mt-0.5 p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/25 text-purple-400">
                        <Heart size={13} />
                      </div>
                      <div className="space-y-0.5">
                        <h5 className="text-xs font-bold text-white">3. Participate</h5>
                        <p className="text-[11px] text-zinc-400 leading-normal">
                          Gather, perform, spark happiness in spectators, and blend back into the crowd seamlessly!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Guidelines Card */}
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15 space-y-3">
                  <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldAlert size={13} />
                    <span>Quick Rules</span>
                  </h4>
                  <ul className="space-y-2 text-[11px] text-zinc-400 leading-normal list-disc list-inside">
                    <li>
                      <strong className="text-zinc-300">Stay Safe:</strong> Perform only in public settings without blocking traffic/services.
                    </li>
                    <li>
                      <strong className="text-zinc-300">Respect:</strong> Never harass public spectators. Flashmobs build positivity.
                    </li>
                    <li>
                      <strong className="text-zinc-300">Leave No Trace:</strong> Ensure all props and items are cleaned up immediately.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-6 border-t border-white/5 bg-zinc-950/40 space-y-3">
                <Link
                  href="/events"
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-650 hover:from-pink-600 hover:to-purple-700 text-white font-black text-xs py-3 rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(255,0,127,0.25)] flex items-center justify-center space-x-1.5 shrink-0 active:scale-98"
                >
                  <span>Explore Events</span>
                  <ArrowRight size={13} />
                </Link>

                <Link
                  href="/about"
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-500/30 text-white font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center space-x-1"
                >
                  <span>Full Platform Guidelines</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
