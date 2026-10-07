'use client';

import { Heart, Mail, CreditCard, Wallet, Users } from 'lucide-react';

export default function HowToVote() {
  const steps = [
    {
      icon: Heart,
      title: 'Tap "Click to Vote"',
      body: 'On any candidate\'s profile, tap the Click to Vote button. A voting panel opens right on the page — no sign-up needed if you\'re just voting with a card.',
    },
    {
      icon: Users,
      title: 'Choose how many votes',
      body: 'Pick a quick amount (1, 5, 10, 25, 50, 100…) or type your own. Each vote is 1 pt. The total updates live as you pick.',
    },
    {
      icon: CreditCard,
      title: 'Pay with card or bank',
      body: 'Select Card/Bank. Enter your email, then pay with any card or bank transfer. Prices are shown in your local currency (₦, $, €, GH₵, KSh…).',
    },
    {
      icon: Wallet,
      title: 'Or pay with points',
      body: 'Already have points in your wallet? Select Wallet and your votes are cast in one tap — no card details needed. Buy points anytime from your dashboard.',
    },
    {
      icon: Mail,
      title: 'Done — votes count instantly',
      body: 'You\'ll see a success screen and the candidate\'s vote count goes up immediately. Share the profile with friends to multiply support.',
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