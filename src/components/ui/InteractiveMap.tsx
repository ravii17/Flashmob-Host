'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const MapContent = dynamic(() => import('./InteractiveMapContent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl p-6">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <p className="text-xs text-slate-400 mt-3 font-medium">Loading interactive map...</p>
    </div>
  ),
});

interface InteractiveMapProps {
  events: any[];
  center?: [number, number];
  zoom?: number;
  userLocation?: [number, number] | null;
}

export default function InteractiveMap(props: InteractiveMapProps) {
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-sm border border-slate-100 relative bg-slate-50 min-h-[300px]">
      <MapContent {...props} />
    </div>
  );
}
