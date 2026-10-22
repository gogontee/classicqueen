'use client';

import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Globe } from 'lucide-react';
import { useLocale } from 'next-intl';

export default function LanguageSwitcher() {
  const router = useRouter();
  const locale = useLocale();

  const handleLanguageChange = (e) => {
    const newLocale = e.target.value;
    
    // Set cookie for 1 year
    Cookies.set('NEXT_LOCALE', newLocale, { expires: 365 });
    
    // Force Next.js to re-fetch server components with the new language
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      <Globe size={16} className="text-white/70" />
      <select
        onChange={handleLanguageChange}
        value={locale}
        className="bg-transparent text-sm font-medium outline-none cursor-pointer text-white"
      >
        <option value="en" className="text-black">English</option>
        <option value="fr" className="text-black">Français</option>
      </select>
    </div>
  );
}