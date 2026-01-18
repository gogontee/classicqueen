import React from 'react';
import { FaInstagram, FaFacebookF, FaTiktok } from 'react-icons/fa';

export default function CandidatesPage() {
  return (
    <div className="container mx-auto py-8 px-4 min-h-[70vh]">
      <h1 className="text-4xl font-bold text-brown-900 mb-4 text-center font-playfair">
        Our Contestants
      </h1>

      <div className="mt-12">
        <div className="max-w-2xl mx-auto text-center bg-gradient-to-b from-amber-50 to-white p-10 rounded-2xl shadow-lg border border-amber-100">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-6">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-10 w-10 text-amber-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-amber-800 mb-4">
            Registration in Progress
          </h2>
          
          <p className="text-amber-700 text-lg mb-8 leading-relaxed">
            Approved candidates will be shown here once the registration process is complete. 
            Please check back soon for updates!
          </p>
          
          <div className="mt-10 pt-6 border-t border-amber-200">
            <h3 className="font-semibold text-amber-800 mb-4">
              Stay Connected for Updates
            </h3>
            
            <div className="flex justify-center space-x-8">
              {/* Instagram Icon - Fixed */}
              <a
                href="https://instagram.com/classicqueeninternational"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center group"
                aria-label="Follow us on Instagram"
              >
                <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaInstagram className="h-6 w-6 text-white" />
                </div>
                <span className="mt-2 text-sm text-amber-700 font-medium">Instagram</span>
              </a>
              
              {/* Facebook Icon */}
              <a
                href="https://facebook.com/profile.php?id=100063561464595"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center group"
                aria-label="Follow us on Facebook"
              >
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaFacebookF className="h-6 w-6 text-white" />
                </div>
                <span className="mt-2 text-sm text-amber-700 font-medium">Facebook</span>
              </a>
              
              {/* TikTok Icon */}
              <a
                href="https://tiktok.com/@classicqueenintl"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center group"
                aria-label="Follow us on TikTok"
              >
                <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaTiktok className="h-6 w-6 text-white" />
                </div>
                <span className="mt-2 text-sm text-amber-700 font-medium">TikTok</span>
              </a>
            </div>
            
            <p className="text-amber-600 text-sm mt-6">
              Follow us on social media for the latest news and announcements
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}