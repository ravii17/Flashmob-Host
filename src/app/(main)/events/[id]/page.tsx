'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Spinner from '@/components/ui/Spinner';
import InteractiveMap from '@/components/ui/InteractiveMap';
import CommentsSection from '@/components/CommentsSection';
import {
  Calendar,
  MapPin,
  Users,
  Heart,
  Share2,
  Phone,
  ChevronLeft,
  ShieldCheck,
  Check,
  Flag,
  UserPlus,
  UserCheck,
  AlertTriangle,
  X,
  Eye,
} from 'lucide-react';

function InstagramIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EventDetailPage(props: PageProps) {
  const params = React.use(props.params);
  const eventId = params.id;

  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const [joinLoading, setJoinLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Report modal states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Safety concerns');
  const [reportDesc, setReportDesc] = useState('');
  const [reportLoading, setReportLoading] = useState(false);

  // Fetch event details
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}`);
      if (!res.ok) throw new Error('Event not found');
      return res.json();
    },
  });

  const event = data?.event;
  const hasBookmarked = data?.hasBookmarked || false;
  const hasLiked = data?.hasLiked || false;
  const joinStatus = data?.joinStatus || 'NONE'; // 'JOINED' | 'WAITLIST' | 'NONE'
  const isFollowingOrganizer = data?.isFollowingOrganizer || false;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center py-20 space-y-4 max-w-md mx-auto">
        <div className="h-16 w-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
          <ChevronLeft size={28} />
        </div>
        <h3 className="font-bold text-slate-800 text-lg">Event Not Found</h3>
        <p className="text-sm text-slate-500">
          The event you are looking for does not exist or has been removed by the organizer.
        </p>
        <button
          onClick={() => router.push('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
        >
          Back to feed
        </button>
      </div>
    );
  }

  const isOrganizer = user?.id === event.organizerId;

  const handleJoinToggle = async () => {
    if (!user) {
      toast.info('Please log in to join flashmobs!');
      router.push(`/login?redirect=/events/${event.id}`);
      return;
    }

    if (isOrganizer) {
      toast.info("You are the organizer of this event!");
      return;
    }

    setJoinLoading(true);
    try {
      const res = await fetch(`/api/events/${event.id}/join`, { method: 'POST' });
      const responseData = await res.json();

      if (res.ok) {
        if (responseData.status === 'WAITLIST') {
          toast.info('Added to the waitlist for this flashmob.');
        } else if (responseData.status === 'JOINED') {
          toast.success('Successfully joined the flashmob crew!');
        } else {
          toast.success('You left the flashmob crew.');
        }
        refetch();
      } else {
        toast.error(responseData.error || 'Failed to toggle join state');
      }
    } catch {
      toast.error('Connection error. Please try again.');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!user) {
      toast.info('Please log in to bookmark events!');
      router.push(`/login?redirect=/events/${event.id}`);
      return;
    }

    setBookmarkLoading(true);
    try {
      const res = await fetch(`/api/events/${event.id}/bookmark`, { method: 'POST' });
      const responseData = await res.json();

      if (res.ok) {
        toast.success(responseData.bookmarked ? 'Added to bookmarked events.' : 'Removed from bookmarked events.');
        refetch();
      } else {
        toast.error(responseData.error || 'Failed to toggle bookmark');
      }
    } catch {
      toast.error('Connection error. Please try again.');
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleLikeToggle = async () => {
    if (!user) {
      toast.info('Please log in to like events!');
      router.push(`/login?redirect=/events/${event.id}`);
      return;
    }

    setLikeLoading(true);
    try {
      const res = await fetch(`/api/events/${event.id}/like`, { method: 'POST' });
      const responseData = await res.json();

      if (res.ok) {
        toast.success(responseData.liked ? 'Liked this flashmob! ❤️' : 'Removed like.');
        refetch();
      } else {
        toast.error(responseData.error || 'Failed to toggle like');
      }
    } catch {
      toast.error('Connection error. Please try again.');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) {
      toast.info('Please log in to follow organizers!');
      router.push(`/login?redirect=/events/${event.id}`);
      return;
    }

    setFollowLoading(true);
    try {
      const res = await fetch(`/api/organizers/${event.organizerId}/follow`, { method: 'POST' });
      const responseData = await res.json();

      if (res.ok) {
        toast.success(
          responseData.followed
            ? `Now following ${event.organizer.name}!`
            : `Unfollowed ${event.organizer.name}.`
        );
        refetch();
      } else {
        toast.error(responseData.error || 'Failed to toggle follow status');
      }
    } catch {
      toast.error('Connection error. Please try again.');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportLoading(true);
    try {
      const res = await fetch(`/api/events/${event.id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reportReason, description: reportDesc }),
      });
      const responseData = await res.json();

      if (res.ok) {
        toast.success('Thank you. Report submitted for review.');
        setShowReportModal(false);
        setReportDesc('');
      } else {
        toast.error(responseData.error || 'Failed to submit report');
      }
    } catch {
      toast.error('Connection error. Please try again.');
    } finally {
      setReportLoading(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Event link copied to clipboard!');
    }
  };

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = new Date(event.date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const spotsRemaining =
    event.maxParticipants > 0 ? event.maxParticipants - event._count.participants : null;

  return (
    <div className="space-y-8 pb-16">
      {/* Back navigation */}
      <button
        onClick={() => router.push('/events')}
        className="flex items-center space-x-1.5 text-slate-500 hover:text-indigo-600 transition-colors font-semibold text-sm cursor-pointer"
      >
        <ChevronLeft size={16} />
        <span>Back to Events Feed</span>
      </button>

      {/* Hero Banner */}
      <div className="relative h-64 sm:h-96 w-full rounded-3xl overflow-hidden border border-slate-100 shadow-premium bg-slate-100">
        {event.image ? (
          <>
            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-6 sm:p-8">
              <div className="text-white space-y-2">
                <span className="bg-indigo-600 text-white text-[10px] sm:text-xs font-bold px-3.5 py-1.5 rounded-lg uppercase tracking-wider">
                  {event.category}
                </span>
                <h1 className="text-2xl sm:text-4xl font-black max-w-2xl leading-tight">
                  {event.title}
                </h1>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-indigo-600 via-sky-500 to-indigo-600 flex flex-col items-center justify-center text-white p-6">
            <span className="text-white bg-white/20 backdrop-blur-xs px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              {event.category}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-center max-w-2xl leading-tight">
              {event.title}
            </h1>
          </div>
        )}
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-premium space-y-6">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-tight">
              About the Event
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {event.description}
            </p>

            {/* Logistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-6">
              <div className="flex items-start space-x-3.5">
                <div className="h-10 w-10 bg-slate-50 border border-slate-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                  <Calendar size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date & Time</h4>
                  <p className="text-sm font-bold text-slate-700 leading-tight mt-0.5">{formattedDate}</p>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">Starts at {formattedTime}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="h-10 w-10 bg-slate-50 border border-slate-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</h4>
                  <p className="text-sm font-bold text-slate-700 leading-tight mt-0.5">{event.location}</p>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">{event.city}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Map view */}
          {event.latitude && event.longitude && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-lg px-2 flex items-center gap-2">
                <MapPin size={18} className="text-indigo-600" />
                Performance Spot Map
              </h3>
              <div className="h-72">
                <InteractiveMap
                  events={[
                    {
                      id: event.id,
                      title: event.title,
                      location: event.location,
                      city: event.city,
                      latitude: event.latitude,
                      longitude: event.longitude,
                      category: event.category,
                    },
                  ]}
                  center={[event.latitude, event.longitude]}
                  zoom={15}
                />
              </div>
            </div>
          )}

          {/* Actions Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 font-bold text-xs py-2.5 px-4 rounded-xl border border-slate-200 shadow-xs cursor-pointer transition-colors active:scale-95"
              >
                <Share2 size={14} />
                <span>Copy Share Link</span>
              </button>

              <button
                onClick={handleBookmarkToggle}
                disabled={bookmarkLoading}
                className={`flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 font-bold text-xs py-2.5 px-4 rounded-xl border border-slate-200 shadow-xs cursor-pointer transition-colors active:scale-95 ${
                  hasBookmarked ? 'text-indigo-600 border-indigo-100 bg-indigo-50/20' : ''
                }`}
              >
                <span>{hasBookmarked ? 'Bookmarked' : 'Add Bookmark'}</span>
              </button>

              <button
                onClick={handleLikeToggle}
                disabled={likeLoading}
                className={`flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-rose-600 font-bold text-xs py-2.5 px-4 rounded-xl border border-slate-200 shadow-xs cursor-pointer transition-colors active:scale-95 ${
                  hasLiked ? 'text-rose-600 border-rose-100 bg-rose-50/20' : ''
                }`}
              >
                <Heart size={14} className={hasLiked ? 'fill-rose-500 text-rose-500' : ''} />
                <span>{event._count.likes} Likes</span>
              </button>
            </div>

            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center space-x-1.5 text-xs font-bold text-slate-400 hover:text-rose-600 py-2.5 px-3 rounded-lg hover:bg-rose-50/50 transition-colors cursor-pointer"
            >
              <Flag size={13} />
              <span>Report</span>
            </button>
          </div>

          {/* Social Commenting Discussion Thread */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-premium">
            <CommentsSection eventId={event.id} currentUser={user} />
          </div>
        </div>

        {/* Sidebar Sticky Column */}
        <div className="space-y-6">
          {/* Join RSVP Card */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-premium space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-2xl font-black text-slate-800">
                  {event._count.participants}
                </span>
                <span className="text-xs font-semibold text-slate-400 pb-1">
                  joined {event.maxParticipants > 0 ? `out of ${event.maxParticipants}` : 'performers'}
                </span>
              </div>

              {/* Progress Bar */}
              {event.maxParticipants > 0 && (
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-sky-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        (event._count.participants / event.maxParticipants) * 100
                      )}%`,
                    }}
                  />
                </div>
              )}

              {spotsRemaining !== null && (
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex justify-between">
                  <span>
                    {spotsRemaining > 0 ? `${spotsRemaining} spots available` : 'Event is full!'}
                  </span>
                  {joinStatus === 'WAITLIST' && (
                    <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md font-extrabold normal-case">
                      You are on Waitlist ⏳
                    </span>
                  )}
                </p>
              )}
            </div>

            {isOrganizer ? (
              <div className="w-full flex items-center justify-center space-x-2 bg-slate-50 border border-slate-200 text-slate-500 py-3.5 rounded-xl text-sm font-semibold select-none">
                <ShieldCheck size={18} />
                <span>You are organizing this event</span>
              </div>
            ) : (
              <button
                onClick={handleJoinToggle}
                disabled={joinLoading}
                className={`w-full font-bold py-3.5 px-4 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer shadow-md flex items-center justify-center text-sm ${
                  joinStatus === 'JOINED'
                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 hover:text-emerald-800 shadow-emerald-500/5'
                    : joinStatus === 'WAITLIST'
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100 shadow-amber-500/5'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/10'
                }`}
              >
                {joinLoading ? (
                  <Spinner size="sm" className="border-t-white" />
                ) : joinStatus === 'JOINED' ? (
                  <span className="flex items-center space-x-1.5">
                    <Check size={16} />
                    <span>Joined Crew</span>
                  </span>
                ) : joinStatus === 'WAITLIST' ? (
                  <span className="flex items-center space-x-1.5">
                    <span>Leave Waitlist</span>
                  </span>
                ) : (
                  <span>Join Crew</span>
                )}
              </button>
            )}

            <div className="border-t border-slate-50 pt-4 flex flex-col space-y-3 text-xs font-semibold text-slate-500">
              <div className="flex items-center space-x-2.5 text-slate-400">
                <Users size={14} />
                <span>One-click join. Waitlist support.</span>
              </div>
            </div>
          </div>

          {/* Organizer Card */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-premium space-y-4">
            <h3 className="font-bold text-slate-800 text-sm tracking-tight border-b border-slate-50 pb-2">
              Organizer Host
            </h3>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {event.organizer.avatar ? (
                  <img
                    src={event.organizer.avatar}
                    alt={event.organizer.name}
                    className="h-10 w-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {event.organizer.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-slate-800 text-sm leading-snug">{event.organizer.name}</h4>
                  <p className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                    <span>{event.organizer._count?.followers || 0} followers</span>
                    {event.organizer.instagram && (
                      <a
                        href={`https://instagram.com/${event.organizer.instagram}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex text-indigo-500 hover:text-indigo-600 transition-colors"
                      >
                        <InstagramIcon className="h-3 w-3" />
                      </a>
                    )}
                  </p>
                </div>
              </div>

              {/* Follow Button */}
              {user && user.id !== event.organizerId && (
                <button
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={`text-xs font-bold py-1.5 px-3 rounded-lg border flex items-center gap-1 cursor-pointer transition-all ${
                    isFollowingOrganizer
                      ? 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-600'
                      : 'bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700'
                  }`}
                >
                  {isFollowingOrganizer ? (
                    <>
                      <UserCheck size={12} />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={12} />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100/50 space-y-2">
              <div className="flex items-start space-x-2 text-xs">
                <Phone size={13} className="text-slate-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-400 uppercase tracking-wide text-[9px]">Contact Link</p>
                  <a
                    href={event.organizerContact}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-indigo-600 hover:underline break-all"
                  >
                    {event.organizerContact}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Participant List */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-premium space-y-4">
            <h3 className="font-bold text-slate-800 text-sm tracking-tight border-b border-slate-50 pb-2 flex items-center justify-between">
              <span>Attendees Crew</span>
              <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-bold">
                {event.participants.filter((p: any) => p.status === 'JOINED').length}
              </span>
            </h3>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1 no-scrollbar">
              {event.participants
                .filter((p: any) => p.status === 'JOINED')
                .map((participant: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      {participant.user.avatar ? (
                        <img
                          src={participant.user.avatar}
                          alt={participant.user.name}
                          className="h-7 w-7 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-indigo-400 to-sky-300 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {participant.user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-xs font-semibold text-slate-700">{participant.user.name}</span>
                    </div>
                    {participant.userId === event.organizerId && (
                      <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                        Host
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-rose-600">
                <AlertTriangle size={18} />
                <h3 className="font-bold text-slate-800 text-base">Report Event</h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Reason for Reporting
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-slate-50 text-sm text-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none transition-all cursor-pointer font-semibold"
                >
                  <option value="Safety concerns">Safety concerns</option>
                  <option value="Inappropriate content">Inappropriate content</option>
                  <option value="Spam / Fake event">Spam / Fake event</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Additional Details
                </label>
                <textarea
                  rows={4}
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  placeholder="Provide additional details to help us investigate (optional)"
                  className="w-full bg-slate-50 text-sm text-slate-800 placeholder-slate-400 p-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none transition-all font-medium resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reportLoading}
                  className="text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-5 py-2.5 rounded-xl transition-all shadow-md shadow-rose-500/10 active:scale-95 cursor-pointer flex items-center justify-center"
                >
                  {reportLoading ? <Spinner size="sm" className="border-t-white" /> : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
