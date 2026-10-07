'use client';

import {
  Wallet,
  Plus,
  CreditCard,
  Zap,
  Gift,
  Sparkles,
  UserPlus,
  Rocket,
} from 'lucide-react';

export default function HowToFundWallet() {
  const steps = [
    {
      icon: Wallet,
      title: 'Open your dashboard',
      body: 'Sign in and head to your dashboard. Your points balance lives on the wallet card at the top — for example "10.00 pts".',
    },
    {
      icon: Plus,
      title: 'Tap "Buy Points"',
      body: 'On the wallet card, tap Buy Points. A quick panel opens asking how many points you want to add.',
    },
    {
      icon: CreditCard,
      title: 'Enter amount & pay',
      body: 'Type the number of points you want (1 pt = 1 vote = 1 gift unit). Tap Continue — the app shows exactly what you\'ll pay in your local currency, then opens a secure Flutterwave checkout.',
    },
    {
      icon: Zap,
      title: 'Points land instantly',
      body: 'The moment payment confirms, your points appear in your wallet. Now you can vote and send gifts in one tap — no card details to re-enter, ever again.',
    },
    {
      icon: Gift,
      title: 'Track every point',
      body: 'Every purchase, vote, gift, and conversion shows in your Recent Activity list, so you always know exactly where your points went.',
    },
  ];

  return (
    <div className="space-y-3">
      {/* ===== Hero pitch ===== */}
      <div
        className="rounded-2xl border border-[#c9a227]/40 p-4"
        style={{
          background:
            'linear-gradient(135deg, rgba(201,162,39,0.16) 0%, rgba(154,123,79,0.08) 100%)',
        }}
      >
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-full bg-[#c9a227]/20 border border-[#c9a227]/45 flex items-center justify-center flex-shrink-0">
            <Rocket size={18} className="text-[#f5d76e]" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-white leading-snug mb-1">
              The fastest, easiest way to vote and gift
            </h3>
            <p className="text-[11px] text-white/75 leading-relaxed">
              Buy points once, and every vote or gift after that is{' '}
              <span className="font-semibold text-[#f5d76e]">one single tap</span>.
              No card details to type, no waiting — your support lands instantly.
            </p>
          </div>
        </div>
      </div>

      {/* ===== Sign-up nudge ===== */}
      <div
        className="rounded-2xl border border-[#c9a227]/25 p-3.5 flex items-start gap-3"
        style={{ background: 'rgba(201,162,39,0.06)' }}
      >
        <div className="w-9 h-9 rounded-full bg-[#c9a227]/15 border border-[#c9a227]/35 flex items-center justify-center flex-shrink-0">
          <UserPlus size={15} className="text-[#f5d76e]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-[#f5d76e] leading-snug mb-0.5">
            New here? Create a free account.
          </p>
          <p className="text-[11px] text-white/70 leading-relaxed">
            You can vote as a guest — but signing up unlocks the full
            experience: saved favorites, live vote tracking, instant one-tap
            voting, and easy gifting. It takes less than a minute and costs
            nothing.
          </p>
        </div>
      </div>

      {/* ===== Steps ===== */}
      <div className="pt-1">
        <p className="text-[10px] uppercase tracking-wider font-bold text-[#c9a227]/80 mb-2 px-1 flex items-center gap-1.5">
          <Sparkles size={11} />
          How it works
        </p>

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
      </div>
    </div>
  );
}