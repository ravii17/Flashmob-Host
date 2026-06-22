'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, LogOut, Menu, X, Bell, Check, Search, Calendar, MapPin, ChevronDown } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const toast = useToast();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAboutExpanded, setMobileAboutExpanded] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  // Reset mobile menu sub-sections when drawer is closed
  useEffect(() => {
    if (!mobileMenuOpen) {
      setMobileAboutExpanded(false);
    }
  }, [mobileMenuOpen]);

  // Command Palette states
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const avatarDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Explore Events', href: '/events' },
    { name: 'Create Event', href: '/events/create' },
    { name: 'My Events', href: '/dashboard' },
    { 
      name: 'About', 
      href: '/about',
      subLinks: [
        { name: 'For Performers', href: '/about?tab=you', description: 'Find secret events, practice choreography, and join the crowd.' },
        { name: 'For Hosts', href: '/about?tab=events', description: 'Organize a flashmob, access host guides, and read safety rules.' }
      ]
    },
  ];

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    if (path === '/events') return pathname === '/events';
    return pathname.startsWith(path);
  };

  // Shrink navbar and boost blur on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut listener for Command Palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close notifications dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close avatar dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (avatarDropdownRef.current && !avatarDropdownRef.current.contains(event.target as Node)) {
        setAvatarDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input on command palette open
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [searchOpen]);

  // Debounced search queries for Command Palette
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const handler = setTimeout(async () => {
      setLoadingSearch(true);
      try {
        const res = await fetch(`/api/events?search=${encodeURIComponent(searchQuery)}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.events || []);
        }
      } catch (err) {
        console.error('Search fetch failed:', err);
      } finally {
        setLoadingSearch(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch notifications and establish real-time SSE notification stream
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    // Load initial unread notifications
    async function loadNotifications() {
      try {
        const res = await fetch('/api/notifications?unread=true');
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications);
        }
      } catch (err) {
        console.error('Failed to load initial notifications:', err);
      }
    }

    loadNotifications();

    // Setup Server-Sent Events stream for real-time alerts
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/notifications/stream');

      eventSource.onmessage = (event) => {
        try {
          const newNotif = JSON.parse(event.data);
          if (newNotif && newNotif.id) {
            setNotifications((prev) => {
              // Avoid duplicate entries
              if (prev.some((n) => n.id === newNotif.id)) return prev;
              return [newNotif, ...prev];
            });

            // Display in-app toast for real-time notification
            toast.info(`${newNotif.title}: ${newNotif.message}`);
          }
        } catch (parseErr) {
          // Heartbeat or connection events are ignored
        }
      };

      eventSource.onerror = (err) => {
        console.warn('SSE stream encountered error, closing stream:', err);
        if (eventSource) eventSource.close();
      };
    } catch (err) {
      console.error('Failed to setup SSE Connection:', err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [user, toast]);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        setNotifications([]);
        toast.success('All notifications marked as read');
        setShowNotifications(false);
      } else {
        toast.error('Failed to update notifications');
      }
    } catch (err) {
      console.error(err);
      toast.error('Connection error');
    }
  };

  const handleMarkOneRead = async (id: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      Dance: '💃',
      Music: '🎤',
      Social: '🤝',
      Fitness: '🏃',
      Celebration: '🥳',
      Other: '✨',
    };
    return emojis[category] || '🌟';
  };

  const unreadCount = notifications.length;

  return (
    <>
      <div className="sticky top-0 z-50 w-full flex justify-center px-4 py-4 sm:px-6 lg:px-8 pointer-events-none transition-all duration-300">
        <motion.nav
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`pointer-events-auto flex items-center justify-between w-full max-w-6xl rounded-full border transition-all duration-300 ${
            isScrolled
              ? 'py-2.5 px-5 bg-zinc-950/60 backdrop-blur-xl border-white/10 shadow-[0_0_20px_rgba(255,0,127,0.15)] scale-[0.99]'
              : 'py-3.5 px-6 bg-zinc-950/80 backdrop-blur-md border-white/5 shadow-premium shadow-[0_0_15px_rgba(0,240,255,0.05)]'
          }`}
        >
          {/* Left: Brand logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 text-pink-500 font-bold text-lg tracking-tight transition-transform active:scale-95 group">
              <span className="bg-gradient-to-tr from-pink-500 to-purple-650 p-1.5 rounded-full text-white transition-transform group-hover:scale-105 duration-205 shadow-[0_0_10px_rgba(255,0,127,0.5)]">
                <Sparkles size={18} className="animate-pulse" />
              </span>
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent font-black tracking-tight hidden sm:inline text-neon-pink">
                FlashMob Connect
              </span>
            </Link>
          </div>

          {/* Center: Desktop Navigation links */}
          <div className="hidden md:flex items-center space-x-1 bg-white/5 p-1 rounded-full border border-white/5 z-20">
            {navLinks.map((link, idx) => {
              const active = isActive(link.href);
              const hasSubLinks = 'subLinks' in link;

              if (hasSubLinks) {
                return (
                  <div
                    key={link.href}
                    className="relative"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <Link
                      href={link.href}
                      className={`relative px-4 py-1.5 text-xs font-semibold rounded-full transition-colors duration-205 flex items-center gap-1 cursor-pointer ${
                        active ? 'text-pink-500 font-bold text-neon-pink' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {/* Sliding Hover Highlight */}
                      <AnimatePresence>
                        {hoveredIndex === idx && (
                          <motion.span
                            layoutId="navHoverHighlight"
                            className="absolute inset-0 bg-white/10 rounded-full -z-10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                          />
                        )}
                      </AnimatePresence>

                      {/* Active Page Indicator Underline/Bar */}
                      {active && (
                        <motion.span
                          layoutId="navActiveIndicator"
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-pink-500 rounded-full shadow-[0_0_8px_rgba(255,0,127,0.8)]"
                          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                        />
                      )}
                      <span>{link.name}</span>
                      <ChevronDown 
                        size={11} 
                        className={`transition-transform duration-200 ${
                          hoveredIndex === idx ? 'rotate-180 text-pink-500' : 'text-zinc-500'
                        }`} 
                      />
                    </Link>

                    {/* Desktop Hover Submenu Dropdown */}
                    <AnimatePresence>
                      {hoveredIndex === idx && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 rounded-2xl glass-premium border border-white/10 shadow-[0_0_35px_rgba(0,0,0,0.85)] p-2 z-[60] text-white flex flex-col gap-1 pointer-events-auto"
                        >
                          {link.subLinks?.map((sub) => (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              className="group/sub flex flex-col p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all text-left"
                            >
                              <span className="text-xs font-bold text-zinc-200 group-hover/sub:text-pink-500 transition-colors">
                                {sub.name}
                              </span>
                              <span className="text-[9px] text-zinc-500 leading-normal font-medium mt-0.5">
                                {sub.description}
                              </span>
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`relative px-4 py-1.5 text-xs font-semibold rounded-full transition-colors duration-205 cursor-pointer ${
                    active ? 'text-pink-500 font-bold text-neon-pink' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {/* Sliding Hover Highlight */}
                  <AnimatePresence>
                    {hoveredIndex === idx && (
                      <motion.span
                        layoutId="navHoverHighlight"
                        className="absolute inset-0 bg-white/10 rounded-full -z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Active Page Indicator Underline/Bar */}
                  {active && (
                    <motion.span
                      layoutId="navActiveIndicator"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-pink-500 rounded-full shadow-[0_0_8px_rgba(255,0,127,0.8)]"
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    />
                  )}
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-3">
            {/* Search KBD Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-full border border-white/5 transition-all text-xs font-bold cursor-pointer hover:border-pink-500/30"
              title="Search events (Ctrl+K)"
            >
              <Search size={13} />
              <span className="hidden lg:inline text-[11px]">Search</span>
              <kbd className="hidden sm:inline bg-zinc-900 px-1.5 py-0.5 rounded border border-white/10 text-[9px] text-zinc-500 font-mono shadow-3xs">
                ⌘K
              </kbd>
            </button>

            {/* Notification Bell Dropdown */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-zinc-400 hover:text-pink-500 hover:bg-white/5 rounded-full transition-all cursor-pointer relative"
                  title="Notifications"
                >
                  <Bell size={17} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Card */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                       initial={{ opacity: 0, scale: 0.95, y: 10 }}
                       animate={{ opacity: 1, scale: 1, y: 0 }}
                       exit={{ opacity: 0, scale: 0.95, y: 10 }}
                       transition={{ duration: 0.15 }}
                       className="absolute right-0 mt-2 w-80 rounded-2xl glass-premium border border-white/10 shadow-[0_0_35px_rgba(0,0,0,0.85)] p-4 space-y-3 z-[60] text-white"
                     >
                       <div className="flex items-center justify-between border-b border-white/10 pb-2">
                         <span className="text-xs font-black text-white uppercase tracking-wider">Alerts ({unreadCount})</span>
                         {unreadCount > 0 && (
                           <button
                             onClick={handleMarkAllRead}
                             className="text-[10px] font-bold text-pink-500 hover:underline cursor-pointer flex items-center gap-0.5"
                           >
                             <Check size={11} />
                             <span>Mark all read</span>
                           </button>
                         )}
                       </div>
 
                       <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 no-scrollbar">
                         {notifications.length > 0 ? (
                           notifications.map((n) => (
                             <div
                               key={n.id}
                               className="group p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex flex-col space-y-1 relative transition-colors"
                             >
                               <div className="flex items-start justify-between">
                                 <h5 className="text-[11px] font-bold text-white leading-snug">{n.title}</h5>
                                 <button
                                   onClick={() => handleMarkOneRead(n.id)}
                                   className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-pink-500 transition-opacity cursor-pointer p-0.5"
                                   title="Mark as read"
                                 >
                                   <Check size={11} />
                                 </button>
                               </div>
                               <p className="text-[10px] text-zinc-400 leading-normal font-medium">{n.message}</p>
                               <span className="text-[8px] text-zinc-500 font-semibold mt-1 self-end">
                                 {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </span>
                             </div>
                           ))
                         ) : (
                           <div className="text-center py-6">
                             <p className="text-xs text-zinc-500 font-medium">No unread notifications</p>
                           </div>
                         )}
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>
            )}

            {/* User Dropdown / Login Actions */}
            {user ? (
              <div className="relative" ref={avatarDropdownRef}>
                <button
                  onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}
                  className="flex items-center space-x-1.5 focus:outline-none focus:ring-0 group cursor-pointer"
                >
                  <div className="relative">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-8 w-8 rounded-full object-cover border border-slate-200 group-hover:border-blue-400 transition-all shadow-xs"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-650 text-white flex items-center justify-center font-bold text-xs border border-white/10 group-hover:border-pink-500 transition-all shadow-xs shadow-[0_0_8px_rgba(255,0,127,0.3)]">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {/* Pulsing online status indicator */}
                    <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white animate-pulse-subtle" />
                  </div>
                  <ChevronDown size={12} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                </button>

                {/* Avatar Dropdown Card */}
                <AnimatePresence>
                  {avatarDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2.5 w-56 rounded-2xl glass-premium border border-white/10 shadow-[0_0_35px_rgba(0,0,0,0.85)] p-2 space-y-1 z-[60] text-white"
                    >
                      <div className="px-3 py-2 border-b border-white/10 mb-1">
                        <p className="text-xs font-bold text-white">{user.name}</p>
                        <p className="text-[10px] text-zinc-400 truncate">{user.email || 'Member'}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setAvatarDropdownOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-pink-500 hover:bg-white/5 rounded-xl transition-all"
                      >
                        <span>My Dashboard</span>
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setAvatarDropdownOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-pink-500 hover:bg-white/5 rounded-xl transition-all"
                      >
                        <span>My Profile</span>
                      </Link>
                      {user.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          onClick={() => setAvatarDropdownOpen(false)}
                          className="flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          <span>Admin Console</span>
                        </Link>
                      )}
                      <div className="h-px bg-white/10 my-1" />
                      <button
                        onClick={() => {
                          setAvatarDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-left cursor-pointer"
                      >
                        <LogOut size={13} className="text-red-400" />
                        <span>Log Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  href="/login"
                  className="text-xs font-bold text-zinc-400 hover:text-pink-500 px-3.5 py-2 transition-colors duration-205"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="bg-gradient-to-r from-pink-500 to-purple-650 hover:from-pink-600 hover:to-purple-700 text-white font-black text-xs px-4.5 py-2 rounded-full transition-all duration-200 active:scale-95 shadow-[0_0_15px_rgba(255,0,127,0.3)] hover:shadow-[0_0_20px_rgba(255,0,127,0.5)]"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Hamburger toggle button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-zinc-400 hover:text-pink-500 bg-white/5 hover:bg-white/10 rounded-full transition-all cursor-pointer border border-white/5"
              >
                <Menu size={18} />
              </button>
            </div>
          </div>
        </motion.nav>
      </div>

      {/* Command Palette (⌘K) Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-start justify-center pt-[12vh] px-4 bg-black/75 backdrop-blur-md"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: -20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: -20, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.35 }}
              className="w-full max-w-lg rounded-3xl bg-zinc-950/80 backdrop-blur-2xl border border-white/10 shadow-[0_0_40px_rgba(255,0,127,0.15)] p-5 space-y-4 text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type="text"
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events, cities, or categories..."
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-zinc-900 text-sm font-semibold transition-all text-white placeholder-zinc-500"
                />
              </div>

              {/* Suggestions / Results */}
              <div className="space-y-2">
                {!searchQuery.trim() ? (
                  <>
                    <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-1">Popular Categories</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {['Dance', 'Music', 'Social', 'Fitness'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSearchQuery(cat)}
                          className="flex items-center space-x-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-pink-500/30 transition-all text-xs font-bold text-zinc-300 text-left cursor-pointer"
                        >
                          <span className="text-base">{getCategoryEmoji(cat)}</span>
                          <span>{cat} Events</span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : loadingSearch ? (
                  <div className="text-center py-8 text-xs font-semibold text-zinc-500">
                    Searching database...
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-1">Search Results</h5>
                    <div className="max-h-60 overflow-y-auto pr-1 no-scrollbar space-y-2">
                      {searchResults.map((event) => (
                        <Link
                          key={event.id}
                          href={`/events/${event.id}`}
                          onClick={() => setSearchOpen(false)}
                          className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-pink-500/30 transition-all group cursor-pointer"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{getCategoryEmoji(event.category)}</span>
                            <div>
                              <h4 className="text-xs font-bold text-white group-hover:text-pink-500 transition-colors">
                                {event.title}
                              </h4>
                              <p className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                                <MapPin size={9} />
                                <span>{event.city}</span>
                                <span>•</span>
                                <Calendar size={9} />
                                <span>{new Date(event.date).toLocaleDateString()}</span>
                              </p>
                            </div>
                          </div>
                          <span className="text-[9px] font-bold text-pink-500 bg-pink-500/10 px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            View
                          </span>
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-xs font-semibold text-zinc-500">
                    No results found for &ldquo;{searchQuery}&rdquo;
                  </div>
                )}
              </div>

              {/* Command Palette Hints */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[9px] text-zinc-500 font-medium font-mono">
                <span>Use keyboard controls</span>
                <span>ESC to close</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-zinc-950/95 backdrop-blur-xl flex flex-col justify-between p-6 text-white"
          >
            {/* Header inside drawer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-pink-500 font-bold text-lg">
                <span className="bg-gradient-to-tr from-pink-500 to-purple-650 p-1.5 rounded-full text-white">
                  <Sparkles size={16} />
                </span>
                <span className="bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent font-black tracking-tight">
                  FlashMob Connect
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Links inside drawer */}
            <div className="flex flex-col space-y-6 my-auto items-center w-full">
              {navLinks.map((link, idx) => {
                const hasSubLinks = 'subLinks' in link;

                if (hasSubLinks) {
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex flex-col items-center space-y-3 w-full"
                    >
                      <button
                        onClick={() => setMobileAboutExpanded(!mobileAboutExpanded)}
                        className="flex items-center gap-1.5 text-2xl font-black text-zinc-300 hover:text-pink-500 transition-colors cursor-pointer"
                      >
                        <span>{link.name}</span>
                        <ChevronDown 
                          size={18} 
                          className={`text-zinc-550 transition-transform duration-200 ${
                            mobileAboutExpanded ? 'rotate-180 text-pink-500' : ''
                          }`} 
                        />
                      </button>
                      
                      <AnimatePresence>
                        {mobileAboutExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="flex flex-col items-center space-y-3 pt-1 overflow-hidden"
                          >
                            <Link
                              href="/about"
                              onClick={() => setMobileMenuOpen(false)}
                              className="text-sm font-black text-zinc-450 hover:text-pink-500 transition-colors"
                            >
                              Overview
                            </Link>
                            {link.subLinks?.map((sub) => (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-sm font-black text-zinc-450 hover:text-pink-500 transition-colors"
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={link.href}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-2xl font-black text-zinc-300 hover:text-pink-500 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Actions / Info */}
            <div className="space-y-4">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSearchOpen(true);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-zinc-450 font-bold transition-all text-sm shadow-sm"
              >
                <Search size={15} />
                <span>Search events...</span>
              </button>

              {user ? (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-4 flex items-center justify-between">
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-3">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full object-cover border border-white/10" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-pink-500 to-purple-650 text-white flex items-center justify-center font-bold text-base">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-white text-sm">{user.name}</h4>
                      <p className="text-xs text-zinc-500">Active Account</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center space-x-1.5 text-red-400 text-xs font-bold bg-red-500/10 hover:bg-red-500/20 px-4 py-2 rounded-xl transition-all"
                  >
                    <LogOut size={14} />
                    <span>Log Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3.5 text-center text-zinc-350 font-bold bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all text-sm"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3.5 text-center text-white font-bold bg-gradient-to-r from-pink-500 to-purple-650 hover:from-pink-600 hover:to-purple-700 rounded-2xl transition-all text-sm shadow-[0_0_15px_rgba(255,0,127,0.35)]"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
