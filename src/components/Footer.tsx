import React from 'react';
import Link from 'next/link';
import { Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-zinc-950/40 text-zinc-400 border-t border-white/5 backdrop-blur-md relative z-10">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Logo and Info */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center space-x-2 text-white font-bold text-lg">
              <span className="bg-gradient-to-tr from-pink-500 to-purple-650 p-1.5 rounded-lg text-white shadow-[0_0_8px_rgba(255,0,127,0.4)]">
                <Sparkles size={18} />
              </span>
              <span className="bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent font-black tracking-tight text-neon-pink">
                FlashMob
              </span>
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Discover and organize exciting flashmob events in your local area. Connect with your community through surprise public performances and shared live activities.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-black text-xs tracking-wider uppercase mb-4">Categories</h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/events?category=Dance" className="hover:text-pink-400 transition-colors font-medium">
                  Dance & Choreography
                </Link>
              </li>
              <li>
                <Link href="/events?category=Music" className="hover:text-pink-400 transition-colors font-medium">
                  Music & Choirs
                </Link>
              </li>
              <li>
                <Link href="/events?category=Social" className="hover:text-pink-400 transition-colors font-medium">
                  Social & Meetups
                </Link>
              </li>
              <li>
                <Link href="/events?category=Fitness" className="hover:text-pink-400 transition-colors font-medium">
                  Fitness & Sports
                </Link>
              </li>
              <li>
                <Link href="/events?category=Celebration" className="hover:text-pink-400 transition-colors font-medium">
                  Celebrations & Parades
                </Link>
              </li>
            </ul>
          </div>

          {/* Platforms */}
          <div>
            <h3 className="text-white font-black text-xs tracking-wider uppercase mb-4">Platform</h3>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <Link href="/events" className="hover:text-cyan-400 transition-colors font-medium">
                  Explore Events
                </Link>
              </li>
              <li>
                <Link href="/events/create" className="hover:text-cyan-400 transition-colors font-medium">
                  Create an Event
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-cyan-400 transition-colors font-medium">
                  Organizer Dashboard
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-cyan-400 transition-colors font-medium">
                  My Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Guidelines */}
          <div>
            <h3 className="text-white font-black text-xs tracking-wider uppercase mb-4">Guidelines & Safety</h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <span className="hover:text-purple-400 cursor-pointer transition-colors font-medium">Safety Rules</span>
              </li>
              <li>
                <span className="hover:text-purple-400 cursor-pointer transition-colors font-medium">Terms of Service</span>
              </li>
              <li>
                <span className="hover:text-purple-400 cursor-pointer transition-colors font-medium">Privacy Policy</span>
              </li>
              <li>
                <span className="hover:text-purple-400 cursor-pointer transition-colors font-medium">Community Standards</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-zinc-500">
          <p>&copy; {new Date().getFullYear()} FlashMob Connect. All rights reserved.</p>
          <p className="flex items-center space-x-1.5">
            <span>Made with</span>
            <Heart size={12} className="text-pink-500 fill-pink-500 animate-pulse" />
            <span>for communities worldwide.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

