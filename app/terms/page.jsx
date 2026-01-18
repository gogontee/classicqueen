'use client'

import Link from 'next/link'
import { useState } from 'react'

const TermsAndConditionsPage = () => {
  const [activeSection, setActiveSection] = useState('general')

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-amber-50">
      {/* Header - Fixed text color */}
      <header className="bg-gradient-to-r from-brown-900 to-brown-800 text-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white">
              Classic Queen International
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold text-gold-400 mb-4">
              Terms and Conditions
            </h2>
            <p className="text-lg text-amber-100 mb-6">
              Last Updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <div className="bg-amber-900/30 p-4 rounded-lg border border-amber-700/30">
              <p className="font-bold text-amber-200">
                ⚠️ IMPORTANT: By participating in Classic Queen International, you agree to all terms and conditions outlined below.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="sticky top-24 bg-white rounded-xl shadow-lg p-6 border border-brown-200">
              <h3 className="text-xl font-bold text-brown-900 mb-4">Quick Navigation</h3>
              <nav className="space-y-2">
                <button
                  onClick={() => scrollToSection('general')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeSection === 'general' 
                      ? 'bg-gradient-to-r from-brown-900 to-brown-800 text-white' 
                      : 'text-brown-700 hover:bg-brown-50'
                  }`}
                >
                  📋 General Terms
                </button>
                <button
                  onClick={() => scrollToSection('participation')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeSection === 'participation' 
                      ? 'bg-gradient-to-r from-brown-900 to-brown-800 text-white' 
                      : 'text-brown-700 hover:bg-brown-50'
                  }`}
                >
                  👑 Participation
                </button>
                <button
                  onClick={() => scrollToSection('fees')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeSection === 'fees' 
                      ? 'bg-gradient-to-r from-brown-900 to-brown-800 text-white' 
                      : 'text-brown-700 hover:bg-brown-50'
                  }`}
                >
                  💰 Fees & Payments
                </button>
                <button
                  onClick={() => scrollToSection('prizes')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeSection === 'prizes' 
                      ? 'bg-gradient-to-r from-brown-900 to-brown-800 text-white' 
                      : 'text-brown-700 hover:bg-brown-50'
                  }`}
                >
                  🏆 Prizes & Rewards
                </button>
                <button
                  onClick={() => scrollToSection('media')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeSection === 'media' 
                      ? 'bg-gradient-to-r from-brown-900 to-brown-800 text-white' 
                      : 'text-brown-700 hover:bg-brown-50'
                  }`}
                >
                  📸 Media & Content
                </button>
                <button
                  onClick={() => scrollToSection('camp')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeSection === 'camp' 
                      ? 'bg-gradient-to-r from-brown-900 to-brown-800 text-white' 
                      : 'text-brown-700 hover:bg-brown-50'
                  }`}
                >
                  🎪 Pageant Camp
                </button>
                <button
                  onClick={() => scrollToSection('voting')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeSection === 'voting' 
                      ? 'bg-gradient-to-r from-brown-900 to-brown-800 text-white' 
                      : 'text-brown-700 hover:bg-brown-50'
                  }`}
                >
                  🗳️ Voting System
                </button>
                <button
                  onClick={() => scrollToSection('conduct')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeSection === 'conduct' 
                      ? 'bg-gradient-to-r from-brown-900 to-brown-800 text-white' 
                      : 'text-brown-700 hover:bg-brown-50'
                  }`}
                >
                  ⚖️ Conduct & Rules
                </button>
                <button
                  onClick={() => scrollToSection('liability')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeSection === 'liability' 
                      ? 'bg-gradient-to-r from-brown-900 to-brown-800 text-white' 
                      : 'text-brown-700 hover:bg-brown-50'
                  }`}
                >
                  ⚠️ Liability
                </button>
                <button
                  onClick={() => scrollToSection('changes')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeSection === 'changes' 
                      ? 'bg-gradient-to-r from-brown-900 to-brown-800 text-white' 
                      : 'text-brown-700 hover:bg-brown-50'
                  }`}
                >
                  📝 Changes & Updates
                </button>
              </nav>
              
              <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-bold text-brown-900 mb-2">Need Help?</h4>
                <p className="text-brown-700 text-sm mb-3">
                  Contact our support team for any questions
                </p>
                <Link 
                  href="/contact" 
                  className="inline-block w-full text-center bg-gradient-to-r from-brown-900 to-brown-800 text-white py-2 px-4 rounded-lg hover:from-brown-800 hover:to-brown-700 transition-all"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>

          {/* Add this new section after the "Prizes & Rewards" section */}
