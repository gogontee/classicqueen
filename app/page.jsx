'use client'

import HeroSection from '../src/components/Home/HeroSection';
import FeaturedPost from '../src/components/Home/FeaturedPost';
import Stats from '../src/components/Home/Stats';
import NextQueenSection from '../src/components/Home/NextQueenSection';
import SponsorsSection from '../src/components/Home/SponsorsSection'; // New import

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero directly under header - NO SPACING */}
      <HeroSection />
      
      {/* Stats with NO spacing - Full width on mobile */}
      <Stats />
      
      {/* Featured Posts with NO spacing */}
      <div className="mt-0">
        <FeaturedPost />
      </div>
      
      {/* Who Becomes the Next Queen Section */}
      <div className="mt-0 md:mt-0">
        <NextQueenSection />
      </div>
      
      {/* Sponsors Section */}
      <div className="mt-0 md:mt-0">
        <SponsorsSection />
      </div>
    </div>
  );
}