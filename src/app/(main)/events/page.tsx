'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import EventCard from '@/components/EventCard';
import Spinner from '@/components/ui/Spinner';
import { useToast } from '@/context/ToastContext';
import { Search, MapPin, Calendar, Sparkles, Filter, Info, Compass } from 'lucide-react';

export default function EventsFeedPage() {
  const toast = useToast();

  const [cityFilter, setCityFilter] = useState('');
  const [debouncedCity, setDebouncedCity] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'tomorrow', 'week'
  const [sortType, setSortType] = useState('upcoming'); // 'upcoming', 'popular', 'nearby'

  // Geolocation states
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  // Pagination & List states
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Debounce city search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCity(cityFilter);
    }, 450);
    return () => clearTimeout(handler);
  }, [cityFilter]);

  // Handle Nearby Me activation
  const handleNearbySelect = () => {
    if (userCoords) {
      setSortType('nearby');
      return;
    }

    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      setSortType('upcoming');
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setSortType('nearby');
        setGeoLoading(false);
        toast.success('Location detected! Sorting by proximity.');
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Unable to retrieve location. Defaulting to upcoming feed.');
        setSortType('upcoming');
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // Fetch events function
  const loadEvents = async (pageNum: number, append: boolean) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      let url = `/api/events?category=${categoryFilter}&city=${debouncedCity}&date=${dateFilter}&type=${sortType}&page=${pageNum}&limit=6`;
      if (sortType === 'nearby' && userCoords) {
        url += `&lat=${userCoords.lat}&lng=${userCoords.lng}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (append) {
          setEventsList((prev) => [...prev, ...data.events]);
        } else {
          setEventsList(data.events);
        }
        setHasMore(data.hasMore);
      } else {
        toast.error('Failed to retrieve events feed');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Connection error fetching events');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Trigger reloading on filter or sorting change
  useEffect(() => {
    if (sortType === 'nearby' && !userCoords) return;
    setPage(1);
    loadEvents(1, false);
  }, [categoryFilter, debouncedCity, dateFilter, sortType, userCoords]);

  // Load next page
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadEvents(nextPage, true);
  };

  const categories = [
    { name: 'All', icon: '🌟' },
    { name: 'Dance', icon: '💃' },
    { name: 'Music', icon: '🎤' },
    { name: 'Social', icon: '🤝' },
    { name: 'Fitness', icon: '🏃' },
    { name: 'Celebration', icon: '🥳' },
    { name: 'Other', icon: '✨' },
  ];

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Explore Flashmobs</h1>
          <p className="text-sm text-slate-500">
            Discover and join surprise community events, dance freezes, and live street ensembles.
          </p>
        </div>

        {/* Sorting Switcher */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center self-start md:self-auto shrink-0 space-x-1">
          <button
            onClick={() => setSortType('upcoming')}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer ${
              sortType === 'upcoming' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setSortType('popular')}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer ${
              sortType === 'popular' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Most Popular
          </button>
          <button
            onClick={handleNearbySelect}
            disabled={geoLoading}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              sortType === 'nearby'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {geoLoading ? (
              <div className="h-3 w-3 border-2 border-indigo-650 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Compass size={12} className={sortType === 'nearby' ? 'text-indigo-600' : ''} />
            )}
            <span>Nearby Me</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex space-x-2.5 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setCategoryFilter(cat.name)}
            className={`flex items-center space-x-1.5 font-bold text-xs py-2.5 px-4 rounded-xl transition-all border shrink-0 active:scale-95 cursor-pointer shadow-xs ${
              categoryFilter === cat.name
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                : 'bg-white border-slate-100 hover:border-slate-200 text-slate-700'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Filters Form Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-premium">
        {/* City Input */}
        <div>
          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Search City</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. New York, Chicago"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-100 hover:border-slate-200 focus:border-indigo-500 focus:outline-none text-sm text-slate-800 transition-colors font-semibold placeholder-slate-400"
            />
          </div>
        </div>

        {/* Date Selector */}
        <div>
          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Date Range</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-100 hover:border-slate-200 focus:border-indigo-500 focus:outline-none text-sm text-slate-700 bg-slate-50 hover:bg-slate-100/70 cursor-pointer appearance-none font-semibold"
            >
              <option value="all">Any Date</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="week">This Week</option>
            </select>
          </div>
        </div>

        {/* Category Selector */}
        <div>
          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Category Select</label>
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-100 hover:border-slate-200 focus:border-indigo-500 focus:outline-none text-sm text-slate-700 bg-slate-50 hover:bg-slate-100/70 cursor-pointer appearance-none font-semibold"
            >
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Events Feed Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Spinner size="lg" />
          <p className="text-slate-500 text-sm font-semibold">Scanning community events...</p>
        </div>
      ) : eventsList.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl p-8 shadow-premium space-y-4 max-w-sm mx-auto">
          <div className="h-14 w-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
            <Info size={24} />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No Flashmobs Found</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            We couldn't find any flashmobs matching your criteria. Try adjusting your filters or host one!
          </p>
          <Link
            href="/events/create"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
          >
            Host a Flashmob
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {eventsList.map((event: any) => (
              <EventCard
                key={event.id}
                event={event}
                onStateChange={() => loadEvents(1, false)}
              />
            ))}
          </div>

          {/* Infinite Scroll Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 font-bold text-xs py-3 px-8 rounded-xl border border-slate-200 shadow-sm transition-all active:scale-95 cursor-pointer flex items-center space-x-2"
              >
                {loadingMore ? (
                  <Spinner size="sm" className="border-t-indigo-600" />
                ) : (
                  <span>Load More Flashmobs</span>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
