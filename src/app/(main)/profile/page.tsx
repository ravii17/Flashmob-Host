'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Spinner from '@/components/ui/Spinner';
import EventCard from '@/components/EventCard';
import { Sparkles, Calendar, Heart, Shield, Edit2, Check, UserPlus, Info, Plus, Sliders, ChevronRight } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

const InstagramIcon = ({ size = 18, className = '' }: { size?: number; className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'joined' | 'bookmarks' | 'organized'>('joined');

  // Edit Name state
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [avatarInput, setAvatarInput] = useState('');
  const [instagramInput, setInstagramInput] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  // Welcome modal state
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Protect route & check login status
  useEffect(() => {
    if (!loading && !user) {
      toast.info('Please log in to view your profile!');
      router.push('/login');
    } else if (user) {
      setNameInput(user.name);
      setAvatarInput(user.avatar || '');
      setInstagramInput(user.instagram || '');
    }
  }, [user, loading, router, toast]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const justLoggedIn = sessionStorage.getItem('justLoggedIn');
      if (justLoggedIn === 'true') {
        setShowWelcomeModal(true);
        sessionStorage.removeItem('justLoggedIn');
      }
    }
  }, []);

  // Fetch full user profile details (events organized, joined, bookmarked)
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['profile-details'],
    queryFn: async () => {
      const res = await fetch('/api/profile');
      if (!res.ok) throw new Error('Failed to fetch profile info');
      return res.json();
    },
    enabled: !!user,
  });

  if (loading || isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) return null;

  const profileData = data?.user;
  const organizedEvents = profileData?.events || [];
  const joinedEvents = profileData?.participants?.map((p: any) => p.event) || [];
  const bookmarkedEvents = profileData?.bookmarks?.map((b: any) => b.event) || [];

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput) {
      toast.error('Name cannot be empty');
      return;
    }

    setSaveLoading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameInput,
          avatar: avatarInput,
          instagram: instagramInput,
        }),
      });

      const responseData = await res.json();

      if (res.ok) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        await refreshUser();
        refetch();
      } else {
        toast.error(responseData.error || 'Failed to update profile');
      }
    } catch {
      toast.error('Connection error. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  const formattedJoinDate = new Date(profileData?.createdAt || new Date()).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-10 pb-16 relative">
      {/* Profile Header Box */}
      <section className="bg-zinc-950/40 border border-white/5 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-premium flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 text-white animate-fade-in">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
          {/* Avatar */}
          <div className="relative">
            {avatarInput ? (
              <img
                src={avatarInput}
                alt={user.name}
                className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover ring-4 ring-pink-500/20"
              />
            ) : (
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-tr from-pink-500 to-purple-650 text-white flex items-center justify-center font-bold text-3xl ring-4 ring-pink-500/20">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-3 max-w-xs sm:max-w-md">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white font-bold focus:outline-none focus:border-pink-500 w-full"
                  placeholder="Your Name"
                />
                <input
                  type="url"
                  value={avatarInput}
                  onChange={(e) => setAvatarInput(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-350 font-medium focus:outline-none focus:border-pink-500 w-full"
                  placeholder="Avatar Image URL (Optional)"
                />
                <input
                  type="text"
                  value={instagramInput}
                  onChange={(e) => setInstagramInput(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-350 font-medium focus:outline-none focus:border-pink-500 w-full"
                  placeholder="Instagram Username (Optional)"
                />
                <div className="flex items-center space-x-2 justify-center sm:justify-start">
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="flex items-center space-x-1 bg-gradient-to-r from-pink-500 to-purple-650 hover:from-pink-650 hover:to-purple-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm cursor-pointer"
                  >
                    {saveLoading ? <Spinner size="sm" className="border-t-white" /> : <Check size={12} />}
                    <span>{saveLoading ? '' : 'Save'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setNameInput(user.name);
                      setAvatarInput(user.avatar || '');
                      setInstagramInput(user.instagram || '');
                    }}
                    className="text-zinc-400 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <h1 className="text-2xl font-black text-white tracking-tight leading-none text-neon-pink">
                    {profileData?.name}
                  </h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-zinc-400 hover:text-pink-500 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                    title="Edit profile"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
                <p className="text-sm text-zinc-400 font-medium">{profileData?.email}</p>
                {profileData?.instagram && (
                  <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-xs text-zinc-400 font-semibold mt-0.5">
                    <InstagramIcon size={13} className="text-zinc-400" />
                    <a
                      href={`https://instagram.com/${profileData.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-pink-400 transition-colors"
                    >
                      @{profileData.instagram}
                    </a>
                  </div>
                )}
                <div className="flex items-center justify-center sm:justify-start space-x-2 text-xs font-semibold text-zinc-555">
                  <Calendar size={13} />
                  <span>Member since {formattedJoinDate}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Badge Stats */}
        <div className="flex space-x-4 border-t sm:border-t-0 sm:border-l border-white/5 pt-4 sm:pt-0 sm:pl-8 justify-center w-full sm:w-auto">
          <div className="text-center">
            <span className="block text-2xl font-black text-white text-neon-pink">{joinedEvents.length}</span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Joined</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-black text-white text-neon-pink">{bookmarkedEvents.length}</span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Bookmarked</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-black text-white text-neon-pink">{organizedEvents.length}</span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Organized</span>
          </div>
        </div>
      </section>

      {/* Host Hub & Quick Actions Widget */}
      <section className="bg-gradient-to-r from-zinc-950/50 via-zinc-950/20 to-zinc-950/50 border border-white/5 rounded-3xl p-6 shadow-premium relative overflow-hidden group">
        {/* Glowing visual indicators */}
        <div className="absolute top-[-50%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-[#FF007F]/5 blur-[70px] pointer-events-none" />
        <div className="absolute bottom-[-50%] left-[-10%] w-[30vw] h-[30vw] rounded-full bg-[#00F0FF]/5 blur-[70px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center space-x-1.5 bg-pink-500/10 border border-pink-500/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-pink-400 shadow-[0_0_8px_rgba(255,0,127,0.15)]">
              <Sparkles size={11} className="animate-pulse" />
              <span>Organizer Console</span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">Host & Manage Your Flashmobs</h2>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
              Bring people together and coordinate surprise public performances. Launch a new flashmob gig or open your organizer dashboard to manage attendees.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto shrink-0">
            <Link
              href="/events/create"
              className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-650 hover:from-pink-600 hover:to-purple-700 text-white font-black text-xs px-5 py-3.5 rounded-xl transition-all shadow-[0_0_12px_rgba(255,0,127,0.2)] active:scale-95 w-full sm:w-auto text-center justify-center cursor-pointer font-bold"
            >
              <span>Organize Flashmob</span>
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs px-5 py-3.5 rounded-xl transition-all active:scale-95 w-full sm:w-auto text-center justify-center cursor-pointer"
            >
              <span>My Organizer Dashboard</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Tabs selector */}
      <section className="space-y-6">
        <div className="border-b border-white/5 flex space-x-6 text-sm font-semibold text-zinc-450">
          <button
            onClick={() => setActiveTab('joined')}
            className={`pb-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'joined' ? 'border-pink-500 text-pink-500 text-neon-pink font-bold' : 'border-transparent hover:text-zinc-200'
            }`}
          >
            Joined Events ({joinedEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`pb-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'bookmarks' ? 'border-pink-500 text-pink-500 text-neon-pink font-bold' : 'border-transparent hover:text-zinc-200'
            }`}
          >
            Bookmarked ({bookmarkedEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('organized')}
            className={`pb-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'organized' ? 'border-pink-500 text-pink-500 text-neon-pink font-bold' : 'border-transparent hover:text-zinc-200'
            }`}
          >
            Organized ({organizedEvents.length})
          </button>
        </div>

        {/* Tab contents */}
        {activeTab === 'joined' && (
          <div>
            {joinedEvents.length === 0 ? (
              <div className="text-center py-16 bg-zinc-950/40 border border-dashed border-white/5 rounded-3xl p-6 text-zinc-400 shadow-premium">
                <UserPlus size={24} className="mx-auto text-pink-500/40 mb-2" />
                <p className="text-sm font-bold text-white mb-1">You haven&apos;t joined any events yet.</p>
                <p className="text-xs text-zinc-500">Find interesting flashmobs on the explorer feed and join them!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 animate-fade-in">
                {joinedEvents.map((event: any) => (
                  <EventCard key={event.id} event={event} onStateChange={refetch} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookmarks' && (
          <div>
            {bookmarkedEvents.length === 0 ? (
              <div className="text-center py-16 bg-zinc-950/40 border border-dashed border-white/5 rounded-3xl p-6 text-zinc-400 shadow-premium">
                <Heart size={24} className="mx-auto text-pink-500/40 mb-2" />
                <p className="text-sm font-bold text-white mb-1">Your bookmark list is empty.</p>
                <p className="text-xs text-zinc-500">Tap the heart icon on any card to save it here for later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 animate-fade-in">
                {bookmarkedEvents.map((event: any) => (
                  <EventCard key={event.id} event={event} onStateChange={refetch} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'organized' && (
          <div>
            {organizedEvents.length === 0 ? (
              <div className="text-center py-16 bg-zinc-950/40 border border-dashed border-white/5 rounded-3xl p-6 text-zinc-400 shadow-premium">
                <Shield size={24} className="mx-auto text-pink-500/40 mb-2" />
                <p className="text-sm font-bold text-white mb-1">You haven&apos;t created any events.</p>
                <p className="text-xs text-zinc-500">Be an organizer! Host dance freezes, choral groups or social gatherings.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 animate-fade-in">
                {organizedEvents.map((event: any) => (
                  <EventCard key={event.id} event={event} onStateChange={refetch} />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Welcome Login/Signup Dialog Modal overlay */}
      <AnimatePresence>
        {showWelcomeModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
            <div className="bg-zinc-950/90 border border-white/10 max-w-md w-full p-6 sm:p-8 rounded-[32px] shadow-[0_0_50px_rgba(255,0,127,0.15)] space-y-6 relative overflow-hidden text-white text-center animate-scale-up">
              {/* Concert lights inside modal */}
              <div className="absolute top-[-20%] left-[-20%] w-48 h-48 rounded-full bg-[#FF007F]/10 blur-[50px] pointer-events-none" />
              <div className="absolute bottom-[-20%] right-[-20%] w-48 h-48 rounded-full bg-[#00F0FF]/10 blur-[50px] pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div className="mx-auto h-14 w-14 bg-gradient-to-tr from-pink-500 to-purple-650 text-white border border-pink-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(255,0,127,0.3)]">
                  <Sparkles size={24} className="animate-pulse" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tight text-white text-neon-pink">
                    Welcome Back, {user.name}!
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                    You have successfully logged in. What would you like to do today?
                  </p>
                </div>
              </div>

              {/* Options lists */}
              <div className="relative z-10 space-y-3 pt-2">
                <Link
                  href="/events/create"
                  onClick={() => setShowWelcomeModal(false)}
                  className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 to-purple-650/10 border border-pink-500/20 hover:border-pink-500/40 transition-all text-left group cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-white group-hover:text-pink-400 transition-colors">
                      Host a New Flashmob
                    </span>
                    <span className="text-[10px] text-zinc-450 block font-medium leading-normal">
                      Create, set location details, and gather choreography dancers.
                    </span>
                  </div>
                  <span className="bg-pink-500 text-white p-1.5 rounded-full shrink-0 group-hover:translate-x-1 transition-transform">
                    <Plus size={12} />
                  </span>
                </Link>

                <Link
                  href="/dashboard"
                  onClick={() => setShowWelcomeModal(false)}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/15 transition-all text-left group cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-white group-hover:text-pink-400 transition-colors">
                      Manage My Gigs (Dashboard)
                    </span>
                    <span className="text-[10px] text-zinc-450 block font-medium leading-normal">
                      View attendee rosters, edit schedules, or cancel performances.
                    </span>
                  </div>
                  <span className="bg-white/10 text-white p-1.5 rounded-full shrink-0 group-hover:translate-x-1 transition-transform">
                    <Sliders size={12} />
                  </span>
                </Link>
              </div>

              <div className="relative z-10 pt-4 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={() => setShowWelcomeModal(false)}
                  className="text-xs font-bold text-zinc-500 hover:text-white transition-colors cursor-pointer"
                >
                  Skip & View Profile
                </button>
                <Link
                  href="/events"
                  onClick={() => setShowWelcomeModal(false)}
                  className="text-xs font-black text-pink-500 hover:text-pink-400 hover:underline transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Explore Live Gigs</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
