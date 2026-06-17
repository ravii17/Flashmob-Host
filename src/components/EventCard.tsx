'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Calendar, MapPin, Users, Heart, Sparkles, Check } from 'lucide-react';

export interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    category: string;
    date: string;
    location: string;
    city: string;
    maxParticipants: number;
    image: string | null;
    organizerId: string;
    _count: {
      participants: number;
    };
    participants: {
      userId: string;
      user: {
        name: string;
        avatar: string | null;
      };
    }[];
    bookmarks?: { userId: string }[];
    distance?: number | null;
  };
  onStateChange?: () => void;
}

export default function EventCard({ event, onStateChange }: EventCardProps) {
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const isOrganizer = user?.id === event.organizerId;
  const isJoinedInitially = event.participants.some((p) => p.userId === user?.id);
  const isBookmarkedInitially = event.bookmarks?.some((b) => b.userId === user?.id) || false;

  const [isJoined, setIsJoined] = useState(isJoinedInitially);
  const [isBookmarked, setIsBookmarked] = useState(isBookmarkedInitially);
  const [participantsCount, setParticipantsCount] = useState(event._count.participants);
  const [joinLoading, setJoinLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // Category Colors Map (neon/dark vibe)
  const categoryColors: Record<string, string> = {
    Dance: 'from-[#00F0FF] to-blue-500 text-[#00F0FF] bg-[#00F0FF]/10 border-[#00F0FF]/20',
    Music: 'from-[#FF007F] to-violet-500 text-[#FF007F] bg-[#FF007F]/10 border-[#FF007F]/20',
    Social: 'from-[#39FF14] to-emerald-500 text-[#39FF14] bg-[#39FF14]/10 border-[#39FF14]/20',
    Fitness: 'from-[#9D00FF] to-indigo-500 text-[#9D00FF] bg-[#9D00FF]/10 border-[#9D00FF]/20',
    Celebration: 'from-amber-400 to-orange-500 text-amber-400 bg-amber-400/10 border-amber-400/20',
    Other: 'from-zinc-400 to-zinc-500 text-zinc-300 bg-zinc-800/40 border-zinc-700/30',
  };

  const currentCategoryClass = categoryColors[event.category] || categoryColors.Other;

  const handleJoinToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.info('Please log in to join flashmobs!');
      router.push('/login');
      return;
    }

    if (isOrganizer) {
      toast.info("You're the organizer of this event!");
      return;
    }

    setJoinLoading(true);
    try {
      const res = await fetch(`/api/events/${event.id}/join`, { method: 'POST' });
      const data = await res.json();

      if (res.ok) {
        setIsJoined(data.joined);
        setParticipantsCount((prev) => (data.joined ? prev + 1 : prev - 1));
        toast.success(data.joined ? 'You joined the flashmob crew!' : 'You left the crew.');
        if (onStateChange) onStateChange();
      } else {
        toast.error(data.error || 'Failed to toggle join state');
      }
    } catch {
      toast.error('Connection error, please try again.');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.info('Please log in to bookmark events!');
      router.push('/login');
      return;
    }

    setBookmarkLoading(true);
    try {
      const res = await fetch(`/api/events/${event.id}/bookmark`, { method: 'POST' });
      const data = await res.json();

      if (res.ok) {
        setIsBookmarked(data.bookmarked);
        toast.success(data.bookmarked ? 'Added to bookmarked events.' : 'Removed from bookmarked events.');
        if (onStateChange) onStateChange();
      } else {
        toast.error(data.error || 'Failed to toggle bookmark');
      }
    } catch {
      toast.error('Connection error, please try again.');
    } finally {
      setBookmarkLoading(false);
    }
  };

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="group relative bg-zinc-950/40 backdrop-blur-md rounded-[24px] overflow-hidden border border-white/5 hover:border-pink-500/30 shadow-premium hover:shadow-[0_0_25px_rgba(255,0,127,0.15)] transition-all duration-300 flex flex-col h-full hover:-translate-y-1.5 z-10">
      {/* Holographic overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Event Image & Bookmark */}
      <Link href={`/events/${event.id}`} className="relative h-48 w-full block bg-zinc-900 overflow-hidden border-b border-white/5">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-zinc-900 to-zinc-950 text-zinc-650">
            <Sparkles size={32} className="opacity-40 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider">No banner image</span>
          </div>
        )}

        {/* Category Badge overlay */}
        <div className={`absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border border-white/10 shadow-sm text-white`}>
          {event.category}
        </div>

        {/* Bookmark heart toggle */}
        <button
          onClick={handleBookmarkToggle}
          disabled={bookmarkLoading}
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-zinc-950/80 backdrop-blur-md flex items-center justify-center text-zinc-400 hover:text-pink-500 border border-white/10 shadow-sm active:scale-90 transition-all cursor-pointer hover:border-pink-500/30"
        >
          <Heart
            size={14}
            className={`${isBookmarked ? 'text-pink-500 fill-pink-500 scale-110' : ''} transition-all duration-200`}
          />
        </button>

        {/* Pulsing Equalizer on Image Hover */}
        <div className="absolute bottom-3 right-3 bg-zinc-950/85 border border-white/10 backdrop-blur-md p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="eq-container">
            <div className="eq-bar" />
            <div className="eq-bar" />
            <div className="eq-bar" />
            <div className="eq-bar" />
          </div>
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex-1">
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-y-2 text-[10px] text-zinc-400 mb-2 gap-x-3 font-semibold">
            <span className="flex items-center space-x-1.5 shrink-0 bg-white/5 px-2 py-0.5 rounded">
              <Calendar size={11} className="text-pink-500" />
              <span>{formattedDate}</span>
            </span>
            <span className="flex items-center space-x-1.5 truncate bg-white/5 px-2 py-0.5 rounded">
              <MapPin size={11} className="text-cyan-400" />
              <span className="truncate">{event.city}</span>
            </span>
            {event.distance !== undefined && event.distance !== null && (
              <span className="text-[9px] font-black text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 rounded">
                {event.distance.toFixed(1)} km away
              </span>
            )}
          </div>

          {/* Title */}
          <Link href={`/events/${event.id}`}>
            <h3 className="font-black text-white text-base leading-snug group-hover:text-pink-500 transition-colors line-clamp-1 mb-2">
              {event.title}
            </h3>
          </Link>

          {/* Description Snippet */}
          <p className="text-zinc-400 text-xs line-clamp-2 mb-4 leading-relaxed font-medium">
            {event.description}
          </p>
        </div>

        {/* Bottom Actions Row */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
          {/* Joined Users Avatars */}
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-1.5 overflow-hidden">
              {event.participants.slice(0, 3).map((p, idx) => (
                <div key={idx} className="h-6 w-6 rounded-full border border-zinc-950 overflow-hidden shrink-0">
                  {p.user.avatar ? (
                    <img src={p.user.avatar} alt={p.user.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-tr from-pink-500 to-purple-650 text-white flex items-center justify-center text-[8px] font-bold">
                      {p.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <span className="text-[11px] font-semibold text-zinc-400 flex items-center space-x-1">
              <Users size={11} className="text-zinc-500 mr-0.5" />
              <span>
                {participantsCount}
                {event.maxParticipants > 0 && ` / ${event.maxParticipants}`}
              </span>
            </span>
          </div>

          {/* Action Join Button */}
          {isOrganizer ? (
            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 bg-white/5 border border-white/5 px-2.5 py-1.5 rounded-lg select-none">
              Organizing
            </span>
          ) : (
            <button
              onClick={handleJoinToggle}
              disabled={joinLoading}
              className={`text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer shadow-sm ${
                isJoined
                  ? 'bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20'
                  : 'bg-gradient-to-r from-pink-500 to-purple-650 hover:from-pink-600 hover:to-purple-700 text-white shadow-[0_0_12px_rgba(255,0,127,0.2)]'
              }`}
            >
              {joinLoading ? (
                <div className="h-3 w-10 flex items-center justify-center">
                  <div className="h-2.5 w-2.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : isJoined ? (
                <span className="flex items-center space-x-1">
                  <Check size={11} />
                  <span>Joined</span>
                </span>
              ) : (
                'Join'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
