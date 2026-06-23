import React from 'react';
import { Shield, Eye, Lock, MapPin, Bell, FileText, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | FlashMob Connect',
  description: 'Learn how FlashMob Connect protects your data, location metrics, and participant choices during surprise public assemblies and flashmobs.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-16 animate-fade-in relative z-10 text-zinc-300">
      {/* Page Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 bg-pink-500/10 border border-pink-500/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-pink-400 shadow-[0_0_10px_rgba(255,0,127,0.15)]">
          <Shield size={12} className="animate-pulse" />
          <span>Security & Consent</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white text-neon-pink tracking-tight uppercase">
          Privacy Policy
        </h1>
        <p className="text-xs text-zinc-400 font-semibold max-w-xl mx-auto">
          Last Updated: June 23, 2026. Learn how we handle location metrics, real-time alert data, and coordination parameters to keep you safe and the crowd surprised.
        </p>
      </div>

      {/* Main Glass Panel */}
      <section className="glass-premium rounded-3xl p-6 sm:p-10 shadow-premium border border-white/10 space-y-10">
        
        {/* Core philosophy */}
        <div className="flex gap-4 items-start border-b border-white/5 pb-8">
          <div className="p-3 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-2xl shrink-0 shadow-[0_0_10px_rgba(255,0,127,0.15)]">
            <Sparkles size={20} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-white uppercase tracking-tight">Our Privacy Philosophy</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
              FlashMob Connect was built to coordinate spontaneity while maintaining security and privacy. We believe surprise public performances are exciting, but user privacy and safety must never be compromised.
            </p>
          </div>
        </div>

        {/* Section 1: Information We Collect */}
        <div className="space-y-6">
          <h2 className="text-lg font-black text-white flex items-center gap-2 uppercase tracking-wide">
            <FileText size={18} className="text-pink-500" />
            <span>1. Information We Collect</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-2">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Lock size={14} className="text-[#00F0FF]" />
                <span>Account Registration Info</span>
              </h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-semibold">
                Your name, email address, password hash, profile avatar link, and optional social tags (e.g., Instagram username). These are used to customize your profile card and verify you inside event attendance logs.
              </p>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-2">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <MapPin size={14} className="text-[#39FF14]" />
                <span>Location Metrics & Proximity</span>
              </h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-semibold">
                To find events nearby, we query your device geolocation. Coordinates are calculated solely client-side to order the list, or optionally processed to match proximity ranges. We do not track your device background coordinates.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: How We Use Your Data */}
        <div className="space-y-6">
          <h2 className="text-lg font-black text-white flex items-center gap-2 uppercase tracking-wide">
            <Eye size={18} className="text-pink-500" />
            <span>2. How We Use Your Data</span>
          </h2>
          
          <div className="space-y-4">
            <div className="flex gap-3.5 items-start">
              <span className="h-5 w-5 bg-gradient-to-tr from-pink-500 to-purple-650 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
              <div>
                <h4 className="text-xs font-bold text-white">Event RSVP Logs & Attendance verification</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-semibold mt-0.5">
                  When you RSVP to a flashmob event, your profile avatar and name are shared with the organizer inside their dashboard roster list. This allows hosts to send you WhatsApp coordinate details or choreography instructions.
                </p>
              </div>
            </div>

            <div className="flex gap-3.5 items-start">
              <span className="h-5 w-5 bg-gradient-to-tr from-pink-500 to-purple-650 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
              <div>
                <h4 className="text-xs font-bold text-white">Real-Time Streams & Event Notifications</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-semibold mt-0.5">
                  We run SSE (Server-Sent Events) live notification channels. If you coordinate an event, you receive real-time notifications when users join your squad, bookmark a performance, or comment details.
                </p>
              </div>
            </div>

            <div className="flex gap-3.5 items-start">
              <span className="h-5 w-5 bg-gradient-to-tr from-pink-500 to-purple-650 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
              <div>
                <h4 className="text-xs font-bold text-white">Publicly Shared Performance Details</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-semibold mt-0.5">
                  Any flashmobs you publish (title, location city, descriptions, category, image links) are visible to anyone browsing the feed or command search palette (`⌘K`).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Data Security and Choices */}
        <div className="space-y-6">
          <h2 className="text-lg font-black text-white flex items-center gap-2 uppercase tracking-wide">
            <Shield size={18} className="text-pink-500" />
            <span>3. Data Security & Your Choices</span>
          </h2>
          
          <div className="space-y-4 text-xs font-semibold text-zinc-400 leading-relaxed">
            <p>
              We protect your registration details using server-side security, transport encryption protocols, and standard password hashing practices. 
            </p>
            <p>
              At any time, you can manage your preferences inside your profile tab:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>Toggle RSVPs to leave event rosters.</li>
              <li>Clear saved bookmarks.</li>
              <li>Edit your name, avatar image URL, or Instagram handle.</li>
              <li>Cancel or delete events you organized directly from your Organizer Dashboard.</li>
            </ul>
          </div>
        </div>

        {/* Contact info card inside modal */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-xs font-bold text-white flex items-center gap-1 justify-center sm:justify-start">
              <Bell size={13} className="text-[#00F0FF]" />
              <span>Questions or Concerns?</span>
            </h4>
            <p className="text-[10px] text-zinc-400 font-semibold leading-normal">
              If you have any feedback or requests regarding data removal, contact us at security@flashmobconnect.org.
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#00F0FF] bg-[#00F0FF]/10 border border-[#00F0FF]/20 px-3.5 py-2 rounded-xl shrink-0">
            Secure Platform
          </span>
        </div>

      </section>
    </div>
  );
}
