'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, Ticket, Compass, ArrowRight, Sparkles, ChevronRight, CheckCircle2, Flame, Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Define structure for events in the mockup
interface MockEvent {
  id: string;
  title: string;
  category: 'For you' | 'Events';
  price: string;
  location: string;
  date: string;
  image: string;
  rating: string;
  tags: string[];
}

const mockEvents: MockEvent[] = [
  // For You
  {
    id: 'fy-1',
    title: 'Neon Horizon Music & Arts Festival',
    category: 'For you',
    price: '₹1,299',
    location: 'Nesco Exhibition Centre, Mumbai',
    date: 'Saturday, June 20 • 6:00 PM',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600',
    rating: '4.9',
    tags: ['Music', 'Art', 'Trending']
  },
  {
    id: 'fy-2',
    title: 'Secret Candlelight Acoustic Session',
    category: 'For you',
    price: '₹699',
    location: 'The Black Box Theater, Bangalore',
    date: 'Friday, June 26 • 8:00 PM',
    image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=600',
    rating: '4.8',
    tags: ['Acoustic', 'Cozy']
  },
  {
    id: 'fy-3',
    title: 'Midnight Street Food & Culture Walk',
    category: 'For you',
    price: '₹499',
    location: 'Old Delhi Heritage Zone, Delhi',
    date: 'Saturday, June 27 • 9:00 PM',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600',
    rating: '4.7',
    tags: ['Food', 'Heritage']
  },
  // Events
  {
    id: 'e-1',
    title: 'Spontaneous Rhythm Flashmob Performance',
    category: 'Events',
    price: 'Free Entry (RSVP)',
    location: 'Connaught Place Central Park, Delhi',
    date: 'Saturday, June 27 • 5:00 PM',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=600',
    rating: '4.9',
    tags: ['Flashmob', 'Dance', 'Community']
  },
  {
    id: 'e-2',
    title: 'EDM Dance Arena: Neon Nights tour',
    category: 'Events',
    price: '₹1,599',
    location: 'GMR Arena, Hyderabad',
    date: 'Friday, June 19 • 7:00 PM',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=600',
    rating: '4.75',
    tags: ['EDM', 'Dance']
  },
  {
    id: 'e-3',
    title: 'ISL Football Match: Derby Special Live',
    category: 'Events',
    price: '₹350',
    location: 'Salt Lake Stadium, Kolkata',
    date: 'Sunday, June 21 • 7:30 PM',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=600',
    rating: '4.8',
    tags: ['Sports', 'Live Action']
  }
];

const categories = ['For you', 'Events'] as const;

