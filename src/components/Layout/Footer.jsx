'use client'

import { Instagram, Facebook, Mail, MapPin, Phone, Shield } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const Footer = () => {
  const router = useRouter()
  const currentYear = new Date().getFullYear() // Dynamic year

  const handleAdminClick = () => {
    router.push('/admin')
  }

  return (
    <footer className="bg-brown-900 text-white mt-auto border-t border-gold-600/20">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-center md:text-left">
          {/* Brand Section with Logo */}
          <div className="md:col-span-2 space-y-6 flex flex-col items-center md:items-start">
            <div className="space-y-2">
              {/* Logo */}
              <div className="relative h-16 w-64">
                <Image
                  src="https://prolgmzklxddnizyhqau.supabase.co/storage/v1/object/public/classic/Untitled%20design%20(2).png"
                  alt="Classic Queen International Logo"
                  fill
                  className="object-contain object-left md:object-left"
                  priority
                  unoptimized
                />
              </div>
            </div>
            <p className="text-brown-200 leading-relaxed max-w-xl text-lg text-center md:text-left">
              Celebrating beauty, grace, and empowerment through premier international pageantry. 
              Join us in crowning excellence and fostering global sisterhood.
            </p>
            <div className="flex space-x-3 pt-4 justify-center md:justify-start">
              <a 
                href="https://instagram.com/classicqueeninternational" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-brown-200 hover:text-gold-400 transition-all duration-300 p-3 hover:bg-brown-800/50 rounded-full border border-brown-700 hover:border-gold-400/30"
              >
                <Instagram size={22} />
              </a>
              <a 
                href="https://facebook.com/profile.php?id=100063561464595" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-brown-200 hover:text-gold-400 transition-all duration-300 p-3 hover:bg-brown-800/50 rounded-full border border-brown-700 hover:border-gold-400/30"
              >
                <Facebook size={22} />
              </a>
              <a 
                href="mailto:classicqueeninternational1@gmail.com" 
                className="text-brown-200 hover:text-gold-400 transition-all duration-300 p-3 hover:bg-brown-800/50 rounded-full border border-brown-700 hover:border-gold-400/30"
              >
                <Mail size={22} />
              </a>
            </div>
          </div>

          {/* Quick Links - 3 column grid on mobile */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold mb-6 text-gold-400 border-b border-gold-600/30 pb-2 text-center md:text-left">Quick Links</h3>
            <div className="grid grid-cols-3 md:grid-cols-1 gap-4 md:gap-4">
              {[
                { name: 'Contestants', path: '/candidates' },
                { name: 'Voting', path: '/vote' },
                { name: 'Gallery', path: '/gallery' },
                { name: 'News', path: '/news' },
                { name: 'About', path: '/about' },
                { name: 'Sponsors', path: '/sponsors' },
                { name: 'Registration', path: '/registration' },
                { name: 'Terms', path: '/terms' },
              ].map((item) => (
                <div key={item.path} className="text-center md:text-left">
                  <Link 
                    href={item.path} 
                    className="text-brown-200 hover:text-gold-300 transition-colors duration-300 inline-block py-1 md:py-0"
                  >
                    <span className="text-sm md:text-base">{item.name}</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-1 flex flex-col items-center md:items-start">
            <h3 className="text-lg font-bold mb-6 text-gold-400 border-b border-gold-600/30 pb-2 text-center md:text-left">Contact Us</h3>
            <div className="space-y-5 w-full max-w-xs md:max-w-none">
              <div className="flex items-center space-x-4 justify-center md:justify-start">
                <Phone className="text-gold-500 flex-shrink-0" size={20} />
                <a 
                  href="https://wa.me/2348156660109" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-brown-200 hover:text-gold-300 transition-colors duration-300 text-sm md:text-base"
                >
                  +234 815 666 0109
                </a>
              </div>
              <div className="flex items-center space-x-4 justify-center md:justify-start">
                <Mail className="text-gold-500 flex-shrink-0" size={20} />
                <a 
                  href="mailto:classicqueeninternational1@gmail.com" 
                  className="text-brown-200 hover:text-gold-300 transition-colors duration-300 text-sm md:text-base break-words"
                >
                  classicqueeninternational1@gmail.com
                </a>
              </div>
              <div className="pt-2">
                <p className="text-brown-300 text-sm mb-2 text-center md:text-left">Follow us on:</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3 items-center">
                  <a 
                    href="https://instagram.com/classicqueeninternational" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-brown-200 hover:text-gold-300 transition-colors duration-300 text-sm"
                  >
                    Instagram
                  </a>
                  <span className="text-brown-600 hidden md:inline">•</span>
                  <a 
                    href="https://facebook.com/profile.php?id=100063561464595" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-brown-200 hover:text-gold-300 transition-colors duration-300 text-sm"
                  >
                    Facebook
                  </a>
                  <span className="text-brown-600 hidden md:inline">•</span>
                  <a 
                    href="https://tiktok.com/@classicqueenintl" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-brown-200 hover:text-gold-300 transition-colors duration-300 text-sm"
                  >
                    TikTok
                  </a>
                  {/* Admin Button */}
                  <button
                    onClick={handleAdminClick}
                    className="p-1 bg-brown-800 text-brown-300 hover:bg-brown-700 hover:text-brown-100 transition-colors duration-200 rounded-sm flex-shrink-0"
                    title="Admin Panel"
                    aria-label="Admin Panel"
                  >
                    <Shield size={10} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright & Additional Info */}
        <div className="border-t border-brown-700/50 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-brown-300 text-sm">
                © {currentYear} Classic Queen International. All rights reserved.
              </p>
              <p className="text-brown-400 text-xs mt-1">
                Proudly supporting women's empowerment worldwide
              </p>
            </div>
            <div className="text-brown-300 text-sm flex flex-wrap justify-center gap-4 items-center">
              <Link href="/privacy" className="hover:text-gold-300 transition-colors">Privacy Policy</Link>
              <span className="text-brown-600 hidden md:inline">|</span>
              <Link href="/terms" className="hover:text-gold-300 transition-colors">Terms of Service</Link>
              <span className="text-brown-600 hidden md:inline">|</span>
              <Link href="/sitemap" className="hover:text-gold-300 transition-colors">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer