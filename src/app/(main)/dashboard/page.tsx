'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Spinner from '@/components/ui/Spinner';
import { Plus, Edit2, Trash2, Users, Calendar, MapPin, X, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [activeEventRoster, setActiveEventRoster] = useState<string | null>(null);
  
  // Edit modal states
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editMaxParticipants, setEditMaxParticipants] = useState('0');
  const [editImage, setEditImage] = useState('');
  const [editContact, setEditContact] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  // Protect route
  useEffect(() => {
    if (!loading && !user) {
      toast.info('Please log in to view the dashboard!');
      router.push('/login');
    }
  }, [user, loading, router, toast]);

  // Fetch organizer profile (contains created events)
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['profile-dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/profile');
      if (!res.ok) throw new Error('Failed to load dashboard data');
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

  const organizedEvents = data?.user?.events || [];

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to cancel and delete this flashmob? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Flashmob cancelled successfully.');
        refetch();
        if (activeEventRoster === eventId) setActiveEventRoster(null);
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Failed to cancel event');
      }
    } catch {
      toast.error('Connection error. Please try again.');
    }
  };

  const openEditModal = (event: any) => {
    setEditingEvent(event);
    setEditTitle(event.title);
    setEditDesc(event.description);
    setEditCategory(event.category);
    // Format date for datetime-local input
    const localDate = new Date(event.date);
    const offset = localDate.getTimezoneOffset();
    const adjustedDate = new Date(localDate.getTime() - offset * 60 * 1000);
    setEditDate(adjustedDate.toISOString().slice(0, 16));
    setEditLocation(event.location);
    setEditCity(event.city);
    setEditMaxParticipants(event.maxParticipants.toString());
    setEditImage(event.image || '');
    setEditContact(event.organizerContact);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    setSaveLoading(true);
    try {
      const res = await fetch(`/api/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          description: editDesc,
          category: editCategory,
          date: editDate,
          location: editLocation,
          city: editCity,
          maxParticipants: editMaxParticipants,
          image: editImage,
          organizerContact: editContact,
        }),
      });

      const responseData = await res.json();

      if (res.ok) {
        toast.success('Flashmob updated successfully!');
        setEditingEvent(null);
        refetch();
      } else {
        toast.error(responseData.error || 'Failed to update event');
      }
    } catch {
      toast.error('Connection error. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  const categories = ['Dance', 'Music', 'Social', 'Fitness', 'Celebration', 'Other'];

  return (
    <div className="space-y-8 pb-16">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Organizer Dashboard</h1>
          <p className="text-sm text-slate-500">Manage flashmobs you created and check attendee list coordinate details.</p>
        </div>
        <Link
          href="/events/create"
          className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 py-3 rounded-xl transition-all duration-200 active:scale-95 shadow-md shadow-blue-500/10 cursor-pointer"
        >
          <Plus size={16} />
          <span>Organize Flashmob</span>
        </Link>
      </div>

      {organizedEvents.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl p-8 shadow-premium space-y-4 max-w-md mx-auto">
          <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <Users size={28} />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">No Created Events</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            You haven&apos;t created any flashmob events yet. Launch your first event to mobilize your local community!
          </p>
          <Link
            href="/events/create"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
          >
            Create Flashmob
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List of events */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 px-2">Your Events ({organizedEvents.length})</h2>
            <div className="space-y-4">
              {organizedEvents.map((event: any) => {
                const isSelected = activeEventRoster === event.id;
                const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={event.id}
                    className={`bg-white border rounded-2xl p-5 shadow-premium transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                      isSelected ? 'border-blue-500 ring-2 ring-blue-50' : 'border-slate-100'
                    }`}
                  >
                    <div className="space-y-2 max-w-md">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                          {event.category}
                        </span>
                        <span className="flex items-center space-x-1 text-xs text-slate-400">
                          <Users size={12} />
                          <span>{event._count.participants} Joined</span>
                        </span>
                      </div>
                      <Link href={`/events/${event.id}`}>
                        <h3 className="font-bold text-slate-800 text-base hover:text-blue-600 transition-colors line-clamp-1">
                          {event.title}
                        </h3>
                      </Link>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center space-x-1 shrink-0">
                          <Calendar size={13} />
                          <span>{formattedDate}</span>
                        </span>
                        <span className="flex items-center space-x-1 truncate">
                          <MapPin size={13} />
                          <span className="truncate">{event.location}, {event.city}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end md:self-auto w-full md:w-auto justify-end border-t md:border-t-0 border-slate-50 pt-3 md:pt-0">
                      <button
                        onClick={() => setActiveEventRoster(isSelected ? null : event.id)}
                        className="text-xs font-bold px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        {isSelected ? 'Hide Roster' : 'View Roster'}
                      </button>
                      <button
                        onClick={() => openEditModal(event)}
                        className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all cursor-pointer"
                        title="Edit Flashmob"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                        title="Cancel Flashmob"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Attendee roster sidebar */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 px-2">Attendee Roster Details</h2>
            {activeEventRoster ? (
              (() => {
                const selectedEvent = organizedEvents.find((e: any) => e.id === activeEventRoster);
                if (!selectedEvent) return null;

                return (
                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-premium space-y-4 animate-scale-up">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm truncate leading-snug">
                        {selectedEvent.title}
                      </h3>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                        Attendee List ({selectedEvent.participants.length})
                      </p>
                    </div>

                    <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1 no-scrollbar border-t border-slate-50 pt-4">
                      {selectedEvent.participants.length === 0 ? (
                        <p className="text-xs text-slate-400 italic text-center py-4">No attendees have joined yet.</p>
                      ) : (
                        selectedEvent.participants.map((participant: any, index: number) => {
                          const joinDate = new Date(participant.joinedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          });

                          return (
                            <div key={index} className="flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-2.5">
                                {participant.user.avatar ? (
                                  <img
                                    src={participant.user.avatar}
                                    alt={participant.user.name}
                                    className="h-7 w-7 rounded-full object-cover shrink-0"
                                  />
                               ) : (
                                  <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-blue-400 to-sky-300 text-white flex items-center justify-center font-bold">
                                    {participant.user.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <span className="font-bold text-slate-700 block">{participant.user.name}</span>
                                  {participant.userId === selectedEvent.organizerId && (
                                    <span className="text-[8px] font-bold text-blue-600 bg-blue-50 px-1 py-0.2 rounded-sm uppercase tracking-wide">
                                      Organizer (You)
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className="text-slate-400 font-semibold">{joinDate}</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="border border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-400 text-sm py-12 bg-white/40">
                <Users size={24} className="mx-auto opacity-30 mb-2" />
                Select &quot;View Roster&quot; on an event to inspect its participant profiles.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inline Edit Event Modal overlay */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-xl w-full p-6 sm:p-8 shadow-premium space-y-6 animate-scale-up max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Modify Flashmob</h3>
                <p className="text-xs text-slate-400">Edit details for &quot;{editingEvent.title}&quot;</p>
              </div>
              <button
                onClick={() => setEditingEvent(null)}
                className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-100 hover:border-slate-200 focus:border-blue-500 focus:outline-hidden text-sm text-slate-800 transition-colors"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Description</label>
                <textarea
                  required
                  rows={4}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-100 hover:border-slate-200 focus:border-blue-500 focus:outline-hidden text-sm text-slate-800 transition-colors"
                />
              </div>

              {/* Category & Max Parts */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-100 hover:border-slate-200 focus:border-blue-500 focus:outline-hidden text-sm text-slate-800 bg-white transition-colors cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Max Performers</label>
                  <input
                    type="number"
                    min="0"
                    value={editMaxParticipants}
                    onChange={(e) => setEditMaxParticipants(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-100 hover:border-slate-200 focus:border-blue-500 focus:outline-hidden text-sm text-slate-800 transition-colors"
                  />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-100 hover:border-slate-200 focus:border-blue-500 focus:outline-hidden text-sm text-slate-800 transition-colors cursor-pointer"
                />
              </div>

              {/* Location & City */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">City</label>
                  <input
                    type="text"
                    required
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-100 hover:border-slate-200 focus:border-blue-500 focus:outline-hidden text-sm text-slate-800 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Exact Spot</label>
                  <input
                    type="text"
                    required
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-100 hover:border-slate-200 focus:border-blue-500 focus:outline-hidden text-sm text-slate-800 transition-colors"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Banner Image URL</label>
                <input
                  type="url"
                  value={editImage}
                  onChange={(e) => setEditImage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-100 hover:border-slate-200 focus:border-blue-500 focus:outline-hidden text-sm text-slate-800 transition-colors"
                />
              </div>

              {/* Contact */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Contact Info</label>
                <input
                  type="text"
                  required
                  value={editContact}
                  onChange={(e) => setEditContact(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-100 hover:border-slate-200 focus:border-blue-500 focus:outline-hidden text-sm text-slate-800 transition-colors"
                />
              </div>

              {/* Actions row */}
              <div className="flex space-x-2 pt-4 border-t border-slate-50 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-6 py-2 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer flex items-center justify-center min-w-[5.5rem]"
                >
                  {saveLoading ? <Spinner size="sm" className="border-t-white" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
