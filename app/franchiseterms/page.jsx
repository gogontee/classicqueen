// app/franchiseterms/page.js
'use client'

import { Shield, Globe, Crown, Award, Users, FileText, CheckCircle, XCircle, Star, Target, Trophy, BadgeCheck } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const FranchiseTerms = () => {
  const router = useRouter()

  const handleApplyNow = () => {
    router.push('/register')
  }

  const handleViewTerms = () => {
    router.push('/terms')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brown-50 to-white">
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] max-h-[600px] bg-gradient-to-r from-brown-900 via-brown-800 to-brown-900 overflow-hidden">
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center mb-4">
              <Crown className="w-16 h-16 md:w-20 md:h-20 text-gold-400" />
            </div>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3">
              National Director
              <span className="block text-gold-300 mt-2">Franchise Terms</span>
            </h1>
            
            <p className="text-lg md:text-xl text-brown-200 max-w-3xl mx-auto mb-8">
              Exclusive rights to host Classic Queen International Pageant in your country of interest
            </p>
          </div>
          
          {/* Hero CTA */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleApplyNow}
              className="group inline-flex items-center justify-center px-8 py-3 bg-gold-600 text-white font-bold rounded-lg hover:bg-gold-700 transition-all transform hover:scale-105 shadow-lg text-base md:text-lg"
            >
              <Star className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Apply Now - USD 500
            </button>
            <button
              onClick={handleViewTerms}
              className="inline-flex items-center justify-center px-8 py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-all border border-white/30 text-base md:text-lg"
            >
              <FileText className="w-5 h-5 mr-2" />
              View Terms
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Full width on desktop */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-xl shadow-xl p-6 border border-brown-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-brown-100 flex items-center justify-center mr-4">
                <BadgeCheck className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-brown-900">Exclusive Rights</h3>
            </div>
            <p className="text-brown-600">Single country exclusivity for 1 years with full brand authority</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-xl p-6 border border-brown-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-brown-100 flex items-center justify-center mr-4">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-brown-900">One-Time Fee</h3>
            </div>
            <p className="text-brown-600">USD 500 franchise fee - no recurring costs</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-xl p-6 border border-brown-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-brown-100 flex items-center justify-center mr-4">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-brown-900">Global Platform</h3>
            </div>
            <p className="text-brown-600">International recognition, support, and networking opportunities</p>
          </div>
        </div>

        {/* Desktop Layout: Sidebar + Main Content */}
        <div className="hidden lg:flex gap-8">
          {/* Left Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-xl p-6 border border-brown-300 sticky top-6">
              <h3 className="text-xl font-bold text-brown-900 mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-3 text-brown-700" />
                Quick Navigation
              </h3>
              <ul className="space-y-4">
                {[
                  { id: 'introduction', label: 'Introduction' },
                  { id: 'requirements', label: 'Requirements' },
                  { id: 'rights', label: 'Rights & Obligations' },
                  { id: 'operations', label: 'Operations' },
                  { id: 'support', label: 'Support' },
                  { id: 'termination', label: 'Termination' },
                ].map((item) => (
                  <li key={item.id}>
                    <a 
                      href={`#${item.id}`}
                      className="text-brown-700 hover:text-brown-900 transition-colors flex items-center group text-lg"
                    >
                      <div className="w-2 h-2 rounded-full bg-brown-400 mr-3 group-hover:bg-brown-600 transition-colors"></div>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8 pt-6 border-t border-brown-300">
                <p className="text-brown-600 mb-4">
                  Ready to start your journey?
                </p>
                <button
                  onClick={handleApplyNow}
                  className="block w-full bg-gradient-to-r from-brown-900 to-brown-800 text-white text-center py-4 rounded-lg hover:from-brown-800 hover:to-brown-700 transition-all font-bold text-lg"
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>

          {/* Main Content - Full width */}
          <div className="flex-1 max-w-5xl mx-auto">
            {/* Introduction */}
            <section id="introduction" className="bg-white rounded-xl shadow-xl p-8 md:p-10 border border-brown-300 mb-10">
              <div className="flex items-start mb-8">
                <div className="w-16 h-16 rounded-full bg-brown-100 flex items-center justify-center mr-6 flex-shrink-0">
                  <Crown className="w-8 h-8 text-brown-800" />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl md:text-4xl font-bold text-brown-900 mb-3">Introduction & Overview</h2>
                  <p className="text-brown-600 text-xl">Become the official representative in your country</p>
                </div>
              </div>
              
              <div className="space-y-6 text-brown-700 text-lg leading-relaxed">
                <p>
                  The <strong className="text-brown-900 text-xl">Classic Queen International National Director Franchise Program</strong> grants 
                  exclusive rights to qualified individuals or organizations to represent, promote, and organize 
                  Classic Queen International pageants within a specific country or territory.
                </p>
                <div className="bg-gradient-to-r from-amber-50 to-yellow-100 p-8 rounded-xl border-2 border-amber-400 mt-8">
                  <div className="flex items-start">
                    <Star className="w-8 h-8 text-gold-600 mr-4 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-bold text-brown-900 mb-3 text-2xl">Core Franchise Privilege:</p>
                      <p className="text-brown-800 text-lg">
                        Upon acquiring the National Director franchise for <strong className="text-brown-900 text-xl">USD 500</strong>, the holder automatically 
                        obtains the <strong className="text-brown-900 text-xl">exclusive right to host Classic Queen International pageants</strong> in their designated country 
                        and will present a candidate to compete in the international Classic Queen platform.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Requirements Section */}
            <section id="requirements" className="bg-white rounded-xl shadow-xl p-8 md:p-10 border border-brown-300 mb-10">
              <div className="flex items-start mb-8">
                <div className="w-16 h-16 rounded-full bg-brown-100 flex items-center justify-center mr-6 flex-shrink-0">
                  <Shield className="w-8 h-8 text-brown-800" />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl md:text-4xl font-bold text-brown-900 mb-3">Eligibility Requirements</h2>
                  <p className="text-brown-600 text-xl">Qualifications needed to become a National Director</p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-brown-900 flex items-center">
                    <CheckCircle className="w-7 h-7 text-green-600 mr-3" />
                    Mandatory Requirements
                  </h3>
                  <ul className="space-y-4 text-brown-700 text-lg">
                    {[
                      "Experience in event management or pageantry",
                      "Valid identification",
                      "Strong network in fashion, media, and beauty industries",
                      "Financial capability to organize national pageants"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start bg-brown-50 p-4 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-brown-700 text-white flex items-center justify-center mr-4 mt-1 text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className="pt-1">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-brown-900 flex items-center">
                    <Award className="w-7 h-7 text-gold-600 mr-3" />
                    Preferred Qualifications
                  </h3>
                  <ul className="space-y-4 text-brown-700 text-lg">
                    {[
                      "Previous pageant organization experience",
                      "Media connections and PR capabilities",
                      "Sponsorship acquisition experience",
                      "Experience with international competitions"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start bg-amber-50 p-4 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center mr-4 mt-1 text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className="pt-1">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Franchise Rights & Obligations */}
            <section id="rights" className="bg-white rounded-xl shadow-xl p-8 md:p-10 border border-brown-300 mb-10">
              <div className="flex items-start mb-8">
                <div className="w-16 h-16 rounded-full bg-brown-100 flex items-center justify-center mr-6 flex-shrink-0">
                  <Globe className="w-8 h-8 text-brown-800" />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl md:text-4xl font-bold text-brown-900 mb-3">Franchise Rights & Obligations</h2>
                  <p className="text-brown-600 text-xl">What you receive and what's expected of you</p>
                </div>
              </div>

              <div className="space-y-10">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-8 rounded-xl border-2 border-green-400">
                    <h3 className="text-2xl font-bold text-green-800 mb-6">National Director Rights</h3>
                    <ul className="space-y-4">
                      {[
                        "Exclusive rights to use Classic Queen International brand in designated country",
                        "Right to organize and host national pageants",
                        "Access to international training materials and guidelines",
                        "Right to select and present national winner to international competition",
                        "Use of official logos, marketing materials, and digital assets"
                      ].map((item, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-6 h-6 text-green-600 mr-4 mt-1 flex-shrink-0" />
                          <span className="text-brown-800 text-lg">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-sky-100 p-8 rounded-xl border-2 border-blue-400">
                    <h3 className="text-2xl font-bold text-blue-800 mb-6">National Director Obligations</h3>
                    <ul className="space-y-4">
                      {[
                        "Organize at least one national pageant per franchise period",
                        "Maintain brand standards and quality",
                        "Submit regular activity reports to headquarters",
                        "Pay annual franchise renewal fee (if applicable)",
                        "Adhere to international competition rules and timelines"
                      ].map((item, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-6 h-6 rounded-full bg-blue-600 mr-4 mt-1 flex-shrink-0 flex items-center justify-center">
                            <span className="text-white text-sm font-bold">✓</span>
                          </div>
                          <span className="text-brown-800 text-lg">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-brown-50 p-8 rounded-xl border-2 border-brown-400">
                  <h3 className="text-2xl font-bold text-brown-900 mb-6">Financial Structure</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center p-8 bg-white rounded-xl border-2 border-brown-300 shadow-lg hover:shadow-2xl transition-all">
                      <p className="text-brown-600 mb-3 text-lg">Initial Franchise Fee</p>
                      <p className="text-4xl font-bold text-brown-900">USD 500</p>
                    
                    </div>
                    <div className="text-center p-8 bg-white rounded-xl border-2 border-brown-300 shadow-lg hover:shadow-2xl transition-all">
                      <p className="text-brown-600 mb-3 text-lg">Renewal Fee</p>
                      <p className="text-4xl font-bold text-brown-900">USD 250</p>
                      <p className="text-brown-500 mt-3">Every 2 years</p>
                    </div>
                    <div className="text-center p-8 bg-white rounded-xl border-2 border-brown-300 shadow-lg hover:shadow-2xl transition-all">
                      <p className="text-4xl font-bold text-brown-900">15%</p>
                      <p className="text-brown-500 mt-3">Of national pageant profits</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Operational Framework */}
            <section id="operations" className="bg-white rounded-xl shadow-xl p-8 md:p-10 border border-brown-300 mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-brown-900 mb-8">Operational Framework</h2>
              
              <div className="space-y-10">
                <div>
                  <h3 className="text-2xl font-bold text-brown-900 mb-6">Hosting Requirements</h3>
                  <ul className="space-y-6 text-brown-700">
                    {[
                      "National pageant must meet minimum production standards set by headquarters",
                      "Contestants must meet Classic Queen International eligibility criteria", 
                      "All pageant activities must align with Classic Queen International values"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start bg-brown-50 p-6 rounded-xl border border-brown-200">
                        <div className="w-10 h-10 rounded-full bg-brown-900 text-white flex items-center justify-center mr-6 flex-shrink-0 text-lg font-bold">
                          {index + 1}
                        </div>
                        <span className="text-lg pt-2">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-violet-100 p-8 rounded-xl border-2 border-purple-400">
                  <div className="flex items-start">
                    <Trophy className="w-8 h-8 text-purple-600 mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-2xl font-bold text-purple-900 mb-4">
                        International Competition Participation
                      </h3>
                      <p className="text-purple-800 text-lg leading-relaxed">
                        The National Director <strong>must</strong> present the national winner to compete in the 
                        international Classic Queen platform. All expenses for the contestant's participation 
                        (travel, accommodation, entry fees) are the responsibility of the National Director or 
                        must be secured through sponsorships.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Support & Training */}
            <section id="support" className="bg-white rounded-xl shadow-xl p-8 md:p-10 border border-brown-300 mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-brown-900 mb-8">Support & Training Provided</h2>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <h3 className="text-2xl font-bold text-brown-900">From Headquarters</h3>
                  <div className="space-y-6">
                    <div className="flex items-start bg-white p-6 rounded-xl border-2 border-brown-200 hover:border-brown-400 transition-all">
                      <Award className="w-10 h-10 text-gold-600 mr-5 p-2 bg-gold-50 rounded-lg flex-shrink-0" />
                      <div>
                        <p className="font-bold text-brown-900 text-xl">Official Certification</p>
                        <p className="text-brown-600">Certified National Director credentials</p>
                      </div>
                    </div>
                    <div className="flex items-start bg-white p-6 rounded-xl border-2 border-brown-200 hover:border-brown-400 transition-all">
                      <FileText className="w-10 h-10 text-brown-600 mr-5 p-2 bg-brown-50 rounded-lg flex-shrink-0" />
                      <div>
                        <p className="font-bold text-brown-900 text-xl">Operations Manual</p>
                        <p className="text-brown-600">Complete guide to organizing pageants</p>
                      </div>
                    </div>
                    <div className="flex items-start bg-white p-6 rounded-xl border-2 border-brown-200 hover:border-brown-400 transition-all">
                      <Users className="w-10 h-10 text-brown-600 mr-5 p-2 bg-brown-50 rounded-lg flex-shrink-0" />
                      <div>
                        <p className="font-bold text-brown-900 text-xl">Mentorship Program</p>
                        <p className="text-brown-600">Access to experienced directors</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <h3 className="text-2xl font-bold text-brown-900">Marketing Support</h3>
                  <div className="space-y-6">
                    <div className="flex items-start bg-white p-6 rounded-xl border-2 border-brown-200 hover:border-brown-400 transition-all">
                      <Globe className="w-10 h-10 text-blue-600 mr-5 p-2 bg-blue-50 rounded-lg flex-shrink-0" />
                      <div>
                        <p className="font-bold text-brown-900 text-xl">Digital Assets Package</p>
                        <p className="text-brown-600">Logos, templates, promotional materials</p>
                      </div>
                    </div>
                    <div className="flex items-start bg-white p-6 rounded-xl border-2 border-brown-200 hover:border-brown-400 transition-all">
                      <Shield className="w-10 h-10 text-green-600 mr-5 p-2 bg-green-50 rounded-lg flex-shrink-0" />
                      <div>
                        <p className="font-bold text-brown-900 text-xl">Legal Framework</p>
                        <p className="text-brown-600">Contract templates and legal guidance</p>
                      </div>
                    </div>
                    <div className="flex items-start bg-white p-6 rounded-xl border-2 border-brown-200 hover:border-brown-400 transition-all">
                      <Crown className="w-10 h-10 text-purple-600 mr-5 p-2 bg-purple-50 rounded-lg flex-shrink-0" />
                      <div>
                        <p className="font-bold text-brown-900 text-xl">International Promotion</p>
                        <p className="text-brown-600">Feature on global platforms</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Termination & Renewal */}
            <section id="termination" className="bg-white rounded-xl shadow-xl p-8 md:p-10 border border-brown-300 mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-brown-900 mb-8">Termination & Renewal</h2>
              
              <div className="space-y-10">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                  <div className="bg-gradient-to-br from-red-50 to-pink-100 p-8 rounded-xl border-2 border-red-400">
                    <h3 className="text-2xl font-bold text-red-800 mb-6">Grounds for Termination</h3>
                    <ul className="space-y-4">
                      {[
                        "Failure to organize national pageant within franchise period",
                        "Brand misrepresentation or damage",
                        "Non-payment of fees or royalties",
                        "Legal violations or unethical conduct"
                      ].map((item, index) => (
                        <li key={index} className="flex items-start">
                          <XCircle className="w-6 h-6 text-red-600 mr-4 mt-1 flex-shrink-0" />
                          <span className="text-brown-800 text-lg">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-8 rounded-xl border-2 border-green-400">
                    <h3 className="text-2xl font-bold text-green-800 mb-6">Renewal Process</h3>
                    <ul className="space-y-4">
                      {[
                        "Automatic renewal option for performing directors",
                        "Reduced renewal fee for successful directors",
                        "Priority consideration for additional territories",
                        "Extended support for renewal candidates"
                      ].map((item, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-6 h-6 text-green-600 mr-4 mt-1 flex-shrink-0" />
                          <span className="text-brown-800 text-lg">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Bottom CTA */}
            <div className="bg-gradient-to-r from-brown-900 to-brown-800 rounded-2xl shadow-2xl p-10 md:p-12 text-center text-white mb-10">
              <h3 className="text-3xl md:text-5xl font-bold mb-6">Start Your Franchise Journey Today</h3>
              <p className="text-brown-200 mb-10 text-xl max-w-4xl mx-auto leading-relaxed">
                Join our global network of pageant professionals and bring Classic Queen International to your country.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button
                  onClick={handleApplyNow}
                  className="bg-gold-600 text-white font-bold py-5 px-12 rounded-xl hover:bg-gold-700 transition-all transform hover:scale-105 inline-flex items-center justify-center text-xl shadow-lg"
                >
                  <Crown className="w-7 h-7 mr-3" />
                  Apply Now - USD 500
                </button>
                <Link 
                  href="/contact" 
                  className="bg-white/10 text-white font-bold py-5 px-12 rounded-xl hover:bg-white/20 transition-all border-2 border-white/30 inline-flex items-center justify-center text-xl"
                >
                  <Users className="w-7 h-7 mr-3" />
                  Contact for Questions
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout - Stacked */}
        <div className="lg:hidden space-y-8">
          {/* Mobile Navigation */}
          <div className="bg-white rounded-xl shadow-xl p-6 border border-brown-300">
            <h3 className="text-xl font-bold text-brown-900 mb-4 flex items-center">
              <FileText className="w-6 h-6 mr-3 text-brown-700" />
              Quick Navigation
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'introduction', label: 'Introduction' },
                { id: 'requirements', label: 'Requirements' },
                { id: 'rights', label: 'Rights' },
                { id: 'operations', label: 'Operations' },
                { id: 'support', label: 'Support' },
                { id: 'termination', label: 'Termination' },
              ].map((item) => (
                <a 
                  key={item.id}
                  href={`#${item.id}`}
                  className="text-brown-700 hover:text-brown-900 transition-colors flex items-center justify-center text-center p-3 bg-brown-50 rounded-lg hover:bg-brown-100"
                >
                  <span className="text-sm font-medium">{item.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Mobile Sections (same content as desktop but stacked) */}
          {/* Introduction Mobile */}
          <section id="introduction" className="bg-white rounded-xl shadow-xl p-6 border border-brown-300">
            <div className="flex items-start mb-6">
              <div className="w-12 h-12 rounded-full bg-brown-100 flex items-center justify-center mr-4">
                <Crown className="w-6 h-6 text-brown-800" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-brown-900 mb-2">Introduction & Overview</h2>
                <p className="text-brown-600">Become the official representative in your country</p>
              </div>
            </div>
            <div className="space-y-4 text-brown-700">
              <p>The Classic Queen International National Director Franchise Program grants exclusive rights to qualified individuals or organizations.</p>
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-300">
                <p className="font-bold text-brown-900 mb-2">Core Franchise Privilege:</p>
                <p>USD 500 grants exclusive rights to host pageants and present candidates internationally.</p>
              </div>
            </div>
          </section>

          {/* Add other mobile sections here (simplified for brevity) */}
          {/* ... */}
          
          {/* Mobile CTA */}
          <div className="bg-gradient-to-r from-brown-900 to-brown-800 rounded-xl shadow-xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">Start Your Journey Today</h3>
            <p className="text-brown-200 mb-6">Join our global network of pageant professionals.</p>
            <div className="flex flex-col gap-4">
              <button
                onClick={handleApplyNow}
                className="bg-gold-600 text-white font-bold py-4 rounded-lg hover:bg-gold-700 transition-all"
              >
                Apply Now - USD 500
              </button>
              <Link 
                href="/contact" 
                className="bg-white/10 text-white font-bold py-4 rounded-lg hover:bg-white/20 transition-all border border-white/30"
              >
                Contact for Questions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FranchiseTerms