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
    <div className="space-y-8 pb-16 relative z-10 text-white">
      {/* Back navigation */}
      <button
        onClick={() => router.push('/events')}
        className="flex items-center space-x-1.5 text-zinc-400 hover:text-pink-500 transition-colors font-bold text-xs cursor-pointer"
      >
        <ChevronLeft size={16} />
        <span>Back to Gigs Feed</span>
      </button>

      {/* Hero Banner */}
      <div className="relative h-64 sm:h-96 w-full rounded-[24px] overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)] bg-zinc-950">
        {event.image ? (
          <>
            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent flex items-end p-6 sm:p-8">
              <div className="text-white space-y-2">
                <span className="bg-gradient-to-r from-pink-500 to-purple-650 text-white text-[10px] font-black px-3.5 py-1.5 rounded-lg uppercase tracking-widest shadow-[0_0_10px_rgba(255,0,127,0.3)]">
                  {event.category}
                </span>
                <h1 className="text-2xl sm:text-4xl font-black max-w-2xl leading-tight text-white text-neon-pink">
                  {event.title}
                </h1>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-pink-600 via-purple-650 to-cyan-600 flex flex-col items-center justify-center text-white p-6">
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
          <div className="bg-zinc-950/40 backdrop-blur-md rounded-[24px] border border-white/5 p-6 sm:p-8 shadow-premium text-white space-y-6 relative">
            
            {/* Ticket stub dotted lines and barcode */}
            <div className="absolute right-6 top-6 hidden md:flex flex-col items-center space-y-1 opacity-20 pointer-events-none">
              <div className="text-[9px] tracking-[6px] font-mono text-white">VIP-PASS</div>
              <div className="h-12 w-28 bg-[repeating-linear-gradient(90deg,white,white_2px,transparent_2px,transparent_6px)]" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white text-neon-pink tracking-wide uppercase">
              About the Gig
            </h1>
            <p className="text-zinc-350 text-sm sm:text-base leading-relaxed whitespace-pre-line font-medium">
              {event.description}
            </p>

            {/* Logistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-6">
              <div className="flex items-start space-x-3.5">
                <div className="h-10 w-10 bg-white/5 border border-white/5 text-pink-500 rounded-xl flex items-center justify-center shrink-0">
                  <Calendar size={18} />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Date & Time</h4>
                  <p className="text-sm font-bold text-white leading-tight mt-0.5">{formattedDate}</p>
                  <p className="text-xs font-semibold text-zinc-455 mt-0.5">Starts at {formattedTime}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="h-10 w-10 bg-white/5 border border-white/5 text-pink-500 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Location</h4>
                  <p className="text-sm font-bold text-white leading-tight mt-0.5">{event.location}</p>
                  <p className="text-xs font-semibold text-zinc-455 mt-0.5">{event.city}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Map view */}
          {event.latitude && event.longitude && (
            <div className="space-y-4">
              <h3 className="font-black text-white text-base px-2 flex items-center gap-2 uppercase tracking-wide">
                <MapPin size={18} className="text-pink-500" />
                Performance Spot Map
              </h3>
              <div className="h-72 rounded-[24px] overflow-hidden border border-white/5">
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
          <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-950/40 backdrop-blur-md p-4 rounded-2xl border border-white/5">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 text-white hover:text-pink-500 font-bold text-xs py-2.5 px-4 rounded-xl border border-white/10 hover:border-pink-500/30 shadow-xs cursor-pointer transition-colors active:scale-95"
              >
                <Share2 size={14} />
                <span>Copy Share Link</span>
              </button>

              <button
                onClick={handleBookmarkToggle}
                disabled={bookmarkLoading}
                className={`flex items-center space-x-2 bg-white/5 hover:bg-white/10 text-white hover:text-pink-500 font-bold text-xs py-2.5 px-4 rounded-xl border border-white/10 hover:border-pink-500/30 shadow-xs cursor-pointer transition-colors active:scale-95 ${
                  hasBookmarked ? 'text-pink-500 border-pink-500/20 bg-pink-500/10' : ''
                }`}
              >
                <span>{hasBookmarked ? 'Bookmarked' : 'Add Bookmark'}</span>
              </button>

              <button
                onClick={handleLikeToggle}
                disabled={likeLoading}
                className={`flex items-center space-x-2 bg-white/5 hover:bg-white/10 text-white hover:text-rose-500 font-bold text-xs py-2.5 px-4 rounded-xl border border-white/10 hover:border-pink-500/30 shadow-xs cursor-pointer transition-colors active:scale-95 ${
                  hasLiked ? 'text-pink-500 border-pink-500/20 bg-pink-500/10' : ''
                }`}
              >
                <Heart size={14} className={hasLiked ? 'fill-pink-500 text-pink-500' : ''} />
                <span>{event._count.likes} Likes</span>
              </button>
            </div>

            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center space-x-1.5 text-xs font-bold text-zinc-500 hover:text-rose-500 py-2.5 px-3 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <Flag size={13} />
              <span>Report</span>
            </button>
          </div>

          {/* Social Commenting Discussion Thread */}
          <div className="bg-zinc-950/40 backdrop-blur-md rounded-[24px] border border-white/5 p-6 sm:p-8 shadow-premium text-white">
            <CommentsSection eventId={event.id} currentUser={user} organizerId={event.organizerId} />
          </div>
        </div>

        {/* Sidebar Sticky Column */}
        <div className="space-y-6">
          {/* Join RSVP Card */}
          <div className="bg-zinc-950/40 backdrop-blur-md rounded-[24px] border border-white/5 p-6 shadow-premium space-y-6 text-white">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-2xl font-black text-white text-neon-pink">
                  {event._count.participants}
                </span>
                <span className="text-[11px] font-semibold text-zinc-450 pb-1">
                  joined {event.maxParticipants > 0 ? `out of ${event.maxParticipants}` : 'performers'}
                </span>
              </div>

              {/* Progress Bar */}
              {event.maxParticipants > 0 && (
                <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-cyan-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(255,0,127,0.4)]"
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
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide flex justify-between">
                  <span>
                    {spotsRemaining > 0 ? `${spotsRemaining} spots available` : 'Event is full!'}
                  </span>
                  {joinStatus === 'WAITLIST' && (
                    <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md font-extrabold normal-case">
                      On Waitlist ⏳
                    </span>
                  )}
                </p>
              )}
            </div>

            {isOrganizer ? (
              <div className="w-full flex items-center justify-center space-x-2 bg-white/5 border border-white/5 text-zinc-400 py-3.5 rounded-xl text-sm font-semibold select-none">
                <ShieldCheck size={18} />
                <span>You are organizing this gig</span>
              </div>
            ) : (
              <button
                onClick={handleJoinToggle}
                disabled={joinLoading}
                className={`w-full font-black uppercase tracking-wider py-3.5 px-4 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer shadow-md flex items-center justify-center text-xs ${
                  joinStatus === 'JOINED'
                    ? 'bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                    : joinStatus === 'WAITLIST'
                    ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20'
                    : 'bg-gradient-to-r from-pink-500 to-purple-650 hover:from-pink-650 hover:to-purple-700 text-white shadow-[0_0_15px_rgba(255,0,127,0.3)] hover:shadow-[0_0_22px_rgba(255,0,127,0.5)]'
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
                  <span>Join Vibe Crew</span>
                )}
              </button>
            )}

            <div className="border-t border-white/5 pt-4 flex flex-col space-y-3 text-xs font-semibold text-zinc-500">
              <div className="flex items-center space-x-2.5 text-zinc-500">
                <Users size={14} />
                <span>One-click join. Waitlist support.</span>
              </div>
            </div>
          </div>

          {/* Organizer Card */}
          <div className="bg-zinc-950/40 backdrop-blur-md rounded-[24px] border border-white/5 p-6 shadow-premium space-y-4 text-white">
            <h3 className="font-bold text-white text-xs tracking-wider uppercase border-b border-white/5 pb-2">
              Gig Host
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
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-pink-500 to-purple-650 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {event.organizer.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-white text-sm leading-snug">{event.organizer.name}</h4>
                  <p className="text-[10px] font-semibold text-zinc-400 flex items-center gap-1">
                    <span>{event.organizer._count?.followers || 0} followers</span>
                    {event.organizer.instagram && (
                      <a
                        href={`https://instagram.com/${event.organizer.instagram}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex text-pink-400 hover:text-pink-300 transition-colors"
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
                      ? 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white'
                      : 'bg-pink-500/10 border-pink-500/20 text-pink-400 hover:bg-pink-500/20 hover:text-pink-300'
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

            <div className="bg-white/5 rounded-xl p-3.5 border border-white/5 space-y-2">
              <div className="flex items-start space-x-2 text-xs">
                <Phone size={13} className="text-zinc-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-zinc-500 uppercase tracking-wide text-[9px]">Contact Link</p>
                  <a
                    href={event.organizerContact}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-cyan-400 hover:underline break-all"
                  >
                    {event.organizerContact}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Participant List */}
          <div className="bg-zinc-950/40 backdrop-blur-md rounded-[24px] border border-white/5 p-6 shadow-premium space-y-4 text-white">
            <h3 className="font-bold text-white text-xs tracking-wider uppercase border-b border-white/5 pb-2 flex items-center justify-between">
              <span>Vibe Crew list</span>
              <span className="text-xs text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2.5 py-0.5 rounded-md font-bold">
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
                        <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-pink-500 to-purple-650 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {participant.user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-xs font-semibold text-zinc-300">{participant.user.name}</span>
                    </div>
                    {participant.userId === event.organizerId && (
                      <span className="text-[9px] font-bold text-pink-400 bg-pink-500/10 border border-pink-500/20 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-zinc-950 w-full max-w-md rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden animate-scale-up text-white">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center space-x-2 text-rose-500">
                <AlertTriangle size={18} />
                <h3 className="font-bold text-white text-base">Report Event</h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-zinc-400 hover:text-white hover:bg-white/5 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  Reason for Reporting
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-white/5 text-sm text-white px-4 py-2.5 rounded-xl border border-white/10 focus:border-pink-500 focus:outline-none transition-all cursor-pointer font-semibold"
                >
                  <option value="Safety concerns">Safety concerns</option>
                  <option value="Inappropriate content">Inappropriate content</option>
                  <option value="Spam / Fake event">Spam / Fake event</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  Additional Details
                </label>
                <textarea
                  rows={4}
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  placeholder="Provide additional details to help us investigate (optional)"
                  className="w-full bg-white/5 text-sm text-white placeholder-zinc-500 p-4 rounded-xl border border-white/10 focus:border-pink-500 focus:outline-none transition-all font-medium resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="text-xs font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl transition-all cursor-pointer"
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
