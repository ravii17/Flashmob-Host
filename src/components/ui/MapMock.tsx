import React from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

interface MapMockProps {
  location: string;
  city: string;
}

export default function MapMock({ location, city }: MapMockProps) {
  const query = encodeURIComponent(`${location}, ${city}`);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

  return (
    <div className="relative w-full h-72 rounded-2xl overflow-hidden border border-slate-100 shadow-premium bg-slate-50">
      {/* Decorative Simulated Vector Map Grid */}
      <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      
      {/* Simulated Road Vectors */}
      <svg className="absolute inset-0 w-full h-full opacity-60 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 0,100 Q 150,90 300,180 T 600,100 T 900,120" fill="none" stroke="#e2e8f0" strokeWidth="24" />
        <path d="M 0,100 Q 150,90 300,180 T 600,100 T 900,120" fill="none" stroke="#ffffff" strokeWidth="12" />
        
        <path d="M 120,0 L 250,300" fill="none" stroke="#e2e8f0" strokeWidth="16" />
        <path d="M 120,0 L 250,300" fill="none" stroke="#ffffff" strokeWidth="8" />

        <path d="M 400,-10 L 350,310" fill="none" stroke="#e2e8f0" strokeWidth="20" />
        <path d="M 400,-10 L 350,310" fill="none" stroke="#ffffff" strokeWidth="10" />

        {/* Parks & River */}
        <rect x="50" y="20" width="100" height="60" rx="12" fill="#dcfce7" className="text-emerald-100" />
        <rect x="420" y="160" width="160" height="90" rx="16" fill="#dcfce7" />
        <path d="M 0,260 C 200,250 400,280 600,260 L 600,300 L 0,300 Z" fill="#e0f2fe" />
      </svg>

      {/* Floating Compass Rose Grid */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm p-2 rounded-xl shadow-md border border-slate-100 flex items-center justify-center text-slate-400">
        <Navigation size={16} className="transform rotate-45 text-blue-600 animate-pulse" />
      </div>

      {/* Exact Map Pin Indicator */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative flex items-center justify-center">
          {/* Ripple Ring */}
          <span className="absolute inline-flex h-12 w-12 rounded-full bg-blue-400 opacity-20 animate-ping"></span>
          <span className="absolute inline-flex h-6 w-6 rounded-full bg-blue-500 opacity-40 animate-pulse"></span>
          
          {/* Main Pin Container */}
          <div className="relative z-10 bg-blue-600 text-white p-2.5 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-transform duration-200 cursor-pointer flex items-center justify-center">
            <MapPin size={24} className="fill-blue-500/20" />
          </div>
        </div>
      </div>

      {/* Glassmorphic Address Card */}
      <div className="absolute bottom-4 left-4 right-4 glass p-4 rounded-xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5 max-w-xs sm:max-w-md">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Flashmob Location</p>
          <h4 className="text-sm font-bold text-slate-800 truncate">{location}</h4>
          <p className="text-xs text-slate-500">{city}</p>
        </div>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 font-semibold text-xs px-3.5 py-2 rounded-lg border border-slate-200 transition-all shadow-sm shrink-0"
        >
          <span>Open Directions</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}
