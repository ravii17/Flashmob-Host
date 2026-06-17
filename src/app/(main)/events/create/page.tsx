'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Spinner from '@/components/ui/Spinner';
import { Sparkles, Calendar, MapPin, Users, Phone, FileText, Image as ImageIcon, Clipboard, ChevronLeft } from 'lucide-react';

export default function CreateEventPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Dance');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('0');
  const [image, setImage] = useState('');
  const [organizerContact, setOrganizerContact] = useState('');

  const [submitLoading, setSubmitLoading] = useState(false);

  // Protect the route
  useEffect(() => {
    if (!loading && !user) {
      toast.info('Please log in to create flashmobs!');
      router.push('/login');
    }
  }, [user, loading, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !category || !date || !location || !city || !organizerContact) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          date,
          location,
          city,
          maxParticipants: maxParticipants || '0',
          image,
          organizerContact,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Flashmob created successfully!');
        router.push(`/events/${data.event.id}`);
      } else {
        toast.error(data.error || 'Failed to create event');
        setSubmitLoading(false);
      }
    } catch {
      toast.error('Connection error. Please try again.');
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null; // Redirect logic is handling this
  }

  const categories = ['Dance', 'Music', 'Social', 'Fitness', 'Celebration', 'Other'];

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16 relative z-10">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center space-x-1.5 text-zinc-400 hover:text-pink-500 transition-colors font-bold text-xs cursor-pointer"
      >
        <ChevronLeft size={16} />
        <span>Cancel</span>
      </button>

      {/* Main Form Card */}
      <div className="bg-zinc-950/40 border border-white/5 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-premium space-y-8 animate-scale-up text-white">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 bg-pink-500/10 text-pink-500 border border-pink-500/20 rounded-xl flex items-center justify-center shadow-[0_0_12px_rgba(255,0,127,0.2)]">
            <Sparkles size={24} />
          </div>
          <h2 className="text-3xl font-black text-white text-neon-pink tracking-wide uppercase">Organize a Gig</h2>
          <p className="text-sm text-zinc-400">Coordinate a surprise local performance or social activity</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
              Event Title <span className="text-pink-500">*</span>
            </label>
            <div className="relative">
              <Clipboard className="absolute left-3 top-3 h-4.5 w-4.5 text-pink-500/70" />
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Frozen in Central Park, Bohemian Rhapsody Flash Choir"
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 focus:border-pink-500 focus:outline-hidden text-sm text-white placeholder-zinc-500 transition-all rounded-xl focus:shadow-[0_0_12px_rgba(255,0,127,0.25)] font-medium"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
              Description & Choreography Instructions <span className="text-pink-500">*</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3.5 h-4.5 w-4.5 text-pink-500/70" />
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what the flashmob is about. Include coordinates, choreographies, instructions on how to blend in, song list, clothing/colors to wear, and how to signal the start/end!"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 hover:border-white/20 focus:border-pink-500 focus:outline-hidden text-sm text-white placeholder-zinc-500 transition-all rounded-xl focus:shadow-[0_0_12px_rgba(255,0,127,0.25)] font-medium leading-relaxed resize-none"
              />
            </div>
          </div>

          {/* Category & Max Participants Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                Category <span className="text-pink-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-950 border border-white/10 hover:border-white/20 focus:border-pink-500 focus:outline-hidden text-sm text-white transition-all rounded-xl focus:shadow-[0_0_12px_rgba(255,0,127,0.25)] font-medium appearance-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-zinc-950 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Max Participants */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                Max Participants <span className="text-zinc-500 font-semibold">(0 for unlimited)</span>
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4.5 w-4.5 text-pink-500/70" />
                <input
                  type="number"
                  min="0"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 focus:border-pink-500 focus:outline-hidden text-sm text-white transition-all rounded-xl focus:shadow-[0_0_12px_rgba(255,0,127,0.25)] font-medium"
                />
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
              Date & Time <span className="text-pink-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4.5 w-4.5 text-pink-500/70" />
              <input
                type="datetime-local"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 focus:border-pink-500 focus:outline-hidden text-sm text-white transition-all rounded-xl focus:shadow-[0_0_12px_rgba(255,0,127,0.25)] font-medium cursor-pointer scheme-dark"
              />
            </div>
          </div>

          {/* City & Exact Location Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* City */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                City <span className="text-pink-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4.5 w-4.5 text-pink-500/70" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Chicago"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 focus:border-pink-500 focus:outline-hidden text-sm text-white placeholder-zinc-500 transition-all rounded-xl focus:shadow-[0_0_12px_rgba(255,0,127,0.25)] font-medium"
                />
              </div>
            </div>

            {/* Exact Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                Exact Location Spot <span className="text-pink-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4.5 w-4.5 text-pink-500/70" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Millennium Park, under the Cloud Gate"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 focus:border-pink-500 focus:outline-hidden text-sm text-white placeholder-zinc-500 transition-all rounded-xl focus:shadow-[0_0_12px_rgba(255,0,127,0.25)] font-medium"
                />
              </div>
            </div>
          </div>

          {/* Banner Image URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
              Event Banner Image URL <span className="text-zinc-500 font-semibold">(Optional)</span>
            </label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-3 h-4.5 w-4.5 text-pink-500/70" />
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="e.g. https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4"
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 focus:border-pink-500 focus:outline-hidden text-sm text-white placeholder-zinc-500 transition-all rounded-xl focus:shadow-[0_0_12px_rgba(255,0,127,0.25)] font-medium"
              />
            </div>
          </div>

          {/* Organizer Contact */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
              Organizer Contact Method <span className="text-pink-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4.5 w-4.5 text-pink-500/70" />
              <input
                type="text"
                required
                placeholder="e.g. WhatsApp group link, email@example.com, or phone number"
                value={organizerContact}
                onChange={(e) => setOrganizerContact(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 focus:border-pink-500 focus:outline-hidden text-sm text-white placeholder-zinc-500 transition-all rounded-xl focus:shadow-[0_0_12px_rgba(255,0,127,0.25)] font-medium"
              />
            </div>
            <p className="text-[10px] text-zinc-500 font-medium">
              Note: This contact information will be visible to users who join your event so they can align on details.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-650 hover:from-pink-650 hover:to-purple-700 text-white font-black uppercase tracking-wider py-3.5 px-4 rounded-xl transition-all duration-200 active:scale-95 shadow-[0_0_15px_rgba(255,0,127,0.3)] hover:shadow-[0_0_22px_rgba(255,0,127,0.5)] cursor-pointer flex items-center justify-center text-xs min-h-[3rem]"
          >
            {submitLoading ? <Spinner size="sm" className="border-t-white" /> : 'Launch Gig Event'}
          </button>
        </form>
      </div>
    </div>
  );
}
