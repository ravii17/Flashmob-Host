import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen bg-[#030306] text-white selection:bg-pink-500 selection:text-white relative overflow-hidden">
      {/* Concert Ambient Stage Lights */}
      <div className="absolute top-[-20%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-[#FF007F]/10 blur-[130px] pointer-events-none animate-float-light z-0" />
      <div className="absolute bottom-[10%] right-[-15%] w-[60vw] h-[60vw] rounded-full bg-[#00F0FF]/10 blur-[140px] pointer-events-none animate-float-light-delayed z-0" />
      <div className="absolute top-[40%] left-[60%] w-[40vw] h-[40vw] rounded-full bg-[#9D00FF]/10 blur-[120px] pointer-events-none animate-float-light z-0" />
      
      {/* Laser Scanning Effects */}
      <div className="absolute top-[25%] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF]/30 to-transparent opacity-40 pointer-events-none animate-laser z-0" />
      <div className="absolute top-[65%] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF007F]/30 to-transparent opacity-40 pointer-events-none animate-laser z-0" style={{ animationDelay: '-2s' }} />

      {/* Grid overlay for concert truss feeling */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0 pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}