<section id="dethronement" className="mb-12 scroll-mt-24">
  <h2 className="text-2xl md:text-3xl font-bold text-brown-900 mb-6 pb-4 border-b border-brown-200">
    👑 Dethronement Clause
  </h2>
  
  <div className="space-y-6">
    <div>
      <h3 className="text-xl font-bold text-brown-800 mb-3">1. Mandatory Contract Signing</h3>
      <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
        <p className="text-brown-700 font-bold mb-2">
          ⚠️ MANDATORY REQUIREMENT:
        </p>
        <p className="text-brown-700">
          The Winner and Runner-Ups must sign the physical terms and conditions contract document within SEVEN (14) calendar days of being announced as winners at the grand finale. Failure to sign the physical contract will result in automatic disqualification and dethronement.
        </p>
      </div>
    </div>
    
    <div>
      <h3 className="text-xl font-bold text-brown-800 mb-3">2. Dethronement Grounds</h3>
      <p className="text-brown-700 mb-4">
        The Winner and Runner-Ups may be dethroned at the sole discretion of Classic Queen International management for any of the following reasons:
      </p>
      <ul className="text-brown-700 space-y-2 mb-4">
        <li className="flex items-start">
          <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
          <span><strong>Failure to sign the Winners contract:</strong> Not signing the official terms and conditions document within the stipulated timeframe</span>
        </li>
        <li className="flex items-start">
          <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
          <span><strong>Breach of contract terms:</strong> Violation of any terms outlined in the signed agreement</span>
        </li>
        <li className="flex items-start">
          <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
          <span><strong>Misconduct:</strong> Engaging in activities that bring Classic Queen International into disrepute</span>
        </li>
        <li className="flex items-start">
          <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
          <span><strong>Criminal activity:</strong> Involvement in any illegal activities during the reign period</span>
        </li>
        <li className="flex items-start">
          <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
          <span><strong>Non-performance:</strong> Failure to fulfill official duties and obligations as outlined in the contract</span>
        </li>
        <li className="flex items-start">
          <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
          <span><strong>False representation:</strong> Discovery of false information in the original application</span>
        </li>
      </ul>
    </div>
    
    <div>
      <h3 className="text-xl font-bold text-brown-800 mb-3">3. Dethronement Process</h3>
      <p className="text-brown-700 mb-2">
        In the event of dethronement:
      </p>
      <ul className="text-brown-700 space-y-2">
        <li className="flex items-start">
          <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
          <span>All prizes, titles, and privileges are immediately revoked</span>
        </li>
        <li className="flex items-start">
          <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
          <span>The dethroned winner must return all physical prizes (crowns, sashes, trophies, etc.) within 14 days</span>
        </li>
        <li className="flex items-start">
          <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
          <span>Any cash prizes already disbursed may be subject to recovery through legal means</span>
        </li>
        <li className="flex items-start">
          <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
          <span>The title will be transferred to the next runner-up at management's discretion</span>
        </li>
        <li className="flex items-start">
          <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
          <span>The dethronement decision is final and not subject to appeal</span>
        </li>
      </ul>
    </div>
    
    <div>
      <h3 className="text-xl font-bold text-brown-800 mb-3">4. Contractual Obligations</h3>
      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
        <p className="text-brown-700 font-bold mb-2">
          IMPORTANT NOTES:
        </p>
        <ul className="text-brown-700 space-y-2">
          <li className="flex items-start">
            <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
            <span>The Winners contract includes detailed obligations, duties, and code of conduct for the reign period</span>
          </li>
          <li className="flex items-start">
            <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
            <span>Winners must make themselves available for contract signing within the specified timeframe</span>
          </li>
          <li className="flex items-start">
            <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
            <span>Failure to sign constitutes automatic forfeiture of all rights to prizes and titles</span>
          </li>
          <li className="flex items-start">
            <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
            <span>The signed contract supersedes all previous agreements and understandings</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</section>

          {/* Terms Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-brown-200">
              {/* General Terms */}
              <section id="general" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl md:text-3xl font-bold text-brown-900 mb-6 pb-4 border-b border-brown-200">
                  📋 General Terms
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-brown-800 mb-3">1. Acceptance of Terms</h3>
                    <p className="text-brown-700 mb-4">
                      By submitting your application, participating in, or attending any Classic Queen International event, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-brown-800 mb-3">2. Eligibility</h3>
                    <ul className="text-brown-700 space-y-2 mb-4">
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Must be between 18 – 30 years of age</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Minimum height requirement: 5'6 ft (168 cm)</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Must be a citizen or legal resident of the country represented</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Single, divorced, and single mothers are eligible</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Minimum educational requirement: Secondary school certificate</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-brown-800 mb-3">3. Application Process</h3>
                    <p className="text-brown-700 mb-2">
                      All applications are subject to review and approval by Classic Queen International management. Submission of application does not guarantee participation.
                    </p>
                    <p className="text-brown-700">
                      The management reserves the right to accept or reject any application at its sole discretion without providing reasons.
                    </p>
                  </div>
                </div>
              </section>

              {/* Participation */}
              <section id="participation" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl md:text-3xl font-bold text-brown-900 mb-6 pb-4 border-b border-brown-200">
                  👑 Participation Terms
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-brown-800 mb-3">4. Commitment Requirements</h3>
                    <p className="text-brown-700 mb-4">
                      Selected contestants must commit to:
                    </p>
                    <ul className="text-brown-700 space-y-2 mb-4">
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Full participation in the pageant camp (mandatory)</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Attendance at all rehearsals and training sessions during Camp</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Participation in all media activities and promotional events during and after camp</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Attendance at the grand finale and related events</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-brown-800 mb-3">5. Disqualification</h3>
                    <p className="text-brown-700 mb-4">
                      Contestants may be disqualified for:
                    </p>
                    <ul className="text-brown-700 space-y-2">
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Failure to meet eligibility requirements</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Provision of false information in application</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Non-compliance with rules and regulations</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Engagement in activities that damage the brand's reputation</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Absence from mandatory events without prior approval</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Fees & Payments */}
              <section id="fees" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl md:text-3xl font-bold text-brown-900 mb-6 pb-4 border-b border-brown-200">
                  💰 Fees & Payments
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-brown-800 mb-3">6. Registration Fee</h3>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-4">
                      <p className="text-brown-700 font-bold mb-2">
                        Registration Fee: USD$200 (Payable only if application is approved)
                      </p>
                      <p className="text-brown-700">
                        No payment is required to submit your application. The registration fee is only payable if your application is approved and you accept the invitation to participate. This fee covers:
                      </p>
                      <ul className="text-brown-700 space-y-1 mt-2 ml-4">
                        <li className="flex items-start">
                          <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                          <span>Pageant camp accommodation</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                          <span>Camp meals and refreshments</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                          <span>Training materials and resources</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                          <span>Camp activities and workshops</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-brown-800 mb-3">7. Non-Refundable Policy</h3>
                    <p className="text-brown-700 mb-4">
                      All payments made to Classic Queen International are NON-REFUNDABLE under any circumstances, including but not limited to:
                    </p>
                    <ul className="text-brown-700 space-y-2 mb-4">
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Registration fees</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Voting fees and purchases (see Voting System section)</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Sponsorship and partnership contributions</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Any other payments made to the organization</span>
                      </li>
                    </ul>
                    <p className="text-brown-700">
                      This policy applies regardless of whether the contestant completes the pageant, is disqualified, withdraws, or is unable to participate for any reason.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-brown-800 mb-3">8. Additional Costs</h3>
                    <p className="text-brown-700 mb-2">
                      Contestants are responsible for:
                    </p>
                    <ul className="text-brown-700 space-y-2">
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Travel expenses to and from the pageant location</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Personal wardrobe and grooming expenses</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Any additional personal expenses during the event</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Prizes & Rewards */}
              <section id="prizes" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl md:text-3xl font-bold text-brown-900 mb-6 pb-4 border-b border-brown-200">
                  🏆 Prizes & Rewards
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-brown-800 mb-3">9. Prize Structure</h3>
                    <p className="text-brown-700 mb-4">
                      All prizes are awarded at the sole discretion of Classic Queen International management. The term "worth of prize" includes:
                    </p>
                    <ul className="text-brown-700 space-y-2 mb-4">
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Cash components</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Promotional packages and exposure</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Future gains from endorsement or advertisement deals</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Brand partnerships secured during the winner's reign</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-brown-800 mb-3">10. Winner's Prize</h3>
                    <div className="bg-gold-50 p-4 rounded-lg border border-gold-200 mb-4">
                      <p className="text-brown-700">
                        <span className="font-bold">For the Winner:</span> The prize package features a significant cash reward determined by management, in addition to secured promotional campaigns and confirmed endorsement partnerships that provide tangible career advancement opportunities.
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-brown-800 mb-3">11. Runner-Up Prizes</h3>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-4">
                      <p className="text-brown-700">
                        <span className="font-bold">For Runner-Ups:</span> Prizes primarily consist of promotional opportunities and deals that management may secure. Any cash component is at the sole discretion of management as appreciation for resilience and competitive spirit, with the amount determined by management.
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-brown-800 mb-3">12. Prize Fulfillment</h3>
                    <p className="text-brown-700 mb-2">
                      Prizes are subject to:
                    </p>
                    <ul className="text-brown-700 space-y-2">
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Winner's compliance with all terms and conditions</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Media & Content */}
              <section id="media" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl md:text-3xl font-bold text-brown-900 mb-6 pb-4 border-b border-brown-200">
                  📸 Media & Content Rights
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-brown-800 mb-3">13. Content Usage Rights</h3>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
                      <p className="text-brown-700 font-bold mb-2">
                        ⚠️ IMPORTANT NOTICE:
                      </p>
                      <p className="text-brown-700">
                        By participating in Classic Queen International, you grant the organization exclusive rights to publish, broadcast, distribute, and use your name, likeness, voice, photographs, videos, and any other content from the event for a period of TWO (2) YEARS from the date of the grand finale.
                      </p>
                    </div>
                    
                    <p className="text-brown-700 mb-4">
                      This includes but is not limited to:
                    </p>
                    <ul className="text-brown-700 space-y-2 mb-4">
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Promotional materials and advertisements</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Social media content and marketing campaigns</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Documentaries, behind-the-scenes footage, and highlights</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Sponsorship and partnership presentations</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-brown-800 mb-3">14. Permanent Rights</h3>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <p className="text-brown-700 font-bold mb-2">
                        NOTE:
                      </p>
                      <p className="text-brown-700">
                        After the expiration of the 2-year contract period, your content shall remain permanently on all Classic Queen International platforms unless the management determines otherwise. This includes the official website, social media channels, archives, and promotional materials.
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-brown-800 mb-3">15. Media Obligations</h3>
                    <p className="text-brown-700 mb-2">
                      Contestants agree to:
                    </p>
                    <ul className="text-brown-700 space-y-2">
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Participate in all media interviews and press conferences</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Allow filming and photography during all events</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Provide content for social media promotion</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Maintain a positive public image throughout the pageant</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Pageant Camp */}
              <section id="camp" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl md:text-3xl font-bold text-brown-900 mb-6 pb-4 border-b border-brown-200">
                  🎪 Pageant Camp Rules
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-brown-800 mb-3">16. Camp Attendance</h3>
                    <p className="text-brown-700 mb-4">
                      Pageant camp is MANDATORY for all selected contestants. Failure to attend camp may result in immediate disqualification.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-brown-800 mb-3">17. Camp Coverage</h3>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-4">
                      <p className="text-brown-700">
                        <span className="font-bold">Note:</span> The registration fee of USD$200 covers all camp-related expenses including:
                      </p>
                      <ul className="text-brown-700 space-y-1 mt-2 ml-4">
                        <li className="flex items-start">
                          <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                          <span>Accommodation during camp period</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                          <span>All meals and refreshments</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                          <span>Camp activities and workshops</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-brown-800 mb-3">18. Camp Rules</h3>
                    <ul className="text-brown-700 space-y-2">
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Strict adherence to camp schedule and curfew</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Professional conduct at all times</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Respect for fellow contestants, staff, and trainers</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Compliance with all safety regulations</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>No unauthorized visitors during camp period</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Voting System */}
              <section id="voting" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl md:text-3xl font-bold text-brown-900 mb-6 pb-4 border-b border-brown-200">
                  🗳️ Voting System
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-brown-800 mb-3">19. Voting Definition</h3>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-4">
                      <p className="text-brown-700 font-bold mb-2">
                        Voting Fee Definition:
                      </p>
                      <p className="text-brown-700">
                        "Voting fee" refers to the monetary amount paid by supporters (friends, family, fans, or general public) to vote for a candidate during the competition. This applies to both online voting platforms and offline voting channels.
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-brown-800 mb-3">20. Voting Rules</h3>
                    <p className="text-brown-700 mb-4">
                      Important voting notes:
                    </p>
                    <ul className="text-brown-700 space-y-2">
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>All voting fees are NON-REFUNDABLE</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Voting can be conducted through multiple platforms (website, mobile app, SMS, etc.)</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Each vote typically has a predetermined cost</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Management reserves the right to validate and verify all votes</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>No refunds for technical issues, duplicate votes, or accidental purchases</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Votes must be purchased through official channels only</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Management's decision on voting results is final and binding</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-brown-800 mb-3">21. Vote Counting</h3>
                    <p className="text-brown-700 mb-2">
                      Voting results are calculated based on:
                    </p>
                    <ul className="text-brown-700 space-y-2">
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Total number of valid votes received</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Conduct & Rules */}
              <section id="conduct" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl md:text-3xl font-bold text-brown-900 mb-6 pb-4 border-b border-brown-200">
                  ⚖️ Conduct & Rules
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-brown-800 mb-3">22. Code of Conduct</h3>
                    <p className="text-brown-700 mb-4">
                      All contestants must maintain the highest standards of personal conduct, including:
                    </p>
                    <ul className="text-brown-700 space-y-2 mb-4">
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Respect for diversity and cultural differences</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Professionalism in all interactions</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Positive representation of Classic Queen International brand</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>No use of illegal substances or excessive alcohol</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>No attempts to manipulate voting or competition results</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-brown-800 mb-3">23. Competition Integrity</h3>
                    <p className="text-brown-700 mb-2">
                      To maintain fair competition:
                    </p>
                    <ul className="text-brown-700 space-y-2">
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>No bribery or attempt to influence judges</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>No negative campaigning against other contestants</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>No false claims or misleading information</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Respect for all competition rules and procedures</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Liability */}
<section id="liability" className="mb-12 scroll-mt-24">
  <h2 className="text-2xl md:text-3xl font-bold text-brown-900 mb-6 pb-4 border-b border-brown-200">
    ⚠️ Liability & Disclaimers
  </h2>
  
  <div className="space-y-6">
    <div>
      <h3 className="text-xl font-bold text-brown-800 mb-3">24. Limitation of Liability</h3>
      <p className="text-brown-700 mb-4">
        Classic Queen International, its organizers, sponsors, and affiliates shall not be liable for:
      </p>
      <ul className="text-brown-700 space-y-2 mb-4">
        <li className="flex items-start">
          <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
          <span>Personal injury, illness, or accidents during events</span>
        </li>
        <li className="flex items-start">
          <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
          <span>Loss or damage to personal property</span>
        </li>
        <li className="flex items-start">
          <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
          <span>Emotional distress or psychological impact</span>
        </li>
        <li className="flex items-start">
          <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
          <span>Financial losses or business opportunities</span>
        </li>
        <li className="flex items-start">
          <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
          <span>Acts of God, force majeure events, or unforeseen circumstances beyond our control</span>
        </li>
        <li className="flex items-start">
          <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
          <span>Liabilities arising from changes in government policies, regulations, or legal requirements</span>
        </li>
      </ul>
    </div>
    
    <div>
      <h3 className="text-xl font-bold text-brown-800 mb-3">25. Health & Safety</h3>
      <p className="text-brown-700 mb-2">
        Contestants acknowledge and agree that:
      </p>
      <ul className="text-brown-700 space-y-2">
        <li className="flex items-start">
          <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
          <span>They are physically and mentally fit to participate</span>
        </li>
        <li className="flex items-start">
          <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
          <span>They have disclosed any medical conditions or limitations</span>
        </li>
        <li className="flex items-start">
          <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
          <span>They participate at their own risk</span>
        </li>
        <li className="flex items-start">
          <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
          <span>They will follow all safety instructions and guidelines</span>
        </li>
      </ul>
    </div>
  </div>
