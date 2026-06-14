'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Sparkles, Plus, LogOut, Menu, X, Bell, ShieldAlert, Check } from 'lucide-react';

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
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { name: 'Explore Events', href: '/events' },
    ...(user
      ? [
          { name: 'Dashboard', href: '/dashboard' },
          { name: 'Profile', href: '/profile' },
        ]
      : []),
    ...(user?.role === 'ADMIN' ? [{ name: 'Moderation', href: '/admin' }] : []),
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') return false;
    return pathname.startsWith(path);
  };

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

  const unreadCount = notifications.length;

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-slate-100 shadow-premium">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 text-indigo-600 font-bold text-xl tracking-tight transition-transform active:scale-95">
              <span className="bg-indigo-650 p-1.5 rounded-lg text-white">
                <Sparkles size={20} className="animate-pulse" />
              </span>
              <span className="bg-gradient-to-r from-indigo-600 via-sky-500 to-violet-500 bg-clip-text text-transparent font-extrabold">
                FlashMob Connect
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold transition-colors hover:text-indigo-600 ${
                  isActive(link.href) ? 'text-indigo-600 font-extrabold' : 'text-slate-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* User Area / Bell / Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  href="/events/create"
                  className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-95 shadow-md shadow-indigo-500/10 hover:shadow-lg hover:shadow-indigo-500/20"
                >
                  <Plus size={16} />
                  <span>Create Flashmob</span>
                </Link>

                {/* Notifications Bell Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer relative"
                    title="Notifications"
                  >
                    <Bell size={19} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white animate-scale-up">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Card */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-100 shadow-2xl p-4 space-y-3 animate-scale-up">
                      <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                        <span className="text-xs font-black text-slate-800">Alerts Logs ({unreadCount})</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer flex items-center gap-0.5"
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
                              className="group p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/20 border border-slate-100/50 flex flex-col space-y-1 relative"
                            >
                              <div className="flex items-start justify-between">
                                <h5 className="text-[11px] font-bold text-slate-800 leading-snug">{n.title}</h5>
                                <button
                                  onClick={() => handleMarkOneRead(n.id)}
                                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 transition-opacity cursor-pointer p-0.5"
                                  title="Mark as read"
                                >
                                  <Check size={11} />
                                </button>
                              </div>
                              <p className="text-[10px] text-slate-500 leading-normal font-medium">{n.message}</p>
                              <span className="text-[8px] text-slate-400 font-semibold mt-1 self-end">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-xs text-slate-400 font-medium">No unread notifications</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
                  <Link href="/profile" className="flex items-center space-x-2 group">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-indigo-100 transition-all"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 text-white flex items-center justify-center font-bold text-sm ring-2 ring-slate-100 group-hover:ring-indigo-100 transition-all">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">
                      {user.name.split(' ')[0]}
                    </span>
                  </Link>

                  <button
                    onClick={logout}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                    title="Log Out"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-sm font-semibold text-slate-600 hover:text-indigo-600 px-3 py-2 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-95 shadow-md shadow-indigo-500/10"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-650 hover:text-indigo-600 p-2 rounded-lg transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden animate-fade-in border-t border-slate-100 bg-white">
          <div className="space-y-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl text-base font-semibold transition-colors ${
                  isActive(link.href)
                    ? 'bg-indigo-50 text-indigo-600 font-extrabold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {user ? (
              <div className="border-t border-slate-100 pt-3 mt-3 space-y-2">
                <Link
                  href="/events/create"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center space-x-2 bg-indigo-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-md"
                >
                  <Plus size={18} />
                  <span>Create Flashmob</span>
                </Link>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl mt-2">
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2"
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 text-white flex items-center justify-center font-semibold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-semibold text-slate-800 text-sm">{user.name}</span>
                  </Link>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center space-x-1 text-red-500 text-sm hover:underline cursor-pointer"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t border-slate-100 pt-3 mt-3 flex flex-col space-y-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center text-slate-705 font-semibold py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center bg-indigo-600 text-white font-bold py-2.5 rounded-xl shadow-md hover:bg-indigo-700 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
