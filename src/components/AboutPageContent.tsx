'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Calendar, ShieldAlert, Award, Smile, ArrowRight, 
  Activity, MapPin, User, Lock, Compass, CheckCircle2, 
  Music, Film, Users, Play, BookOpen, CheckSquare,
  Dumbbell, PartyPopper, Flame
} from 'lucide-react';
import Link from 'next/link';

export default function AboutPageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'you' | 'events'>('you');

  // Sync tab with URL search parameter
  useEffect(() => {
    if (tabParam === 'you' || tabParam === 'events') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: 'you' | 'events') => {
    setActiveTab(tab);
    // Smoothly update browser URL query parameter without full reload
    window.history.pushState(null, '', `/about?tab=${tab}`);
  };

  // Preference simulation state for "For You" tab
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Dance']);
  
  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      if (selectedInterests.length > 1) { // keep at least one
        setSelectedInterests(selectedInterests.filter(i => i !== interest));
      }
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const simulationEvents = [
    {
      title: 'Retro Funk Dance Takeover',
      category: 'Dance',
      location: 'Central Plaza Fountain, Mumbai',
      date: 'Next Saturday • 4:00 PM',
      difficulty: 'Easy (4-step loop)',
      unlocks: 'Rehearsal video & audio track'
    },
    {
      title: 'Secret Candlelight Acapella Choir',
      category: 'Music',
      location: 'Heritage Arcade Hall, Bangalore',
      date: 'June 26 • 8:00 PM',
      difficulty: 'Medium (Harmonies)',
      unlocks: 'Sheet music PDF & section recordings'
    },
    {
      title: 'Frozen Statue Crowd Assembly',
      category: 'Drama',
      location: 'Metro Junction Passage, Delhi',
      date: 'July 05 • 12:30 PM',
      difficulty: 'All levels (5 min hold)',
      unlocks: 'Sync cue trigger app access'
    }
  ];

  const matchedEvents = simulationEvents.filter(e => selectedInterests.includes(e.category));

  // Host lifecycle state for "Events" tab
  const [currentStep, setCurrentStep] = useState<number>(0);
  const hostSteps = [
    {
      title: 'Design & Upload',
      icon: <Music size={16} />,
      desc: 'Formulate your idea (synchronized dance, choir, or freeze). Record a tutorial video or upload sheet music to the host dashboard.',
      tip: 'Keep choreographies simple so anyone can join!'
    },
    {
      title: 'Geofence the Secret Location',
      icon: <MapPin size={16} />,
      desc: 'Set the exact coordinates on the interactive map. The location details remain hidden from search engines and non-attendees.',
      tip: 'Pick a high-foot-traffic public square or plaza.'
    },
    {
      title: 'RSVP Locking & Secrecy',
      icon: <Lock size={16} />,
      desc: 'Publish your event. Performance instructions, sheet music, and dress codes are locked until performers register and confirm attendance.',
      tip: 'Set a registration limit to match the public space capacity.'
    },
    {
      title: 'Spontaneous Takeover',
      icon: <Sparkles size={16} />,
      desc: 'Assemble. Blend into the crowd. Perform suddenly at the synchronized time, bring wonder to spectators, and disperse cleanly.',
      tip: 'Always respect local guidelines and leave no trace behind!'
    }
  ];

  // Safety checklist state
  const [checkedRules, setCheckedRules] = useState<Record<number, boolean>>({
    0: true,
    1: false,
    2: false,
    3: false
  });

  const toggleRule = (idx: number) => {
    setCheckedRules(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const safetyRules = [
    { title: 'Emergency Access Always Clear', desc: 'Never block exits, metro escalators, doors, or emergency lanes.' },
    { title: 'Consent & Spectator Comfort', desc: 'Avoid physical contact or forcing spectators to engage. Keep it fun and non-threatening.' },
    { title: 'Immediate Cleanup Policy', desc: 'If props are used (e.g. confetti or banners), ensure they are fully swept away in under 60 seconds.' },
    { title: 'No Traffic Obstruction', desc: 'Avoid public streets/roads. Confine performances to pedestrian plazas, parks, or designated spaces.' }
  ];

  return (
    <div className="space-y-12 py-4 pb-16 max-w-5xl mx-auto text-white relative">
      
      {/* Background glow overrides */}
      <div className="absolute top-[-10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-[#FF007F]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[45vw] h-[45vw] rounded-full bg-[#00F0FF]/5 blur-[130px] pointer-events-none" />

      {/* Hero Header Section */}
      <section className="text-center space-y-4 pt-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2 bg-pink-500/10 border border-pink-500/20 text-pink-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_12px_rgba(255,0,127,0.15)]"
        >
          <Sparkles size={12} className="animate-pulse" />
          <span>Coordinated Spontaneity</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent"
        >
          FlashMob Connect
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl mx-auto font-medium"
        >
          Bringing spontaneous joy, music, and dance to public spaces. FlashMob Connect is a coordination platform that helps you discover secret performances, rehearse in private, and pull off amazing pop-up events.
        </motion.p>
      </section>

      {/* Premium Sliding Tab Switcher */}
      <div className="flex justify-center p-1 bg-white/5 border border-white/5 rounded-full max-w-xs sm:max-w-sm mx-auto relative z-20">
        {(['you', 'events'] as const).map((tab) => {
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className="relative flex-1 py-2.5 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-full transition-all duration-300 cursor-pointer text-center"
            >
              {active && (
                <motion.span
                  layoutId="aboutActiveTab"
                  className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-650 rounded-full shadow-[0_0_15px_rgba(255,0,127,0.35)]"
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                />
              )}
              <span className={`relative z-10 transition-colors ${active ? 'text-white' : 'text-zinc-450 hover:text-zinc-200'}`}>
                {tab === 'you' ? 'For Performers' : 'For Hosts'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === 'you' ? (
          <motion.div
            key="you-tab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-12"
          >
            {/* Features Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Feature 1: Discover */}
              <div className="bg-zinc-950/45 border border-white/5 rounded-3xl p-6 space-y-4 hover:border-pink-500/20 transition-all duration-300 shadow-premium group">
                <div className="h-10 w-10 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(255,0,127,0.2)] group-hover:scale-105 transition-transform">
                  <Compass size={18} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-black text-white text-sm tracking-wide">Discover Secret Events</h3>
                  <p className="text-zinc-450 text-xs leading-relaxed font-semibold">
                    Find events that match your style—whether you dance, sing, act, or just want to join the crowd and witness the magic.
                  </p>
                </div>
              </div>

              {/* Feature 2: Secret Rehearsals */}
              <div className="bg-zinc-950/45 border border-white/5 rounded-3xl p-6 space-y-4 hover:border-purple-500/20 transition-all duration-300 shadow-premium group">
                <div className="h-10 w-10 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(157,0,255,0.2)] group-hover:scale-105 transition-transform">
                  <Lock size={18} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-black text-white text-sm tracking-wide">Learn the Choreography</h3>
                  <p className="text-zinc-450 text-xs leading-relaxed font-semibold">
                    Get the secret details once you RSVP. Rehearsal videos, audio tracks, and exact coordinates are locked to keep the surprise element alive.
                  </p>
                </div>
              </div>

              {/* Feature 3: Certificate / Profile */}
              <div className="bg-zinc-950/45 border border-white/5 rounded-3xl p-6 space-y-4 hover:border-cyan-500/20 transition-all duration-300 shadow-premium group">
                <div className="h-10 w-10 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(0,240,255,0.2)] group-hover:scale-105 transition-transform">
                  <Award size={18} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-black text-white text-sm tracking-wide">Build Your Rep</h3>
                  <p className="text-zinc-450 text-xs leading-relaxed font-semibold">
                    Earn badges and build your profile by showing up. Log confirmed attendances, unlock special event tickets, and level up your community standing.
                  </p>
                </div>
              </div>

            </div>

            {/* Interactive Preference & Curated Feed Section */}
            <div className="bg-gradient-to-br from-zinc-950 via-zinc-900/80 to-zinc-950 border border-white/5 rounded-[32px] p-6 sm:p-8 shadow-[0_0_35px_rgba(0,0,0,0.6)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Preferences selector left */}
              <div className="lg:col-span-5 space-y-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center space-x-1 text-pink-400 text-[10px] font-black uppercase tracking-wider bg-pink-500/10 border border-pink-500/20 px-2.5 py-1 rounded-md">
                    <User size={10} />
                    <span>Interactive Preview</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Curate Your Feed
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                    Select your interests below to customize your personal feed:
                  </p>
                </div>

                {/* Preference buttons */}
                <div className="flex flex-wrap gap-2.5">
                  {[
                    { label: 'Dance & Rhythm', val: 'Dance' },
                    { label: 'Vocals & Acoustic', val: 'Music' },
                    { label: 'Drama & Freeze', val: 'Drama' }
                  ].map((item) => {
                    const selected = selectedInterests.includes(item.val);
                    return (
                      <button
                        key={item.val}
                        onClick={() => toggleInterest(item.val)}
                        className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          selected
                            ? 'bg-gradient-to-r from-pink-500 to-purple-650 text-white border-transparent shadow-[0_0_10px_rgba(255,0,127,0.3)] scale-[1.02]'
                            : 'bg-white/5 border-white/5 hover:border-white/10 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {selected ? '★ ' : ''}{item.label}
                      </button>
                    );
                  })}
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-[11px] text-zinc-450 leading-relaxed font-medium">
                  <strong>How it works:</strong> Once you sign up, your feed automatically highlights events that match your talents and notifies you when new ones pop up near you.
                </div>
              </div>

              {/* Dynamic matched results right */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Your Simulated Feed ({matchedEvents.length} Matched)
                  </h4>
                  <span className="text-[9px] font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full border border-cyan-400/20">
                    Active in Your Area
                  </span>
                </div>

                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                  {matchedEvents.length > 0 ? (
                    matchedEvents.map((event, idx) => (
                      <motion.div
                        key={event.title}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-4 rounded-2xl bg-zinc-950 border border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 group hover:border-pink-500/20 transition-all duration-300 relative overflow-hidden"
                      >
                        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-pink-500 to-purple-650" />
                        <div className="space-y-1 pl-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-black tracking-wider uppercase px-2 py-0.5 rounded bg-zinc-900 border border-white/10 text-zinc-300">
                              {event.category}
                            </span>
                            <span className="text-[9px] font-bold text-amber-400 flex items-center gap-0.5">
                              <span>Level:</span>
                              <span>{event.difficulty}</span>
                            </span>
                          </div>
                          <h5 className="text-xs sm:text-sm font-black text-white group-hover:text-pink-500 transition-colors">
                            {event.title}
                          </h5>
                          <p className="text-[10px] text-zinc-550 flex items-center gap-1">
                            <MapPin size={9} />
                            <span>{event.location}</span>
                          </p>
                        </div>

                        <div className="flex flex-col items-start sm:items-end gap-1.5 pr-2">
                          <span className="text-[9px] text-zinc-400 font-semibold">{event.date}</span>
                          <span className="text-[9px] font-black text-cyan-400 flex items-center gap-1 bg-cyan-400/5 border border-cyan-400/10 px-2 py-1 rounded-lg">
                            <Lock size={9} className="animate-pulse" />
                            <span>Unlock: {event.unlocks}</span>
                          </span>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8 bg-zinc-950/60 rounded-2xl border border-dashed border-white/10">
                      <p className="text-xs text-zinc-500">Toggle interests to display events</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </motion.div>
        ) : (
          <motion.div
            key="events-tab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-12"
          >
            {/* Concept Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              
              {/* What is a flashmob visual block */}
              <div className="relative h-64 sm:h-80 w-full rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_35px_rgba(0,0,0,0.85)] bg-zinc-950 group">
                <img
                  src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800"
                  alt="Crowd performance art flashmob"
                  className="w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-103"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent"></div>
                <div className="absolute bottom-5 inset-x-5 space-y-1 text-left">
                  <span className="bg-pink-500 text-white text-[8px] font-black tracking-widest uppercase px-2 py-1 rounded-md">
                    Coordinated Takeover
                  </span>
                  <h4 className="text-base sm:text-lg font-black text-white">What is a Flashmob?</h4>
                  <p className="text-[10px] text-zinc-300 leading-normal font-medium max-w-sm">
                    A flashmob is a group of people who assemble suddenly in a public place, perform an unusual and seemingly random act (like a dance, choir, or freeze), and then quickly disperse back into the crowd.
                  </p>
                </div>
              </div>

              {/* Description text column */}
              <div className="space-y-6 text-left">
                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <Activity className="text-pink-500" />
                    <span>How Events Work</span>
                  </h3>
                  <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-semibold">
                    FlashMob Connect makes organizing a flashmob simple. Hosts post event details, upload practice guides (like sheet music or videos), and set a geofence. Performers RSVP to get the secret instructions.
                  </p>
                  <p className="text-zinc-450 text-xs leading-relaxed font-medium">
                    This keeps the event a total surprise for spectators and passersby until the performance starts!
                  </p>
                </div>

                <div className="flex gap-4">
                  <Link
                    href="/events"
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-650 hover:from-pink-600 hover:to-purple-700 text-white font-black text-xs py-3.5 rounded-2xl transition-all duration-300 shadow-[0_0_12px_rgba(255,0,127,0.25)] flex items-center justify-center space-x-1.5 active:scale-98 text-center"
                  >
                    <span>View Feed</span>
                    <ArrowRight size={13} />
                  </Link>

                  <Link
                    href="/events/create"
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-500/30 text-white font-bold text-xs py-3.5 rounded-2xl transition-all text-center"
                  >
                    Organize a Flashmob
                  </Link>
                </div>
              </div>

            </div>

            {/* Interactive Hosting Lifecycle Step Showcase */}
            <div className="bg-zinc-950/40 border border-white/5 rounded-[32px] p-6 sm:p-8 space-y-6 shadow-premium">
              <div className="space-y-1">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-550">
                  Organizer Checklist
                </h4>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  How to Host an Event
                </h3>
              </div>

              {/* Progress dots bar */}
              <div className="flex items-center justify-between max-w-lg mx-auto py-2 relative">
                <div className="absolute left-2.5 right-2.5 top-1/2 -translate-y-1/2 h-[1px] bg-white/10 -z-10" />
                <div 
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-pink-500 to-purple-650 -z-10 transition-all duration-500" 
                  style={{ width: `${(currentStep / (hostSteps.length - 1)) * 95}%` }}
                />
                
                {hostSteps.map((step, idx) => {
                  const active = currentStep === idx;
                  const completed = currentStep > idx;
                  return (
                    <button
                      key={step.title}
                      onClick={() => setCurrentStep(idx)}
                      className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all cursor-pointer ${
                        active 
                          ? 'bg-pink-500 border-pink-400 text-white shadow-[0_0_10px_rgba(255,0,127,0.5)] scale-110'
                          : completed
                          ? 'bg-purple-650 border-purple-500 text-white'
                          : 'bg-zinc-950 border-white/10 text-zinc-500 hover:border-zinc-300'
                      }`}
                      title={step.title}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Progress details card */}
              <div className="bg-zinc-950 border border-white/5 rounded-2xl p-5 relative min-h-[140px] flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2 text-pink-400 font-bold text-xs">
                      {hostSteps[currentStep].icon}
                      <span className="uppercase tracking-wider">Step {currentStep + 1}: {hostSteps[currentStep].title}</span>
                    </div>
                    <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed font-medium">
                      {hostSteps[currentStep].desc}
                    </p>
                  </motion.div>
                </AnimatePresence>

                <div className="border-t border-white/5 pt-3 mt-3 flex items-center justify-between text-[10px] text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Sparkles size={11} className="text-amber-500" />
                    <strong>Host Tip:</strong> {hostSteps[currentStep].tip}
                  </span>
                  <button 
                    onClick={() => setCurrentStep((prev) => (prev + 1) % hostSteps.length)}
                    className="text-pink-500 font-bold hover:underline cursor-pointer"
                  >
                    Next Step &rarr;
                  </button>
                </div>
              </div>
            </div>

            {/* Safety Guidelines Block with interactive checkboxes */}
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-[32px] p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-5 space-y-3">
                <div className="h-10 w-10 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.2)]">
                  <ShieldAlert size={18} />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-amber-400 tracking-tight">
                  Community & Safety Rules
                </h3>
                <p className="text-xs text-zinc-450 leading-relaxed font-semibold">
                  Keeping flashmobs safe, respectful, and positive is our top priority. All hosts and performers must follow these simple community rules.
                </p>
                <div className="p-3 bg-zinc-950/40 rounded-xl border border-white/5 text-[9px] text-zinc-500 font-medium">
                  Review the safety checklist below to see how we keep our assemblies safe and legal.
                </div>
              </div>

              <div className="lg:col-span-7 space-y-2.5">
                {safetyRules.map((rule, idx) => {
                  const checked = checkedRules[idx] || false;
                  return (
                    <button
                      key={rule.title}
                      onClick={() => toggleRule(idx)}
                      className={`w-full p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        checked
                          ? 'bg-amber-500/10 border-amber-500/20'
                          : 'bg-zinc-950/80 border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className={`mt-0.5 rounded-md p-0.5 border transition-all ${
                        checked 
                          ? 'bg-amber-500 border-amber-400 text-zinc-950'
                          : 'border-zinc-700 text-transparent'
                      }`}>
                        <CheckSquare size={12} className="stroke-[3]" />
                      </div>
                      <div className="space-y-0.5">
                        <h5 className={`text-xs font-bold transition-colors ${checked ? 'text-amber-400' : 'text-zinc-300'}`}>
                          {rule.title}
                        </h5>
                        <p className="text-[10px] text-zinc-500 leading-normal font-medium">
                          {rule.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories Details Section */}
      <section className="space-y-6 pt-8 border-t border-white/5 relative z-15">
        <div className="text-center sm:text-left space-y-2">
          <div className="inline-flex items-center space-x-2 bg-pink-500/10 border border-pink-500/20 text-pink-400 px-3.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
            <Compass size={11} className="animate-spin-slow" />
            <span>Platform Sectors</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            Explore Category Sectors
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed font-semibold max-w-2xl">
            FlashMob Connect hosts 5 key categories of spontaneous event assemblies. Get to know what each group represents, their typical setups, and recommendations for organizers and performers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {[
            {
              title: 'Dance & Choreography',
              val: 'Dance',
              icon: <Flame className="text-pink-500" size={20} />,
              gradient: 'from-pink-500/5 to-purple-500/5 hover:border-pink-500/30',
              shadow: 'hover:shadow-[0_0_20px_rgba(255,0,127,0.15)]',
              desc: 'Coordinated physical movements that range from sudden freeze mobs to high-energy synchronized street routines. Bring rhythm and motion to public arenas.',
              examples: ['Flash mobs', 'TikTok dance takeovers', 'Silent disco dances', 'Ballroom freezes', 'Retro groove circles'],
              difficulty: 'All Levels (Simple loops to advanced steps)',
              tip: 'Upload a YouTube tutorial or practice video so participants can lock in the moves from home!'
            },
            {
              title: 'Music & Choirs',
              val: 'Music',
              icon: <Music className="text-cyan-400" size={20} />,
              gradient: 'from-cyan-500/5 to-blue-500/5 hover:border-cyan-500/30',
              shadow: 'hover:shadow-[0_0_20px_rgba(0,240,255,0.15)]',
              desc: 'Sudden, acoustic live performances and secret choral harmonies. Fill the streets with vocal energy or surprise acoustic instrument jam sessions.',
              examples: ['Acapella choir surprise', 'Acoustic guitar ensembles', 'Brass band takeovers', 'Synchronized public humming'],
              difficulty: 'Easy to High (Acoustic playing or multi-part harmonies)',
              tip: 'Provide distinct sheet music or audio track parts (soprano, alto, tenor) for singers to practice ahead of time.'
            },
            {
              title: 'Social & Meetups',
              val: 'Social',
              icon: <Users className="text-purple-400" size={20} />,
              gradient: 'from-purple-500/5 to-pink-500/5 hover:border-purple-500/30',
              shadow: 'hover:shadow-[0_0_20px_rgba(157,0,255,0.15)]',
              desc: 'Impromptu assemblies, massive public games, or street stunts aimed at bringing smiles to passersby and connecting local communities.',
              examples: ['Giant rock-paper-scissors tournaments', 'Synchronized pillow fights', 'Massive bubble-blowing circles'],
              difficulty: 'No Skill Required (Fun, interactive, and open to all ages)',
              tip: 'Agree on a simple visual start signal (e.g. opening a bright yellow umbrella) so everyone acts at the exact same second.'
            },
            {
              title: 'Fitness & Sports',
              val: 'Fitness',
              icon: <Dumbbell className="text-green-400" size={20} />,
              gradient: 'from-green-500/5 to-emerald-500/5 hover:border-green-500/30',
              shadow: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
              desc: 'Sudden athletic challenges or fitness workshops conducted in public parks or plazas, promoting healthy living and shared movement.',
              examples: ['Plaza yoga loops', 'Synchronized high-intensity interval training (HIIT)', 'Skipping-rope mobs', 'Outdoor aerobics'],
              difficulty: 'Medium (Requires standard physical stamina and effort)',
              tip: 'Ensure the public spot chosen has flat, dry ground and enough square footage for everyone to stretch out safely.'
            },
            {
              title: 'Celebrations & Parades',
              val: 'Celebration',
              icon: <PartyPopper className="text-amber-400" size={20} />,
              gradient: 'from-amber-500/5 to-orange-500/5 hover:border-amber-500/30',
              shadow: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]',
              desc: 'Festive surprise walks, seasonal costume marches, or colorful assemblies to spread happiness, mark special dates, and create positive spectacles.',
              examples: ['Neon light night walks', 'Surprise birthday marches', 'Festive costume parades', 'Clean banner reveals'],
              difficulty: 'Easy (Creative dress code and simple walking coordination)',
              tip: 'Prioritize cleanliness! Keep props neat and guarantee that all items/costume scraps are completely cleared after dispersing.'
            }
          ].map((cat) => (
            <div
              key={cat.title}
              className={`bg-zinc-950/40 border border-white/5 bg-gradient-to-br ${cat.gradient} rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 ${cat.shadow} group hover:-translate-y-0.5`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 shrink-0">
                      {cat.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white tracking-wide">
                        {cat.title}
                      </h4>
                      <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                        Category: {cat.val}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-zinc-350 leading-relaxed font-semibold">
                  {cat.desc}
                </p>

                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">Typical Gigs:</span>
                    <ul className="list-disc list-inside text-[11px] text-zinc-400 pl-1 space-y-0.5">
                      {cat.examples.map((ex, i) => (
                        <li key={i} className="leading-relaxed font-medium">{ex}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">Difficulty Rating:</span>
                    <p className="text-[11px] text-zinc-400 font-medium">{cat.difficulty}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 bg-black/20 -mx-6 -mb-6 p-6 rounded-b-3xl">
                <div className="flex items-start gap-2">
                  <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-md uppercase shrink-0">Tip</span>
                  <p className="text-[10px] text-zinc-450 leading-normal font-semibold">
                    {cat.tip}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Link
                    href={`/events?category=${cat.val}`}
                    className="text-[10px] font-black text-pink-500 hover:text-pink-400 flex items-center gap-1 transition-colors uppercase tracking-wider"
                  >
                    <span>View {cat.val} Feed</span>
                    <ArrowRight size={10} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
