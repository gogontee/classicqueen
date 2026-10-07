'use client';

import { Gift, MousePointerClick, CreditCard, Wallet, Sparkles } from 'lucide-react';

export default function HowToGift() {
  const steps = [
    {
      icon: Gift,
      title: 'Tap "Gift Me"',
      body: 'On a candidate\'s profile, tap Gift Me. A gift panel opens with a grid of gifts — Royal Rose, Gold Crown, Queen Dragon and more.',
    },
    {
      icon: MousePointerClick,
      title: 'Pick a gift',
      body: 'Each gift has a points value (20 pts, 50 pts, 100 pts…). Tap any tile to select it. The page will scroll you down to the payment section automatically.',
    },
    {
      icon: CreditCard,
      title: 'Pay with card or bank',
      body: 'Select Card, enter your email, and pay in your local currency. Prices convert automatically — you\'ll see exactly what you\'re charged before confirming.',
    },
    {
      icon: Wallet,
      title: 'Or pay with points',
      body: 'Select Wallet to send the gift from your existing points balance. Fastest option — no card details needed.',
    },
    {
      icon: Sparkles,
      title: 'Gift lands instantly',
      body: 'The candidate receives your gift right away. She can convert her gift balance into votes for herself or another candidate at any time.',
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