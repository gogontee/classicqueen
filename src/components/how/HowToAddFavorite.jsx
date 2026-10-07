'use client';

import { Heart, Plus, Search, MousePointerClick, Bell } from 'lucide-react';

export default function HowToAddFavorite() {
  const steps = [
    {
      icon: Heart,
      title: 'Why favorite a candidate?',
      body: 'Favorites live on your dashboard so you can vote for her in one tap, see her live vote count, and never lose track of who you\'re supporting.',
    },
    {
      icon: Plus,
      title: 'Tap "Add Favorite"',
      body: 'On your dashboard, scroll to the My Favorites section and tap the Add Favorite button.',
    },
    {
      icon: Search,
      title: 'Search for a candidate',
      body: 'Type her name or username in the search box. Results appear as you type — tap the one you want.',
    },
    {
      icon: MousePointerClick,
      title: 'She\'s added',
      body: 'The candidate now appears as a card on your dashboard with her photo, country and a Vote button right there.',
    },
    {
      icon: Bell,
      title: 'Vote in one tap, anytime',
      body: 'Whenever you want to vote for her, just tap the Vote button on her card. No need to search for her profile again.',
    },
  ];

  return (
    <div className="space-y-3">
      {steps.map((s, i) => {
        const Icon = s.icon;
        return (
          <div
            key={i}
            className="flex items-start gap-3 rounded-xl border border-[#c9a227]/25 bg-white/[0.03] p-3"
          >
            <div className="w-9 h-9 rounded-full bg-[#c9a227]/15 border border-[#c9a227]/35 flex items-center justify-center flex-shrink-0">
              <Icon size={15} className="text-[#f5d76e]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-bold text-white leading-snug">
                <span className="text-[#c9a227] mr-1.5">{i + 1}.</span>
                {s.title}
              </p>
              <p className="text-[11px] text-white/65 leading-relaxed mt-1">
                {s.body}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}