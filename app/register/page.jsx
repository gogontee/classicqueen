'use client'

import { useState } from 'react'
import HeroSection from '../../src/components/Home/HeroSection'
import CandidateRegistrationForm from '../../src/components/Candidates/Registration'
import NationalDirectorRegistrationForm from '../../src/components/NationalDirector'

const RegistrationPage = () => {
  const [activeTab, setActiveTab] = useState('candidate') // 'candidate' or 'director'

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gold-50">
      {/* Hero Section */}
      <HeroSection />

      <div className="container mx-auto px-4 py-4 md:py-6">
        {/* Compact Registration Type Selector - Improved Toggle */}
        <div className="max-w-md mx-auto mb-4 md:mb-6">
          <div className="flex items-center justify-center space-x-2 bg-white rounded-lg shadow-md p-1 border border-brown-100">
            <button
              onClick={() => setActiveTab('candidate')}
              className={`px-5 py-2.5 text-sm font-medium rounded-md transition-all duration-200 shadow-sm ${
                activeTab === 'candidate'
                  ? 'bg-gradient-to-r from-brown-900 to-brown-800 text-white shadow-md'
                  : 'bg-white text-brown-900 hover:bg-brown-50'
              }`}
            >
              Independent Candidate
            </button>
            
            <button
              onClick={() => setActiveTab('director')}
              className={`px-5 py-2.5 text-sm font-medium rounded-md transition-all duration-200 shadow-sm ${
                activeTab === 'director'
                  ? 'bg-gradient-to-r from-brown-900 to-brown-800 text-white shadow-md'
                  : 'bg-white text-brown-900 hover:bg-brown-50'
              }`}
            >
              National Director
            </button>
          </div>
        </div>

        {/* Active Form */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'candidate' ? (
            <CandidateRegistrationForm />
          ) : (
            <NationalDirectorRegistrationForm />
          )}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-6 md:mt-8">
          <h2 className="text-xl md:text-2xl font-bold text-center text-brown-900 mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-brown-100">
              <h3 className="font-bold text-brown-900 mb-1 text-sm md:text-base">
                Can I register if I'm from a country without a National Director?
              </h3>
              <p className="text-brown-700 text-xs md:text-sm">
                Yes! Independent candidates can register directly through our website. If your country doesn't have a National Director yet, you'll compete under the international banner and may have the opportunity to become the inaugural National Director for your country.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-brown-100">
              <h3 className="font-bold text-brown-900 mb-1 text-sm md:text-base">
                What are the benefits of becoming a National Director?
              </h3>
              <p className="text-brown-700 text-xs md:text-sm">
                National Directors receive exclusive rights to organize Classic Queen pageants in their country, revenue sharing from registrations and sponsorships, full organizational support from headquarters, training materials, and the opportunity to build a profitable beauty pageant business.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-brown-100">
              <h3 className="font-bold text-brown-900 mb-1 text-sm md:text-base">
                Is there an age limit for contestants?
              </h3>
              <p className="text-brown-700 text-xs md:text-sm">
                Yes, contestants must be between 18-30 years old at the time of registration. There's no age limit for National Directors - we welcome experienced professionals from all age groups.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-brown-100">
              <h3 className="font-bold text-brown-900 mb-1 text-sm md:text-base">
                What happens after I register?
              </h3>
              <p className="text-brown-700 text-xs md:text-sm">
                Contestants will receive a confirmation email with next steps, including requirements for profile submission and preliminary judging. National Directors will be contacted by our franchise team within 48 hours to schedule an orientation call and discuss the franchise agreement.
              </p>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="max-w-4xl mx-auto mt-6 md:mt-8">
          <div className="bg-gradient-to-r from-brown-900 to-brown-800 rounded-xl p-6 text-center text-white shadow-md">
            <h3 className="text-lg font-bold mb-3">
              Need More Information?
            </h3>
            <p className="text-brown-200 mb-4 text-sm max-w-2xl mx-auto">
              Our team is ready to answer all your questions about registration, eligibility, and opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a 
                href="mailto:classicqueeninternational1@gmail.com" 
                className="inline-flex items-center justify-center px-4 py-2 bg-white text-brown-900 font-medium rounded-lg hover:bg-gold-100 transition-colors text-sm shadow-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Email Us
              </a>
              <a 
                href="tel:+1238156660109" 
                className="inline-flex items-center justify-center px-4 py-2 bg-gold-600 text-white font-medium rounded-lg hover:bg-gold-700 transition-colors text-sm shadow-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                Call Us
              </a>
              <a 
                href="https://wa.me/2348156660109" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-sm shadow-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegistrationPage