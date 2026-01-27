// app/franchiseterms/page.js
'use client'

import { Shield, Globe, Crown, Award, Users, FileText, CheckCircle, XCircle, Star, Target, Trophy, BadgeCheck, ChevronRight, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useRef } from 'react'

const FranchiseTerms = () => {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('introduction')
  const navRef = useRef(null)

  const handleApplyNow = () => {
    router.push('/register')
  }

  const handleViewTerms = () => {
    router.push('/terms')
  }

  const scrollNav = (direction) => {
    if (navRef.current) {
      const scrollAmount = 200
      navRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const navItems = [
    { id: 'introduction', label: 'Introduction', icon: Crown },
    { id: 'requirements', label: 'Requirements', icon: Shield },
    { id: 'rights', label: 'Rights', icon: Globe },
    { id: 'operations', label: 'Operations', icon: Target },
    { id: 'support', label: 'Support', icon: Users },
    { id: 'termination', label: 'Termination', icon: FileText },
    { id: 'apply', label: 'Apply Now', icon: Star }
  ]

  const sectionContent = {
    introduction: (
      <div className="space-y-6">
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
          <p className="text-lg">
            The <strong className="text-brown-900">Classic Queen International National Director Franchise Program</strong> grants 
            exclusive rights to qualified individuals or organizations to represent, promote, and organize 
            Classic Queen International pageants within a specific country or territory.
          </p>
          
          <div className="bg-gradient-to-r from-amber-50 to-yellow-100 p-6 rounded-xl border-2 border-amber-400 mt-4">
            <div className="flex items-start">
              <Star className="w-6 h-6 text-gold-600 mr-4 flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-brown-900 mb-2 text-xl">Core Franchise Privilege:</p>
                <p className="text-brown-800">
                  Upon acquiring the National Director franchise for <strong className="text-brown-900">USD 500</strong>, the holder automatically 
                  obtains the <strong className="text-brown-900">exclusive right to host Classic Queen International pageants</strong> in their designated country 
                  and will present a candidate to compete in the international Classic Queen platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),

    requirements: (
      <div className="space-y-6">
        <div className="flex items-start mb-6">
          <div className="w-12 h-12 rounded-full bg-brown-100 flex items-center justify-center mr-4">
            <Shield className="w-6 h-6 text-brown-800" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-brown-900 mb-2">Eligibility Requirements</h2>
            <p className="text-brown-600">Qualifications needed to become a National Director</p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-bold text-brown-900 mb-4 flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
              Mandatory Requirements
            </h3>
            <ul className="space-y-3">
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

          <div>
            <h3 className="text-xl font-bold text-brown-900 mb-4 flex items-center">
              <Award className="w-6 h-6 text-gold-600 mr-3" />
              Preferred Qualifications
            </h3>
            <ul className="space-y-3">
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
      </div>
    ),

    rights: (
      <div className="space-y-6">
        <div className="flex items-start mb-6">
          <div className="w-12 h-12 rounded-full bg-brown-100 flex items-center justify-center mr-4">
            <Globe className="w-6 h-6 text-brown-800" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-brown-900 mb-2">Franchise Rights & Obligations</h2>
            <p className="text-brown-600">What you receive and what's expected of you</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl border-2 border-green-400">
            <h3 className="text-xl font-bold text-green-800 mb-4">National Director Rights</h3>
            <ul className="space-y-3">
              {[
                "Exclusive rights to use Classic Queen International brand",
                "Right to organize and host national pageants",
                "Access to international training materials",
                "Right to select and present national winner",
                "Use of official logos and marketing materials"
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-brown-800">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-sky-100 p-6 rounded-xl border-2 border-blue-400">
            <h3 className="text-xl font-bold text-blue-800 mb-4">National Director Obligations</h3>
            <ul className="space-y-3">
              {[
                "Organize at least one national pageant per year",
                "Maintain brand standards and quality",
                "Submit regular activity reports",
                "Pay annual franchise renewal fee",
                "Adhere to international competition rules"
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-5 h-5 rounded-full bg-blue-600 mr-3 mt-1 flex-shrink-0 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <span className="text-brown-800">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-brown-50 p-6 rounded-xl border-2 border-brown-400">
            <h3 className="text-xl font-bold text-brown-900 mb-4">Financial Structure</h3>
            <div className="space-y-4">
              <div className="text-center p-4 bg-white rounded-xl border-2 border-brown-300 shadow">
                <p className="text-brown-600 mb-2">Initial Franchise Fee</p>
                <p className="text-3xl font-bold text-brown-900">USD 500</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl border-2 border-brown-300 shadow">
                <p className="text-brown-600 mb-2">Renewal Fee</p>
                <p className="text-3xl font-bold text-brown-900">USD 250</p>
                <p className="text-brown-500 mt-2">Every year</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),

    operations: (
      <div className="space-y-6">
        <div className="flex items-start mb-6">
          <div className="w-12 h-12 rounded-full bg-brown-100 flex items-center justify-center mr-4">
            <Target className="w-6 h-6 text-brown-800" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-brown-900 mb-2">Operational Framework</h2>
            <p className="text-brown-600">Pageant hosting requirements and processes</p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-bold text-brown-900 mb-4">Hosting Requirements</h3>
            <ul className="space-y-4">
              {[
                "National pageant must meet minimum production standards",
                "Contestants must meet Classic Queen eligibility criteria", 
                "All activities must align with Classic Queen International values",
                "Timely submission of participant documentation"
              ].map((item, index) => (
                <li key={index} className="flex items-start bg-brown-50 p-4 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-brown-900 text-white flex items-center justify-center mr-4 flex-shrink-0 text-sm font-bold">
                    {index + 1}
                  </div>
                  <span className="pt-1">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-violet-100 p-6 rounded-xl border-2 border-purple-400">
            <div className="flex items-start">
              <Trophy className="w-6 h-6 text-purple-600 mr-4 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-purple-900 mb-3">
                  International Competition
                </h3>
                <p className="text-purple-800">
                  The National Director <strong>must</strong> present the national winner to compete internationally. 
                  All expenses (travel, camp fees) are the responsibility of the National Director or 
                  must be secured through sponsorships.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),

    support: (
      <div className="space-y-6">
        <div className="flex items-start mb-6">
          <div className="w-12 h-12 rounded-full bg-brown-100 flex items-center justify-center mr-4">
            <Users className="w-6 h-6 text-brown-800" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-brown-900 mb-2">Support & Training</h2>
            <p className="text-brown-600">Comprehensive support from headquarters</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-brown-900 mb-4">From Headquarters</h3>
            <div className="space-y-4">
              <div className="flex items-start bg-white p-4 rounded-xl border-2 border-brown-200">
                <Award className="w-8 h-8 text-gold-600 mr-4 p-2 bg-gold-50 rounded-lg flex-shrink-0" />
                <div>
                  <p className="font-bold text-brown-900">Official Certification</p>
                  <p className="text-brown-600 text-sm">Certified National Director credentials</p>
                </div>
              </div>
              <div className="flex items-start bg-white p-4 rounded-xl border-2 border-brown-200">
                <FileText className="w-8 h-8 text-brown-600 mr-4 p-2 bg-brown-50 rounded-lg flex-shrink-0" />
                <div>
                  <p className="font-bold text-brown-900">Operations Manual</p>
                  <p className="text-brown-600 text-sm">Complete guide to organizing pageants</p>
                </div>
              </div>
              <div className="flex items-start bg-white p-4 rounded-xl border-2 border-brown-200">
                <Users className="w-8 h-8 text-brown-600 mr-4 p-2 bg-brown-50 rounded-lg flex-shrink-0" />
                <div>
                  <p className="font-bold text-brown-900">Mentorship Program</p>
                  <p className="text-brown-600 text-sm">Access to experienced directors</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-brown-900 mb-4">Marketing Support</h3>
            <div className="space-y-4">
              <div className="flex items-start bg-white p-4 rounded-xl border-2 border-brown-200">
                <Globe className="w-8 h-8 text-blue-600 mr-4 p-2 bg-blue-50 rounded-lg flex-shrink-0" />
                <div>
                  <p className="font-bold text-brown-900">Digital Assets</p>
                  <p className="text-brown-600 text-sm">Logos, templates, promotional materials</p>
                </div>
              </div>
              <div className="flex items-start bg-white p-4 rounded-xl border-2 border-brown-200">
                <Shield className="w-8 h-8 text-green-600 mr-4 p-2 bg-green-50 rounded-lg flex-shrink-0" />
                <div>
                  <p className="font-bold text-brown-900">Legal Framework</p>
                  <p className="text-brown-600 text-sm">Contract templates and guidance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),

    termination: (
      <div className="space-y-6">
        <div className="flex items-start mb-6">
          <div className="w-12 h-12 rounded-full bg-brown-100 flex items-center justify-center mr-4">
            <FileText className="w-6 h-6 text-brown-800" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-brown-900 mb-2">Termination & Renewal</h2>
            <p className="text-brown-600">Franchise terms and renewal process</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-red-50 to-pink-100 p-6 rounded-xl border-2 border-red-400">
            <h3 className="text-xl font-bold text-red-800 mb-4">Grounds for Termination</h3>
            <ul className="space-y-3">
              {[
                "Failure to organize national pageant",
                "Brand misrepresentation or damage",
                "Non-payment of franchise fees",
                "Legal violations or unethical conduct"
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <XCircle className="w-5 h-5 text-red-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-brown-800">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl border-2 border-green-400">
            <h3 className="text-xl font-bold text-green-800 mb-4">Renewal Process</h3>
            <ul className="space-y-3">
              {[
                "Automatic renewal for performing directors",
                "Reduced renewal fee for successful directors",
                "Priority consideration for additional territories",
                "Extended support for renewal Directors"
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-brown-800">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    ),

    apply: (
      <div className="space-y-6">
        <div className="flex items-start mb-6">
          <div className="w-12 h-12 rounded-full bg-brown-100 flex items-center justify-center mr-4">
            <Star className="w-6 h-6 text-brown-800" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-brown-900 mb-2">Ready to Apply?</h2>
            <p className="text-brown-600">Start your franchise journey today</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-brown-900 to-brown-800 rounded-xl shadow-xl p-6 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Start Your Franchise Journey</h3>
          <p className="text-brown-200 mb-6">
            Join our global network of pageant professionals and bring Classic Queen International to your country.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={handleApplyNow}
              className="w-full bg-gold-600 text-white font-bold py-4 rounded-lg hover:bg-gold-700 transition-all flex items-center justify-center"
            >
              <Crown className="w-5 h-5 mr-2" />
              Apply Now - USD 500
            </button>
            
            <Link 
              href="/contact" 
              className="w-full bg-white/10 text-white font-bold py-4 rounded-lg hover:bg-white/20 transition-all border border-white/30 flex items-center justify-center"
            >
              <Users className="w-5 h-5 mr-2" />
              Contact for Questions
            </Link>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/20">
            <h4 className="font-bold mb-3">Quick Stats</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-3 rounded-lg">
                <p className="text-sm text-brown-200">Exclusive Rights</p>
                <p className="text-xl font-bold">1 Country</p>
              </div>
              <div className="bg-white/10 p-3 rounded-lg">
                <p className="text-sm text-brown-200">Duration</p>
                <p className="text-xl font-bold">1 Year</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 lg:mb-16">
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

        {/* Desktop Layout */}
        <div className="hidden lg:flex gap-8">
          {/* Left Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-xl p-6 border border-brown-300 sticky top-6">
              <h3 className="text-xl font-bold text-brown-900 mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-3 text-brown-700" />
                Quick Navigation
              </h3>
              <ul className="space-y-4">
                {navItems.slice(0, -1).map((item) => (
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

          {/* Desktop Main Content */}
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
                      <p className="text-brown-500 mt-3">Every years</p>
                    </div>
                    <div className="text-center p-8 bg-white rounded-xl border-2 border-brown-300 shadow-lg hover:shadow-2xl transition-all">
                      <p className="text-4xl font-bold text-brown-900">0%</p>
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
                        (travel, camp fees) are the responsibility of the National Director or 
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
                        "Non-payment of yearly franchise fee",
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
                        "Extended support for renewal Directors"
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

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-8">
          {/* Mobile Navigation with Scroll Arrows */}
          <div className="relative">
            <div className="flex items-center">
              <button 
                onClick={() => scrollNav('left')}
                className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg border border-brown-300 mr-2 flex-shrink-0 z-10"
              >
                <ChevronLeft className="w-5 h-5 text-brown-700" />
              </button>
              
              <div 
                ref={navRef}
                className="flex space-x-2 overflow-x-auto scrollbar-hide py-2 px-1 flex-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`flex items-center px-4 py-3 rounded-lg whitespace-nowrap transition-all flex-shrink-0 ${
                        activeSection === item.id 
                          ? 'bg-brown-900 text-white shadow-lg' 
                          : 'bg-white text-brown-700 border border-brown-300 hover:bg-brown-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mr-2 ${activeSection === item.id ? 'text-gold-400' : 'text-brown-500'}`} />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  )
                })}
              </div>
              
              <button 
                onClick={() => scrollNav('right')}
                className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg border border-brown-300 ml-2 flex-shrink-0 z-10"
              >
                <ChevronRight className="w-5 h-5 text-brown-700" />
              </button>
            </div>
            
            {/* Scroll indicator dots */}
            <div className="flex justify-center space-x-1 mt-4">
              {navItems.map((item) => (
                <div 
                  key={item.id}
                  className={`w-2 h-2 rounded-full transition-all ${
                    activeSection === item.id ? 'bg-brown-900 scale-125' : 'bg-brown-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Mobile Content Area */}
          <div className="bg-white rounded-xl shadow-xl p-6 border border-brown-300 min-h-[500px] transition-all duration-300">
            {sectionContent[activeSection] || (
              <div className="flex items-center justify-center h-64">
                <p className="text-brown-500">Select a section to view content</p>
              </div>
            )}
          </div>

          {/* Mobile Bottom CTA */}
          <div className="bg-gradient-to-r from-brown-900 to-brown-800 rounded-xl shadow-xl p-6 text-center text-white">
            <h3 className="text-xl font-bold mb-3">Ready to Become a National Director?</h3>
            <p className="text-brown-200 mb-4">Join our global network today</p>
            <button
              onClick={handleApplyNow}
              className="w-full bg-gold-600 text-white font-bold py-3 rounded-lg hover:bg-gold-700 transition-all mb-3 flex items-center justify-center"
            >
              <Crown className="w-5 h-5 mr-2" />
              Apply Now - USD 500
            </button>
            <Link 
              href="/contact" 
              className="w-full bg-white/10 text-white font-bold py-3 rounded-lg hover:bg-white/20 transition-all border border-white/30 flex items-center justify-center"
            >
              <Users className="w-5 h-5 mr-2" />
              Have Questions?
            </Link>
          </div>
        </div>
      </div>
      
      {/* Hide scrollbar styles */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

export default FranchiseTerms