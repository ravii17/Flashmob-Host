'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Spinner from '@/components/ui/Spinner';
import EventCard from '@/components/EventCard';
import { Sparkles, Calendar, Heart, Shield, Edit2, Check, UserPlus, Info } from 'lucide-react';

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

  // Protect route
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
    <div className="space-y-10 pb-16">
      {/* Profile Header Box */}
      <section className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-premium flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
          {/* Avatar */}
          <div className="relative">
            {avatarInput ? (
              <img
                src={avatarInput}
                alt={user.name}
                className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover ring-4 ring-blue-50"
              />
            ) : (
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-tr from-blue-500 to-sky-400 text-white flex items-center justify-center font-bold text-3xl ring-4 ring-blue-50">
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
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-sm text-slate-800 font-bold focus:outline-hidden focus:border-blue-500 w-full"
                  placeholder="Your Name"
                />
                <input
                  type="url"
                  value={avatarInput}
                  onChange={(e) => setAvatarInput(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-500 font-medium focus:outline-hidden focus:border-blue-500 w-full"
                  placeholder="Avatar Image URL (Optional)"
                />
                <input
                  type="text"
                  value={instagramInput}
                  onChange={(e) => setInstagramInput(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-500 font-medium focus:outline-hidden focus:border-blue-500 w-full"
                  placeholder="Instagram Username (Optional)"
                />
                <div className="flex items-center space-x-2 justify-center sm:justify-start">
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="flex items-center space-x-1 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
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
                    className="text-slate-500 hover:text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
                    {profileData?.name}
                  </h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
                    title="Edit profile"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
                <p className="text-sm text-slate-500 font-medium">{profileData?.email}</p>
                {profileData?.instagram && (
                  <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-xs text-slate-500 font-semibold mt-0.5">
                    <InstagramIcon size={13} className="text-slate-400" />
                    <a
                      href={`https://instagram.com/${profileData.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 transition-colors"
                    >
                      @{profileData.instagram}
                    </a>
                  </div>
                )}
                <div className="flex items-center justify-center sm:justify-start space-x-2 text-xs font-semibold text-slate-400">
                  <Calendar size={13} />
                  <span>Member since {formattedJoinDate}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Badge Stats */}
        <div className="flex space-x-4 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-8 justify-center w-full sm:w-auto">
          <div className="text-center">
            <span className="block text-2xl font-black text-slate-800">{joinedEvents.length}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Joined</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-black text-slate-800">{bookmarkedEvents.length}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Bookmarked</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-black text-slate-800">{organizedEvents.length}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Organized</span>
          </div>
        </div>
      </section>

      {/* Tabs selector */}
      <section className="space-y-6">
        <div className="border-b border-slate-100 flex space-x-6 text-sm font-semibold text-slate-500">
          <button
            onClick={() => setActiveTab('joined')}
            className={`pb-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'joined' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-700'
            }`}
          >
            Joined Events ({joinedEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`pb-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'bookmarks' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-700'
            }`}
          >
            Bookmarked ({bookmarkedEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('organized')}
            className={`pb-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'organized' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-700'
            }`}
          >
            Organized ({organizedEvents.length})
          </button>
        </div>

        {/* Tab contents */}
        {activeTab === 'joined' && (
          <div>
            {joinedEvents.length === 0 ? (
              <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-3xl p-6 text-slate-400">
                <UserPlus size={24} className="mx-auto opacity-35 mb-2" />
                <p className="text-sm font-semibold mb-1">You haven&apos;t joined any events yet.</p>
                <p className="text-xs text-slate-400">Find interesting flashmobs on the explorer feed and join them!</p>
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
              <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-3xl p-6 text-slate-400">
                <Heart size={24} className="mx-auto opacity-35 mb-2" />
                <p className="text-sm font-semibold mb-1">Your bookmark list is empty.</p>
                <p className="text-xs text-slate-400">Tap the heart icon on any card to save it here for later.</p>
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
              <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-3xl p-6 text-slate-400">
                <Shield size={24} className="mx-auto opacity-35 mb-2" />
                <p className="text-sm font-semibold mb-1">You haven&apos;t created any events.</p>
                <p className="text-xs text-slate-400">Be an organizer! Host dance freezes, choral groups or social gatherings.</p>
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
    </div>
  );
}
