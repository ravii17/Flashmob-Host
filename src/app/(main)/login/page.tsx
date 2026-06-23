'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Sparkles, Mail, Lock, AlertCircle } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';

export default function LoginPage() {
  const { user, login, loading } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push('/profile');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setSubmitLoading(true);
    setError('');

    const res = await login(email, password);
    if (res.success) {
      toast.success('Welcome back!');
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('justLoggedIn', 'true');
      }
      router.push('/profile');
    } else {
      setError(res.error || 'Invalid email or password');
      toast.error(res.error || 'Failed to login');
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

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-premium animate-scale-up">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Sparkles size={24} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Welcome Back</h2>
          <p className="text-sm text-slate-500">Sign in to your account to join local flashmobs</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center space-x-2 bg-rose-50 border border-rose-100 text-rose-800 text-sm p-3.5 rounded-xl">
            <AlertCircle size={18} className="text-rose-500 shrink-0" />
            <span className="font-semibold leading-none">{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-100 hover:border-slate-200 focus:border-blue-500 focus:outline-hidden text-sm text-slate-800 transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-100 hover:border-slate-200 focus:border-blue-500 focus:outline-hidden text-sm text-slate-800 transition-colors"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 active:scale-95 shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer flex items-center justify-center min-h-[2.75rem]"
          >
            {submitLoading ? <Spinner size="sm" className="border-t-white" /> : 'Sign In'}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center text-sm pt-4 border-t border-slate-50">
          <span className="text-slate-400 font-semibold">New to FlashMob Connect?</span>{' '}
          <Link href="/signup" className="text-blue-600 hover:underline font-bold transition-all">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
