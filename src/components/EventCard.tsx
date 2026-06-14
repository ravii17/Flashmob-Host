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

  // Category Colors Map
  const categoryColors: Record<string, string> = {
    Dance: 'from-blue-500 to-sky-500 text-blue-600 bg-blue-50 border-blue-100',
    Music: 'from-violet-500 to-purple-500 text-violet-600 bg-violet-50 border-violet-100',
    Social: 'from-amber-500 to-orange-500 text-amber-600 bg-amber-50 border-amber-100',
    Fitness: 'from-emerald-500 to-teal-500 text-emerald-600 bg-emerald-50 border-emerald-100',
    Celebration: 'from-rose-500 to-pink-500 text-rose-600 bg-rose-50 border-rose-100',
    Other: 'from-slate-500 to-slate-600 text-slate-600 bg-slate-50 border-slate-100',
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
        toast.success(data.joined ? 'You joined the flashmob!' : 'You left the flashmob.');
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
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-slate-200 shadow-premium hover:shadow-premium-hover transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
      {/* Event Image & Bookmark */}
      <Link href={`/events/${event.id}`} className="relative h-48 w-full block bg-slate-100 overflow-hidden">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-slate-100 to-slate-50 text-slate-400">
            <Sparkles size={32} className="opacity-40 mb-1" />
            <span className="text-xs font-medium">No banner image</span>
          </div>
        )}

        {/* Category Badge overlay */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200/50 shadow-sm text-slate-800">
          {event.category}
        </div>

        {/* Bookmark heart toggle */}
        <button
          onClick={handleBookmarkToggle}
          disabled={bookmarkLoading}
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-slate-400 hover:text-rose-500 border border-slate-200/40 shadow-sm active:scale-90 transition-all cursor-pointer"
        >
          <Heart
            size={16}
            className={`${isBookmarked ? 'text-rose-500 fill-rose-500 scale-110' : ''} transition-all duration-200`}
          />
        </button>
      </Link>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex-1">
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-y-2 text-xs text-slate-500 mb-2 gap-x-3">
            <span className="flex items-center space-x-1.5 shrink-0">
              <Calendar size={13} className="text-slate-400" />
              <span>{formattedDate}</span>
            </span>
            <span className="flex items-center space-x-1.5 truncate">
              <MapPin size={13} className="text-slate-400" />
              <span className="truncate">{event.city}</span>
            </span>
            {event.distance !== undefined && event.distance !== null && (
              <span className="text-[10px] font-extrabold text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded-md shrink-0">
                {event.distance.toFixed(1)} km away
              </span>
            )}
          </div>

          {/* Title */}
          <Link href={`/events/${event.id}`}>
            <h3 className="font-bold text-slate-800 text-base leading-snug group-hover:text-blue-600 transition-colors line-clamp-1 mb-2">
              {event.title}
            </h3>
          </Link>

          {/* Description Snippet */}
          <p className="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Bottom Actions Row */}
        <div className="pt-4 border-t border-slate-50 flex items-center justify-between mt-auto">
          {/* Joined Users Avatars */}
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-1.5 overflow-hidden">
              {event.participants.slice(0, 3).map((p, idx) => (
                <div key={idx} className="h-6 w-6 rounded-full border border-white overflow-hidden shrink-0">
                  {p.user.avatar ? (
                    <img src={p.user.avatar} alt={p.user.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-tr from-blue-400 to-sky-300 text-white flex items-center justify-center text-[9px] font-bold">
                      {p.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-600 flex items-center space-x-1">
              <Users size={12} className="text-slate-400 mr-0.5" />
              <span>
                {participantsCount}
                {event.maxParticipants > 0 && ` / ${event.maxParticipants}`}
              </span>
            </span>
          </div>

          {/* Action Join Button */}
          {isOrganizer ? (
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 border border-slate-200/50 px-2.5 py-1.5 rounded-lg select-none">
              Organizing
            </span>
          ) : (
            <button
              onClick={handleJoinToggle}
              disabled={joinLoading}
              className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer shadow-sm ${
                isJoined
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 hover:text-emerald-800'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10 hover:shadow-md'
              }`}
            >
              {joinLoading ? (
                <div className="h-4 w-12 flex items-center justify-center">
                  <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : isJoined ? (
                <span className="flex items-center space-x-1">
                  <Check size={12} />
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
