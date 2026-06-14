'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapEvent {
  id: string;
  title: string;
  location: string;
  city: string;
  latitude: number;
  longitude: number;
  category: string;
}

interface InteractiveMapProps {
  events: MapEvent[];
  center?: [number, number];
  zoom?: number;
  userLocation?: [number, number] | null;
}

export default function InteractiveMapContent({
  events,
  center = [40.7128, -74.0060], // Default NYC
  zoom = 13,
  userLocation,
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if it doesn't exist yet
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
      }).setView(center, zoom);

      // Use a clean, modern Voyager theme from CartoDB
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(mapRef.current);
    } else {
      // If map exists, pan to new center
      mapRef.current.setView(center, zoom);
    }

    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Create custom event marker icon
    const getEventIcon = (category: string) => {
      let colorClass = 'bg-indigo-600';
      let pingClass = 'bg-indigo-500';
      if (category === 'Dance') {
        colorClass = 'bg-pink-600';
        pingClass = 'bg-pink-500';
      } else if (category === 'Music') {
        colorClass = 'bg-amber-600';
        pingClass = 'bg-amber-500';
      } else if (category === 'Fitness') {
        colorClass = 'bg-emerald-600';
        pingClass = 'bg-emerald-500';
      } else if (category === 'Social') {
        colorClass = 'bg-blue-600';
        pingClass = 'bg-blue-500';
      } else if (category === 'Celebration') {
        colorClass = 'bg-purple-600';
        pingClass = 'bg-purple-500';
      }

      return L.divIcon({
        html: `
          <div class="relative flex items-center justify-center w-8 h-8">
            <span class="absolute inline-flex h-full w-full rounded-full ${pingClass} opacity-30 animate-ping"></span>
            <div class="relative flex items-center justify-center w-6 h-6 rounded-full ${colorClass} border-2 border-white shadow-md text-white font-bold text-[10px]">
              ${category[0]}
            </div>
          </div>
        `,
        className: 'custom-leaflet-event-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
    };

    // Add event markers
    events.forEach((evt) => {
      if (evt.latitude === null || evt.longitude === null) return;

      const marker = L.marker([evt.latitude, evt.longitude], {
        icon: getEventIcon(evt.category),
      });

      const popupContent = `
        <div class="p-2.5 font-sans text-slate-800 max-w-[200px]">
          <span class="inline-block text-[10px] uppercase font-bold text-indigo-600 mb-1 tracking-wider">${evt.category}</span>
          <h5 class="text-sm font-bold m-0 text-slate-900 leading-tight mb-1">${evt.title}</h5>
          <p class="text-[11px] text-slate-500 m-0 mb-2.5">${evt.location}, ${evt.city}</p>
          <a href="/events/${evt.id}" class="inline-block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] py-1.5 rounded-lg transition-colors no-underline">
            View Details
          </a>
        </div>
      `;

      marker.bindPopup(popupContent).addTo(map);
      markersRef.current.push(marker);
    });

    // Add user location marker if available
    if (userLocation && userLocation[0] !== 0 && userLocation[1] !== 0) {
      const userMarkerIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center w-8 h-8">
            <span class="absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-40 animate-ping"></span>
            <div class="w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-lg"></div>
          </div>
        `,
        className: 'custom-leaflet-user-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const userMarker = L.marker(userLocation, { icon: userMarkerIcon })
        .bindPopup('<div class="font-sans text-xs font-semibold p-1">You are here</div>')
        .addTo(map);
      markersRef.current.push(userMarker);
    }
  }, [events, center, zoom, userLocation]);

  // Clean up map instance on complete unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return <div ref={mapContainerRef} className="w-full h-full" />;
}
