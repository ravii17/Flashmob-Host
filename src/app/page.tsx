import React from 'react';
import Link from 'next/link';
import { Sparkles, Calendar, ShieldAlert, Award, Smile, ArrowRight, Activity, MapPin } from 'lucide-react';

export const metadata = {
  title: 'About FlashMob Connect | Coordinated Spontaneity',
  description: 'Learn about FlashMob Connect: how we bring communities together through spontaneous surprise public performances and social assemblies.',
};

export default function AboutPage() {
  return (
    <div id="about" className="space-y-16 py-6 pb-16 max-w-4xl mx-auto animate-fade-in">
      {/* Hero Header Section */}
      <section className="text-center space-y-6 pt-8">
        <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 border border-blue-100 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
          <Sparkles size={12} className="fill-blue-100 animate-pulse" />
          <span>Coordinated Spontaneity</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-800 tracking-tight leading-none">
          FlashMob Connect
        </h1>

        <p className="text-lg sm:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto font-medium">
          Bringing spontaneous art, dance, music, and joy to local public spaces. The coordination hub for surprise community actions.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/events"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-2xl transition-all duration-200 active:scale-95 shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer flex items-center space-x-1.5"
          >
            <span>Explore Events Feed</span>
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/events/create"
            className="bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 font-bold px-8 py-3.5 rounded-2xl transition-all duration-200 active:scale-95 border border-slate-200 shadow-sm cursor-pointer"
          >
            Organize a Flashmob
          </Link>
        </div>
      </section>

      {/* Concept Image Block */}
      <div className="relative h-64 sm:h-96 w-full rounded-3xl overflow-hidden border border-slate-100 shadow-premium bg-slate-100">
        <img
          src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800"
          alt="Surprise public crowd perform assembly"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent"></div>
      </div>

      {/* What is a Flashmob Section */}
      <section className="bg-white rounded-3xl border border-slate-100 p-8 sm:p-10 shadow-premium space-y-6">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center space-x-2">
          <Activity className="text-blue-600" />
          <span>What is a Flashmob?</span>
        </h2>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          A flashmob is a group of people who assemble suddenly in a public place, perform an unusual and seemingly pointless act for a brief time, then quickly disperse—often for the purposes of entertainment, satire, and artistic expression.
        </p>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Whether it is a frozen statue challenge, a spontaneous musical choir, a giant pillow fight, or synchronized dance choreographies, flashmobs disrupt the routine of daily life, leaving spectators and performers with a sense of child-like wonder.
        </p>
      </section>

      {/* Platform Features Grid */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight text-center">How We Facilitate Connections</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-premium space-y-3">
            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <Calendar size={18} />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Discovery & Coordination</h3>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              Find exactly when and where surprise meetups are happening in your city. Our categories help you filter by your talents—from synchronized dance routines to live vocal choruses.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-premium space-y-3">
            <div className="h-10 w-10 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center shrink-0">
              <Smile size={18} />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Secrecy & Security</h3>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              To keep the surprise element intact, detailed performance guidelines, sheet music, and direct coordinator contact methods are locked until you sign up and join the crowd list.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-premium space-y-3">
            <div className="h-10 w-10 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center shrink-0">
              <MapPin size={18} />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Unified Maps & Directions</h3>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              Every event contains visual markers and coordinates linked to Google Maps, ensuring everyone lands at the exact fountain, street block, or transit hall on time.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-premium space-y-3">
            <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
              <Award size={18} />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Community Host Tools</h3>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              Become a creator! Coordinate flashmobs using the organizer dashboard to modify instructions, manage the registered performer count, and track participants rosters.
            </p>
          </div>
        </div>
      </section>

      {/* Safety & Guidelines Block */}
      <section className="bg-amber-50/50 border border-amber-100 rounded-3xl p-8 shadow-sm space-y-4">
        <h3 className="font-black text-amber-800 text-lg flex items-center space-x-2">
          <ShieldAlert className="text-amber-600" />
          <span>Platform Performance Guidelines</span>
        </h3>
        <ul className="space-y-2.5 text-slate-600 text-xs sm:text-sm leading-relaxed list-disc list-inside">
          <li><strong>Stay Safe:</strong> Perform only in public settings that don&apos;t obstruct emergency exits, roads, or critical public services.</li>
          <li><strong>Consent & Respect:</strong> Never harass spectators. Flashmobs should spread laughter, not discomfort.</li>
          <li><strong>Leave No Trace:</strong> Ensure all props, clothing, or items (like pillow fight feathers) are completely cleaned up immediately after dispersing.</li>
          <li><strong>Have Fun:</strong> Blend back into the public crowd seamlessly. The magic is in the sudden transition from average spectator to performer, and back!</li>
        </ul>
      </section>
    </div>
  );
}