export default function LifestyleLandingPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<typeof categories[number]>('For you');
  const [searchQuery, setSearchQuery] = useState('');
  const [rsvpStatus, setRsvpStatus] = useState<Record<string, boolean>>({});

  // Featured Event representing the active category in the Left Column
  const featuredEvent = useMemo(() => {
    switch (activeTab) {
      case 'For you':
        return {
          title: 'Neon Horizon Music & Arts Festival',
          subtitle: 'CURATED JUST FOR YOU',
          priceTag: '₹1,299 onwards',
          desc: 'Embark on a visual and auditory journey. A premium weekend getaway featuring 15+ international electronic artists, interactive light installations, and gourmet food zones in the heart of Mumbai.',
          date: 'Saturday, June 20 • 6:00 PM onwards',
          location: 'Nesco Exhibition Centre, Mumbai',
          rating: '4.9 (1,200+ bookings)',
          badge: 'Trending #1',
          link: '/events'
        };
      case 'Events':
        return {
          title: 'Spontaneous Rhythm Flashmob Performance',
          subtitle: 'COMMUNITY EXPERIENCE',
          priceTag: 'Free Entry (RSVP)',
          desc: 'Be part of the magic! Join 200+ coordinated dancers, musicians, and spectators in a sudden, high-energy artistic takeover of Delhi\'s central square. Signup to unlock the rehearsal choreography video.',
          date: 'Saturday, June 27 • 5:00 PM Sharp',
          location: 'Connaught Place Central Park, Delhi',
          rating: '4.9 (80+ joined)',
          badge: 'Spontaneous Art',
          link: '/events'
        };
    }
  }, [activeTab]);

  // Filter events below the fold based on active tab AND search query
  const filteredEvents = useMemo(() => {
    return mockEvents.filter((event) => {
      const matchesCategory = event.category === activeTab;
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  const handleRSVP = (eventId: string) => {
    setRsvpStatus((prev) => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  return (
    <div className="bg-zinc-950 text-white min-h-screen relative overflow-hidden font-sans selection:bg-stone-200 selection:text-zinc-900">
      
      {/* Background Glow Hues (Sophisticated concert stage lights) */}
      <div className="absolute top-[-10%] left-[-15%] w-[45vw] h-[45vw] rounded-full bg-[#FF007F]/10 blur-[130px] pointer-events-none animate-float-light" />
      <div className="absolute top-[15%] right-[-15%] w-[50vw] h-[50vw] rounded-full bg-[#00F0FF]/10 blur-[140px] pointer-events-none animate-float-light-delayed" />
      <div className="absolute bottom-[20%] left-[5%] w-[45vw] h-[45vw] rounded-full bg-[#9D00FF]/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#00F0FF]/5 blur-[120px] pointer-events-none" />

      {/* Top Navigation Bar with Glassmorphism */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-zinc-950/40 backdrop-blur-xl transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 text-white font-black text-xl tracking-tighter group transition-transform active:scale-98">
              <span className="bg-gradient-to-tr from-pink-500 to-purple-650 p-1.5 rounded-xl text-white font-bold group-hover:scale-105 duration-300 flex items-center justify-center shadow-[0_0_8px_rgba(255,0,127,0.4)]">
                <Sparkles size={16} className="fill-white" />
              </span>
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent tracking-tighter font-black text-neon-pink">
                FlashMob
              </span>
            </Link>
          </div>

          {/* Navigation Links & Search Box Centered Group */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Minimalist Navigation Pill links */}
            <nav className="flex items-center space-x-1 bg-white/5 p-1 rounded-full border border-white/5">
              {categories.map((tab) => {
                const active = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setSearchQuery(''); // Reset search when switching tabs
                    }}
                    className="relative px-5 py-2 text-xs font-bold rounded-full transition-all duration-300 cursor-pointer"
                  >
                    {active && (
                      <motion.span
                        layoutId="activeTabPill"
                        className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-650 rounded-full shadow-[0_0_10px_rgba(255,0,127,0.3)]"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className={`relative z-10 transition-colors duration-300 ${active ? 'text-white font-black' : 'text-zinc-400 hover:text-white'}`}>
                      {tab}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Translucent Search Box */}
            <div className="relative">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 focus:w-72 bg-white/5 hover:bg-white/8 border border-white/5 hover:border-pink-500/30 rounded-full pl-10 pr-4 py-2 text-xs font-medium text-white placeholder-zinc-500 focus:outline-none transition-all duration-300 focus:ring-1 focus:ring-pink-500/25"
              />
            </div>
          </div>

          {/* Right Area: CTA Button / User Avatar */}
          <div className="flex items-center space-x-4">
            <Link
              href="/about"
              className="text-xs font-bold text-zinc-400 hover:text-white transition-colors px-3 py-2"
            >
              How it Works
            </Link>

            {user ? (
              <Link
                href="/dashboard"
                className="h-9 w-9 rounded-full bg-gradient-to-tr from-pink-500 to-purple-650 text-white flex items-center justify-center font-bold text-xs border border-white/10 shadow-[0_0_10px_rgba(255,0,127,0.3)] hover:scale-105 transition-transform"
                title="Go to Dashboard"
              >
                {user.name.charAt(0).toUpperCase()}
              </Link>
            ) : (
              <Link
                href="/signup"
                className="bg-gradient-to-r from-pink-500 to-purple-650 hover:from-pink-600 hover:to-purple-700 text-white font-black text-xs px-5 py-2.5 rounded-full transition-all active:scale-95 shadow-[0_0_15px_rgba(255,0,127,0.35)]"
              >
                Sign Up
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Search & Tab Selection (Visible only on mobile screen widths) */}
      <div className="md:hidden px-4 pt-4 pb-2 space-y-3 border-b border-white/5 bg-zinc-950/20 backdrop-blur-md">
        <div className="relative">
          <Search size={14} className="absolute left-4.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/5 rounded-full pl-11 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500/30"
          />
        </div>
        <div className="flex space-x-1 overflow-x-auto no-scrollbar py-1">
          {categories.map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSearchQuery('');
                }}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  active ? 'bg-gradient-to-r from-pink-500 to-purple-650 text-white shadow-[0_0_8px_rgba(255,0,127,0.3)]' : 'bg-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Page Layout Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 md:py-20 relative z-10 space-y-28">

        {/* Hero Section: Asymmetrical, Split-screen */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Bold Typography & Event Pricing Details */}
          <div className="lg:col-span-7 space-y-8 lg:pr-8">
            
            {/* Category / Trend Badge with glow indicator */}
            <div className="inline-flex items-center space-x-2.5 bg-pink-500/10 border border-pink-500/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-pink-400 shadow-[0_0_10px_rgba(255,0,127,0.15)]">
              <span className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-ping" />
              <span>{featuredEvent.badge}</span>
            </div>

            {/* Prominent Bold Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-none text-neon-pink">
                {featuredEvent.title}
              </h1>
              
              {/* High Readability Event Details Row */}
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-zinc-400">
                <span className="flex items-center space-x-1.5 bg-white/5 px-3 py-1 rounded-md border border-white/5">
                  <Calendar size={13} className="text-pink-400" />
                  <span>{featuredEvent.date}</span>
                </span>
                <span className="flex items-center space-x-1.5 bg-white/5 px-3 py-1 rounded-md border border-white/5">
                  <MapPin size={13} className="text-cyan-400" />
                  <span>{featuredEvent.location}</span>
                </span>
              </div>
            </div>

            {/* Event Description */}
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-medium max-w-xl">
              {featuredEvent.desc}
            </p>

            {/* Pricing Tag and CTAs Block */}
            <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              
              {/* Pricing Display */}
              <div className="space-y-1 bg-zinc-900/50 border border-white/10 rounded-2xl px-5 py-3 w-full sm:w-auto">
                <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Pricing Starts At</p>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-black text-white">{featuredEvent.priceTag.split(' ')[0]}</span>
                  <span className="text-xs font-medium text-zinc-500">{featuredEvent.priceTag.split(' ')[1] || 'onwards'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <Link
                  href={featuredEvent.link}
                  className="bg-gradient-to-r from-pink-500 to-purple-650 hover:from-pink-600 hover:to-purple-700 text-white font-black text-xs px-8 py-4.5 rounded-2xl transition-all duration-300 shadow-[0_0_15px_rgba(255,0,127,0.3)] hover:shadow-[0_0_22px_rgba(255,0,127,0.5)] flex items-center justify-center space-x-2 shrink-0 active:scale-98 w-full sm:w-auto"
                >
                  <Ticket size={14} className="fill-white" />
                  <span>Book Tickets Now</span>
                </Link>
                
                <Link
                  href="/events"
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs px-6 py-4.5 rounded-2xl transition-all flex items-center justify-center space-x-1.5 w-full sm:w-auto"
                >
                  <span>Explore Lifestyles</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* User social proofing (Bookings/Reviews) */}
            <div className="pt-2 flex items-center space-x-4 border-t border-white/5 max-w-md">
              <div className="flex -space-x-2.5">
                <img className="w-7 h-7 rounded-full border-2 border-zinc-950 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150" alt="avatar" />
                <img className="w-7 h-7 rounded-full border-2 border-zinc-950 object-cover" src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150" alt="avatar" />
                <img className="w-7 h-7 rounded-full border-2 border-zinc-950 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" alt="avatar" />
              </div>
              <p className="text-xs text-zinc-400 font-medium">
                ★ <span className="text-white font-bold">{featuredEvent.rating}</span> rating by community members
              </p>
            </div>

          </div>

          {/* Right Column: Premium Vertically Oriented Card Component */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <motion.div
              whileHover={{ y: -10, rotate: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="relative w-full max-w-[340px] aspect-[3/4.5] rounded-[32px] overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.85)] group cursor-pointer"
            >
              
              {/* Neon border glow layer */}
              <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />
              
              {/* Background gradient structure */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-600 via-zinc-950 to-cyan-700 z-0 scale-102 blur-[2px]" />
              
              {/* Promotional Figure Image Asset */}
              <img
                src="/promo_card.png"
                alt="Promo entertainment figure"
                className="absolute inset-0 w-full h-full object-cover mix-blend-normal z-10 transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent z-20" />
              
              {/* Card Foreground Details */}
              <div className="absolute bottom-0 inset-x-0 p-6 z-30 space-y-4">
                
                {/* Event Category Tag */}
                <div className="flex items-center justify-between">
                  <span className="bg-gradient-to-r from-pink-500 to-purple-650 text-white text-[9px] font-black uppercase px-2.5 py-1.5 rounded-full tracking-wider shadow-[0_0_8px_rgba(255,0,127,0.3)]">
                    {activeTab} Feature
                  </span>
                  <div className="flex items-center space-x-1 text-xs font-bold text-white bg-black/40 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-lg">
                    <Flame size={11} className="text-pink-500 fill-pink-500 animate-pulse" />
                    <span>Live Event</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white tracking-tight leading-tight group-hover:text-pink-450 transition-colors">
                    {featuredEvent.title}
                  </h3>
                  <p className="text-[10px] font-semibold text-zinc-400 flex items-center gap-1">
                    <MapPin size={9.5} />
                    <span>{featuredEvent.location.split(',')[1] || featuredEvent.location}</span>
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-white/10">
                  <div className="text-left">
                    <p className="text-[8px] uppercase font-bold text-zinc-550">Booking Price</p>
                    <p className="text-xs font-black text-white">{featuredEvent.priceTag}</p>
                  </div>
                  <span className="bg-pink-500 group-hover:bg-white group-hover:text-zinc-950 p-2.5 rounded-full transition-all duration-300 text-white shadow-[0_0_8px_rgba(255,0,127,0.4)]">
                    <Compass size={14} className="group-hover:rotate-45 transition-transform duration-500" />
                  </span>
                </div>

              </div>

            </motion.div>
          </div>

        </section>

        {/* Section: Trending Experiences grid matching search filter */}
        <section className="space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight text-white flex items-center space-x-2">
                <span>Trending {activeTab} Experiences</span>
                <Flame size={18} className="text-pink-500 fill-pink-500 animate-pulse" />
              </h2>
              <p className="text-xs text-zinc-400 font-medium">Handpicked events, dining assemblies, and entertainment happening nearby.</p>
            </div>
            
            {/* Display search result counter */}
            {searchQuery && (
              <div className="text-xs font-semibold text-zinc-500">
                Found {filteredEvents.length} results matching &ldquo;{searchQuery}&rdquo;
              </div>
            )}
          </div>

                   <AnimatePresence mode="popLayout">
            {filteredEvents.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredEvents.map((event, index) => {
                  const isRsvped = rsvpStatus[event.id] || false;
                  return (
                    <motion.div
                      key={event.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="bg-zinc-950/45 backdrop-blur-md border border-white/5 hover:border-pink-500/30 rounded-[24px] overflow-hidden shadow-premium hover:shadow-[0_0_25px_rgba(255,0,127,0.15)] flex flex-col h-full group transition-all duration-300 hover:-translate-y-1.5 relative"
                    >
                      {/* Holographic overlay */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                      {/* Image container */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900 border-b border-white/5">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
                        
                        {/* Interactive Favorite Icon */}
                        <button
                          onClick={() => handleRSVP(event.id)}
                          className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md border border-white/10 transition-all cursor-pointer ${
                            isRsvped ? 'bg-pink-500 text-white border-pink-400 shadow-[0_0_8px_rgba(255,0,127,0.4)]' : 'bg-black/40 text-zinc-300 hover:text-white hover:bg-black/60'
                          }`}
                        >
                          <Heart size={14} className={isRsvped ? 'fill-white' : ''} />
                        </button>

                        {/* Event Tags Overlay */}
                        <div className="absolute bottom-4 left-4 flex gap-1.5">
                          {event.tags.map((tag) => (
                            <span key={tag} className="text-[9px] font-black tracking-widest uppercase bg-zinc-950/80 border border-white/10 backdrop-blur-sm px-2 py-0.5 rounded-md text-zinc-300">
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Pulsing Equalizer on Image Hover */}
                        <div className="absolute bottom-4 right-4 bg-zinc-950/85 border border-white/10 backdrop-blur-md p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="eq-container">
                            <div className="eq-bar" />
                            <div className="eq-bar" />
                            <div className="eq-bar" />
                            <div className="eq-bar" />
                          </div>
                        </div>
                      </div>

                      {/* Content block */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          
                          {/* Rating and price row */}
                          <div className="flex justify-between items-center text-xs font-semibold">
                            <span className="text-[10px] font-bold text-zinc-400">★ {event.rating} rating</span>
                            <span className="text-xs font-black text-white bg-white/5 px-2 py-1 rounded-md border border-white/5">
                              {event.price}
                            </span>
                          </div>

                          <h4 className="font-black text-white text-base leading-tight group-hover:text-pink-500 transition-colors line-clamp-1">
                            {event.title}
                          </h4>
                          
                          {/* Date and Location info */}
                          <div className="space-y-1 text-zinc-400 text-xs font-semibold">
                            <p className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded w-fit">
                              <Calendar size={11} className="text-pink-500" />
                              <span className="truncate">{event.date.split('•')[0]}</span>
                            </p>
                            <p className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded w-fit">
                              <MapPin size={11} className="text-cyan-400" />
                              <span className="truncate">{event.location.split(',')[1] || event.location}</span>
                            </p>
                          </div>

                        </div>

                        {/* CTA button */}
                        <div className="pt-2 border-t border-white/5">
                          <button
                            onClick={() => handleRSVP(event.id)}
                            className={`w-full py-2.5 rounded-xl text-xs font-black tracking-widest uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              isRsvped
                                ? 'bg-emerald-500 hover:bg-emerald-650 text-white'
                                : 'bg-gradient-to-r from-pink-500 to-purple-650 hover:from-pink-600 hover:to-purple-700 text-white shadow-[0_0_12px_rgba(255,0,127,0.2)]'
                            }`}
                          >
                            {isRsvped ? (
                              <>
                                <CheckCircle2 size={13} />
                                <span>RSVP Confirmed</span>
                              </>
                            ) : (
                              <>
                                <span>Confirm Attendance</span>
                                <ChevronRight size={12} />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <div className="text-center py-16 bg-zinc-950/40 rounded-3xl border border-white/5 backdrop-blur-md">
                <p className="text-sm font-semibold text-zinc-500">No events found matching &ldquo;{searchQuery}&rdquo;.</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-xs font-bold text-pink-500 hover:underline cursor-pointer"
                >
                  Clear search filters
                </button>
              </div>
            )}
          </AnimatePresence>

        </section>

        {/* Brand Value Section */}
        <section className="bg-gradient-to-r from-zinc-950/60 to-zinc-950 border border-white/5 p-8 sm:p-12 rounded-[32px] grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="h-10 w-10 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center shadow-[0_0_8px_rgba(255,0,127,0.2)]">
              <Sparkles size={18} />
            </div>
            <h4 className="font-black text-white text-base">Curated Selection</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-semibold">We handpick event hosts, local performers, and coordinators to guarantee unique experiences of the highest quality.</p>
          </div>
          <div className="space-y-2">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-[0_0_8px_rgba(0,240,255,0.2)]">
              <Ticket size={18} />
            </div>
            <h4 className="font-black text-white text-base">Instant Check-in</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-semibold">No paperwork, no printing. Your digital passes are stored securely inside your profile dashboard with unique, fast-scanning QR codes.</p>
          </div>
          <div className="space-y-2">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shadow-[0_0_8px_rgba(157,0,255,0.2)]">
              <Compass size={18} />
            </div>
            <h4 className="font-black text-white text-base">Community Connection</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-semibold">Participate in spontaneous gatherings, flashmobs, and outdoor activities to connect with like-minded community members around you.</p>
          </div>
        </section>

      </main>

      {/* Premium Minimal Dark Mode Footer */}
      <footer className="border-t border-white/5 bg-zinc-950/40 backdrop-blur-md py-12 relative z-10 text-[10px] font-semibold text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2 text-white font-black text-sm tracking-tighter">
            <span className="bg-gradient-to-tr from-pink-500 to-purple-650 p-1.5 rounded-lg text-white flex items-center justify-center shadow-[0_0_8px_rgba(255,0,127,0.3)]">
              <Sparkles size={12} className="fill-white" />
            </span>
            <span className="bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent font-black">FlashMob Connect</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/events" className="hover:text-pink-400 transition-colors">Find Events</Link>
            <Link href="/about" className="hover:text-pink-400 transition-colors">Our Guidelines</Link>
            <Link href="/dashboard" className="hover:text-pink-400 transition-colors">Host Console</Link>
            <a href="#" className="hover:text-pink-400 transition-colors">Privacy Policy</a>
          </div>

          <p>© 2026 FlashMob Connect. Designed with absolute visual premium aesthetics.</p>
        </div>
      </footer>

    </div>
  );
}
