import React from 'react';
import Link from 'next/link';
import { Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Logo and Info */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center space-x-2 text-white font-bold text-lg">
              <span className="bg-blue-600 p-1.5 rounded-lg text-white">
                <Sparkles size={18} />
              </span>
              <span>FlashMob Connect</span>
            </Link>
            <p className="text-sm text-slate-400">
              Discover and organize exciting flashmob events in your local area. Connect with your community through surprise public performances and shared activities.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Categories</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/events?category=Dance" className="hover:text-white transition-colors">
                  Dance & Choreography
                </Link>
              </li>
              <li>
                <Link href="/events?category=Music" className="hover:text-white transition-colors">
                  Music & Choirs
                </Link>
              </li>
              <li>
                <Link href="/events?category=Social" className="hover:text-white transition-colors">
                  Social & Meetups
                </Link>
              </li>
              <li>
                <Link href="/events?category=Fitness" className="hover:text-white transition-colors">
                  Fitness & Sports
                </Link>
              </li>
              <li>
                <Link href="/events?category=Celebration" className="hover:text-white transition-colors">
                  Celebrations & Parades
                </Link>
              </li>
            </ul>
          </div>

          {/* Platforms */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Platform</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/events" className="hover:text-white transition-colors">
                  Explore Events
                </Link>
              </li>
              <li>
                <Link href="/events/create" className="hover:text-white transition-colors">
                  Create an Event
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Organizer Dashboard
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-white transition-colors">
                  My Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Guidelines */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Guidelines & Safety</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">Safety Rules</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">Community Standards</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} FlashMob Connect. All rights reserved.</p>
          <p className="flex items-center space-x-1.5">
            <span>Made with</span>
            <Heart size={12} className="text-rose-500 fill-rose-500 animate-pulse" />
            <span>for communities worldwide.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