</section>

              {/* Changes & Updates */}
              <section id="changes" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl md:text-3xl font-bold text-brown-900 mb-6 pb-4 border-b border-brown-200">
                  📝 Changes & Updates
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-brown-800 mb-3">26. Amendments to Terms</h3>
                    <p className="text-brown-700 mb-4">
                      Classic Queen International reserves the right to modify these Terms and Conditions at any time without prior notice. The most current version will always be available on our website. Continued participation constitutes acceptance of updated terms.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-brown-800 mb-3">27. Event Changes</h3>
                    <p className="text-brown-700 mb-4">
                      Management reserves the right to:
                    </p>
                    <ul className="text-brown-700 space-y-2 mb-4">
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Change event dates, venues, or formats</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Modify competition rules and judging criteria</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Cancel the event due to unforeseen circumstances</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Adjust prize packages and sponsorship arrangements</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                        <span>Change voting procedures or platforms</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-brown-800 mb-3">28. Contact & Support</h3>
                    <p className="text-brown-700">
                      For questions about these Terms and Conditions, please contact:
                    </p>
                    <div className="mt-4 p-4 bg-brown-50 rounded-lg">
                      <p className="text-brown-700 font-bold">Classic Queen International Support</p>
                      <p className="text-brown-700">Email: classicqueeninternational1@gmail.com</p>
                      <p className="text-brown-700">Tel: +2348156660109</p> 
                    </div>
                  </div>
                </div>
              </section>

              {/* Acceptance Section */}
              <div className="mt-12 p-6 bg-gradient-to-r from-brown-900 to-brown-800 rounded-xl text-white">
                <h3 className="text-2xl font-bold mb-4 text-center text-white">Acceptance of Terms</h3>
                <p className="text-center mb-6">
                  By participating in Classic Queen International, you confirm that you have read, understood, and agree to be bound by all the Terms and Conditions outlined above.
                </p>
                <div className="text-center">
                  <Link 
                    href="/" 
                    className="inline-block bg-white text-brown-900 font-bold py-3 px-8 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    Return to Homepage
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default TermsAndConditionsPage