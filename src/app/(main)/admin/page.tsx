'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Spinner from '@/components/ui/Spinner';
import {
  Users as UsersIcon,
  Calendar,
  AlertTriangle,
  Eye,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  Trash2,
  Check,
  TrendingUp,
  BarChart2,
  ExternalLink,
} from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalEvents: number;
  pendingReports: number;
  totalViews: number;
}

interface CategoryStat {
  name: string;
  value: number;
}

interface Report {
  id: string;
  reason: string;
  description: string | null;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  event: {
    id: string;
    title: string;
    location: string;
    city: string;
    deletedAt: string | null;
  } | null;
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  instagram: string | null;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'stats' | 'reports' | 'users'>('stats');
  const [stats, setStats] = useState<Stats | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Security: check role
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      toast.error('Access Denied. Admins only.');
      router.push('/');
    }
  }, [user, authLoading, router, toast]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, reportsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/reports'),
        fetch('/api/admin/users'),
      ]);

      if (statsRes.ok && reportsRes.ok && usersRes.ok) {
        const statsData = await statsRes.json();
        const reportsData = await reportsRes.json();
        const usersData = await usersRes.json();

        setStats(statsData.stats);
        setCategoryStats(statsData.categoriesStats);
        setReports(reportsData.reports);
        setUsers(usersData.users);
      } else {
        toast.error('Failed to load administration data');
      }
    } catch (err) {
      console.error('Admin dashboard error:', err);
      toast.error('Connection error loading data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchData();
    }
  }, [user]);

  const handleResolveReport = async (reportId: string) => {
    setActionLoading(reportId);
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, status: 'RESOLVED' }),
      });
      if (res.ok) {
        toast.success('Report marked as resolved');
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, status: 'RESOLVED' } : r))
        );
        // Refresh stats counter
        if (stats) setStats({ ...stats, pendingReports: Math.max(0, stats.pendingReports - 1) });
      } else {
        toast.error('Failed to resolve report');
      }
    } catch {
      toast.error('Connection error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteEvent = async (eventId: string, reportId: string) => {
    setActionLoading(`delete-event-${eventId}`);
    try {
      // DELETE method on events route
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Event soft-deleted successfully');
        // Also resolve the report
        await fetch('/api/admin/reports', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reportId, status: 'RESOLVED' }),
        });
        
        setReports((prev) =>
          prev.map((r) =>
            r.id === reportId
              ? {
                  ...r,
                  status: 'RESOLVED',
                  event: r.event ? { ...r.event, deletedAt: new Date().toISOString() } : null,
                }
              : r
          )
        );
        // Refresh counts
        if (stats) {
          setStats({
            ...stats,
            totalEvents: Math.max(0, stats.totalEvents - 1),
            pendingReports: Math.max(0, stats.pendingReports - 1),
          });
        }
      } else {
        const d = await res.json();
        toast.error(d.error || 'Failed to delete event');
      }
    } catch {
      toast.error('Connection error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    setActionLoading(`role-${userId}`);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        toast.success(`User role updated to ${newRole}`);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update role');
      }
    } catch {
      toast.error('Connection error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspendUser = async (userId: string) => {
    if (!confirm('Are you sure you want to suspend this user? This will soft-delete their account.')) {
      return;
    }
    setActionLoading(`suspend-${userId}`);
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('User account suspended');
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        if (stats) setStats({ ...stats, totalUsers: Math.max(0, stats.totalUsers - 1) });
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to suspend user');
      }
    } catch {
      toast.error('Connection error');
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none flex items-center gap-2">
            <ShieldAlert className="text-indigo-600" size={28} />
            Moderation Control Suite
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-2">
            Oversee events, moderate user reports, and manage platform staff roles.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 px-4 py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer shadow-sm shrink-0 active:scale-95"
        >
          Force Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 gap-6">
        <button
          onClick={() => setActiveTab('stats')}
          className={`pb-3 font-bold text-sm tracking-tight border-b-2 cursor-pointer transition-all ${
            activeTab === 'stats'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Platform Analytics
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 font-bold text-sm tracking-tight border-b-2 cursor-pointer transition-all flex items-center gap-1.5 ${
            activeTab === 'reports'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <span>User Reports</span>
          {stats && stats.pendingReports > 0 && (
            <span className="text-[10px] font-bold text-white bg-rose-500 px-1.5 py-0.5 rounded-full">
              {stats.pendingReports}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 font-bold text-sm tracking-tight border-b-2 cursor-pointer transition-all ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Staff & User Manager
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-8 animate-fade-in">
          {/* Metrics cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-premium flex items-center space-x-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <UsersIcon size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total Users</p>
                <h3 className="text-2xl font-black text-slate-800 leading-none mt-1">{stats.totalUsers}</h3>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-premium flex items-center space-x-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Calendar size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total Events</p>
                <h3 className="text-2xl font-black text-slate-800 leading-none mt-1">{stats.totalEvents}</h3>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-premium flex items-center space-x-4">
              <div className="h-12 w-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Active Reports</p>
                <h3 className="text-2xl font-black text-slate-800 leading-none mt-1">{stats.pendingReports}</h3>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-premium flex items-center space-x-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Eye size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Page Views</p>
                <h3 className="text-2xl font-black text-slate-800 leading-none mt-1">{stats.totalViews}</h3>
              </div>
            </div>
          </div>

          {/* Charts Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Category popularity */}
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-premium space-y-5">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-50">
                <BarChart2 size={18} className="text-indigo-600" />
                <h3 className="text-base font-bold text-slate-800">Event Categories Popularity</h3>
              </div>

              <div className="space-y-4">
                {categoryStats.length > 0 ? (
                  categoryStats.map((cat) => {
                    const maxVal = Math.max(...categoryStats.map((c) => c.value), 1);
                    const percentage = (cat.value / maxVal) * 100;
                    return (
                      <div key={cat.name} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-600">
                          <span>{cat.name}</span>
                          <span className="font-bold">{cat.value} events</span>
                        </div>
                        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 text-center py-8">No category data available</p>
                )}
              </div>
            </div>

            {/* Growth info */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-premium space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-50">
                <TrendingUp size={18} className="text-indigo-600" />
                <h3 className="text-base font-bold text-slate-800">Growth Index</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Platform interaction parameters are trending upwards. Encourage users to share WhatsApp links or follow organizers.
              </p>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Conversion Ratio</p>
                <p className="text-3xl font-black text-indigo-600">92.4%</p>
                <p className="text-[10px] font-semibold text-emerald-600">▲ +4.2% this week</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6 animate-fade-in">
          {reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className={`bg-white border rounded-3xl p-6 shadow-premium transition-all relative ${
                    report.status === 'RESOLVED' ? 'border-emerald-100 bg-emerald-50/5' : 'border-slate-100'
                  }`}
                >
                  {report.status === 'RESOLVED' && (
                    <span className="absolute top-6 right-6 flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      <Check size={10} />
                      <span>Resolved</span>
                    </span>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-3">
                      <div className="flex items-center space-x-2">
                        <span className="bg-rose-50 text-rose-600 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border border-rose-100">
                          {report.reason}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          Reported on {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Offending Event</p>
                        {report.event ? (
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-black text-slate-800 leading-snug">
                              {report.event.title}
                            </h4>
                            <span className="text-xs text-slate-500 font-medium">
                              ({report.event.location}, {report.event.city})
                            </span>
                            {report.event.deletedAt ? (
                              <span className="text-[9px] font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                                Soft-deleted
                              </span>
                            ) : (
                              <a
                                href={`/events/${report.event.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-500 hover:text-indigo-600 transition-colors shrink-0"
                              >
                                <ExternalLink size={13} />
                              </a>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-rose-500 font-bold">Event already hard deleted</p>
                        )}
                      </div>

                      {report.description && (
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Reporter Details</p>
                          <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100/60 max-w-xl">
                            "{report.description}"
                          </p>
                        </div>
                      )}

                      <div className="text-[10px] text-slate-400 font-semibold">
                        Submitted by: {report.user.name} ({report.user.email})
                      </div>
                    </div>

                    <div className="flex flex-col justify-center gap-2 md:items-end">
                      {report.status === 'PENDING' && (
                        <>
                          {report.event && !report.event.deletedAt && (
                            <button
                              onClick={() => handleDeleteEvent(report.event!.id, report.id)}
                              disabled={actionLoading !== null}
                              className="text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-4 py-2.5 rounded-xl transition-all shadow-md shadow-rose-500/5 active:scale-95 cursor-pointer flex items-center justify-center space-x-1"
                            >
                              <Trash2 size={13} />
                              <span>Delete Event & Resolve</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleResolveReport(report.id)}
                            disabled={actionLoading !== null}
                            className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center space-x-1"
                          >
                            <Check size={13} />
                            <span>Mark Resolved (Keep Event)</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-50 border border-slate-100 rounded-3xl">
              <ShieldCheck className="text-indigo-500 mx-auto opacity-70 mb-3" size={32} />
              <h4 className="font-bold text-slate-700 text-sm">No Pending Reports</h4>
              <p className="text-xs text-slate-400 mt-1">Everything is clean! No events are flagged.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white border border-slate-100 rounded-3xl shadow-premium overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Instagram</th>
                  <th className="px-6 py-4">Joined At</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* User profile */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {u.avatar ? (
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="h-8 w-8 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm leading-none">{u.name}</h4>
                          <span className="text-[11px] text-slate-400 font-semibold">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role badge */}
                    <td className="px-6 py-4">
                      <span
                        className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-50 text-purple-700 border border-purple-100'
                            : 'bg-slate-50 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    {/* Instagram */}
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                      {u.instagram ? `@${u.instagram}` : 'Not Linked'}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-xs font-semibold text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      {user.id !== u.id && (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleUpdateRole(u.id, u.role)}
                            disabled={actionLoading !== null}
                            title="Toggle user/admin role"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <UserCheck size={14} />
                          </button>
                          <button
                            onClick={() => handleSuspendUser(u.id)}
                            disabled={actionLoading !== null}
                            title="Suspend user account"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <UserX size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
