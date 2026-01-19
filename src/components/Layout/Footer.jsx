'use client'

import { Instagram, Facebook, Mail, MapPin, Phone, Shield } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const Footer = () => {
  const router = useRouter()
  const currentYear = 2024

  const handleAdminClick = () => {
    router.push('/admin')
  }

  return (
    <footer className="bg-brown-900 text-white mt-auto border-t border-gold-600/20">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Section with Logo */}
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-2">
              {/* Logo */}
              <div className="relative h-16 w-64">
                <Image
                  src="https://prolgmzklxddnizyhqau.supabase.co/storage/v1/object/public/classic/Untitled%20design%20(2).png"
                  alt="Classic Queen International Logo"
                  fill
                  className="object-contain object-left"
                  priority
                  unoptimized
                />
              </div>
            </div>
            <p className="text-brown-200 leading-relaxed max-w-xl text-lg">
              Celebrating beauty, grace, and empowerment through premier international pageantry. 
              Join us in crowning excellence and fostering global sisterhood.
            </p>
            <div className="flex space-x-3 pt-4">
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

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-gold-400 border-b border-gold-600/30 pb-2">Quick Links</h3>
            <ul className="space-y-4">
              {[
                { name: 'Contestants', path: '/candidates' },
                { name: 'Voting', path: '/vote' },
                { name: 'Gallery', path: '/gallery' },
                { name: 'News', path: '/news' },
                { name: 'About', path: '/about' },
                { name: 'Sponsors', path: '/sponsors' },
                { name: 'Registration', path: '/registration' },
              ].map((item) => (
                <li key={item.path}>
                  <Link 
                    href={item.path} 
                    className="text-brown-200 hover:text-gold-300 transition-colors duration-300 inline-flex items-center group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-gold-400 border-b border-gold-600/30 pb-2">Contact Us</h3>
            <div className="space-y-5">
              <div className="flex items-center space-x-4">
                <Phone className="text-gold-500 flex-shrink-0" size={20} />
                <a 
                  href="https://wa.me/2348156660109" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-brown-200 hover:text-gold-300 transition-colors duration-300"
                >
                  +234 815 666 0109 (WhatsApp)
                </a>
              </div>
              <div className="flex items-center space-x-4">
                <Mail className="text-gold-500 flex-shrink-0" size={20} />
                <a 
                  href="mailto:classicqueeninternational1@gmail.com" 
                  className="text-brown-200 hover:text-gold-300 transition-colors duration-300"
                >
                  classicqueeninternational1@gmail.com
                </a>
              </div>
              <div className="pt-2">
                <p className="text-brown-300 text-sm mb-2">Follow us on:</p>
                <div className="flex space-x-3 items-center">
                  <a 
                    href="https://instagram.com/classicqueeninternational" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-brown-200 hover:text-gold-300 transition-colors duration-300 text-sm"
                  >
                    Instagram
                  </a>
                  <span className="text-brown-600">•</span>
                  <a 
                    href="https://facebook.com/profile.php?id=100063561464595" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-brown-200 hover:text-gold-300 transition-colors duration-300 text-sm"
                  >
                    Facebook
                  </a>
                  <span className="text-brown-600">•</span>
                  <a 
                    href="https://tiktok.com/@classicqueenintl" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-brown-200 hover:text-gold-300 transition-colors duration-300 text-sm"
                  >
                    TikTok
                  </a>
                  {/* Admin Button placed after TikTok */}
                  <button
                    onClick={handleAdminClick}
                    className="ml-2 p-1 bg-brown-800 text-brown-300 hover:bg-brown-700 hover:text-brown-100 transition-colors duration-200 rounded-sm flex-shrink-0"
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
        <div className="border-t border-brown-700/50 mt-12 pt-8 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-left">
              <p className="text-brown-300 text-sm">
                © {currentYear} Classic Queen International. All rights reserved.
              </p>
              <p className="text-brown-400 text-xs mt-1">
                Proudly supporting women's empowerment worldwide
              </p>
            </div>
            <div className="text-brown-300 text-sm flex items-center">
              <Link href="/privacy" className="hover:text-gold-300 transition-colors mx-4">Privacy Policy</Link>
              <span className="text-brown-600">|</span>
              <Link href="/terms" className="hover:text-gold-300 transition-colors mx-4">Terms of Service</Link>
              <span className="text-brown-600">|</span>
              <Link href="/sitemap" className="hover:text-gold-300 transition-colors mx-4">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer