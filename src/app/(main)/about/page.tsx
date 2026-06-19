import React, { Suspense } from 'react';
import AboutPageContent from '@/components/AboutPageContent';

export const metadata = {
  title: 'About FlashMob Connect | Coordinated Spontaneity',
  description: 'Learn about FlashMob Connect: how we bring communities together through spontaneous surprise public performances and social assemblies.',
};

export default function AboutPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 shadow-[0_0_10px_rgba(255,0,127,0.4)]"></div>
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest animate-pulse">Loading Curation Details...</p>
        </div>
      }
    >
      <AboutPageContent />
    </Suspense>
  );
}
