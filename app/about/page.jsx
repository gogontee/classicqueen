'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Crown, Users, Trophy, Globe, Heart, Star, 
  Award, Target, CheckCircle, Quote, 
  ChevronRight, Sparkles
} from 'lucide-react'
import Image from 'next/image'

export default function AboutPage() {
  const router = useRouter()
  const [activeAccordion, setActiveAccordion] = useState(null)

  const toggleAccordion = (id) => {
    setActiveAccordion(activeAccordion === id ? null : id)
  }

  const values = [
    {
      icon: Crown,
      title: 'Elegance & Class',
      description: 'Celebrating timeless beauty, grace, and sophistication in every aspect of our pageant.'
    },
    {
      icon: Target,
      title: 'Purpose & Impact',
      description: 'Empowering women to achieve their dreams and make a positive impact in their communities.'
    },
    {
      icon: Globe,
      title: 'Global Excellence',
      description: 'Embracing diversity and creating opportunities for women from all backgrounds worldwide.'
    },
    {
      icon: Heart,
      title: 'Social Responsibility',
      description: 'Fostering compassion, leadership, and community service as core values.'
    },
    {
      icon: Users,
      title: 'Sisterhood',
      description: 'Building lifelong connections and supportive networks among our queens.'
    },
    {
      icon: Trophy,
      title: 'Legacy Building',
      description: 'Creating enduring impact and inspiring future generations of women leaders.'
    }
  ]

  const pillars = [
    {
      icon: Sparkles,
      title: 'Beauty with Purpose',
      description: 'Beyond physical appearance, we celebrate intelligence, character, and meaningful contributions to society.',
      color: 'from-brown-600 to-cyan-500'
    },
    {
      icon: Award,
      title: 'Leadership Development',
      description: 'Providing training, mentorship, and platforms for our queens to become confident leaders and influencers.',
      color: 'from-brown-500 to-cyan-500'
    },
    {
      icon: Globe,
      title: 'Cultural Excellence',
      description: 'Promoting cultural understanding, international diplomacy, and global sisterhood.',
      color: 'from-brown-500 to-teal-500'
    },
    {
      icon: Heart,
      title: 'Humanitarian Advocacy',
      description: 'Supporting charitable causes and empowering queens to become agents of positive change.',
      color: 'from-brown-500 to-red-500'
    }
  ]

  const logoUrl = "https://prolgmzklxddnizyhqau.supabase.co/storage/v1/object/public/classic/Untitled%20design%20(2).png"

  const handleStartJourney = () => {
    router.push('/register')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-amber-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-brown-900 via-brown-800 to-amber-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, white 2%, transparent 2%), radial-gradient(circle at 75px 75px, white 2%, transparent 2%)`,
            backgroundSize: '100px 100px'
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full mb-8 border border-white/20 shadow-lg">
                <div className="relative w-16 h-16">
                  <Image
                    src={logoUrl}
                    alt="Classic Queen International Logo"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gold-400 leading-tight">
                Classic Queen International
              </h1>
              <p className="text-xl md:text-2xl text-gold-400 mb-8 max-w-4xl mx-auto font-light">
                Celebrating beauty with purpose, intelligence, and cultural excellence
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <h2 className="text-2xl font-bold text-amber-300 mb-4">Our Essence</h2>
                  <p className="text-amber-100 text-lg">
                    Classic Queen International is a prestigious global platform created to celebrate 
                    beauty with purpose, intelligence, and cultural excellence. Beyond glamour and the crown, 
                    we are dedicated to empowering young women to become confident leaders, influential voices, 
                    and agents of positive change in their communities and across the world.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-amber-900/30 to-brown-900/30 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20">
                  <Quote className="h-8 w-8 text-amber-300 mb-4" />
                  <p className="text-xl italic text-amber-100 mb-4">
                    "We do not just crown winners — we build icons, leaders, and timeless queens."
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <h2 className="text-2xl font-bold text-amber-300 mb-4">Our Platform</h2>
                  <p className="text-amber-100 text-lg">
                    We promote grace, confidence, discipline, social responsibility, and international sisterhood. 
                    Our platform provides contestants with opportunities for personal development, leadership training, 
                    media exposure, and humanitarian advocacy, ensuring that every queen represents not just beauty, 
                    but substance and impact.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-brown-900/40 to-amber-900/40 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center space-x-3 mb-3">
                    <Star className="h-5 w-5 text-amber-300" />
                    <h3 className="text-lg font-bold text-white">What We Stand For</h3>
                  </div>
                  <p className="text-amber-100">
                    Classic Queen International stands for elegance, class, and integrity, 
                    nurturing queens who are poised, articulate, and socially conscious. 
                    Through meaningful projects, partnerships, and global representation, 
                    our queens use their influence to inspire hope, promote unity, and create lasting change.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Vision Section */}
      <div className="relative py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl mb-6 shadow-lg">
                <Target className="h-8 w-8 text-amber-600" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-brown-900 mb-4">
                Our Guiding Principles
              </h2>
              <p className="text-brown-600 max-w-3xl mx-auto text-lg">
                The foundation upon which we build our legacy
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-600 to-brown-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                <div className="relative bg-gradient-to-br from-white to-amber-50 rounded-2xl p-8 shadow-xl">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl flex items-center justify-center shadow-lg">
                      <Target className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-brown-900">Mission Statement</h3>
                  </div>
                  <p className="text-brown-700 text-lg leading-relaxed">
                    To empower women through a prestigious global beauty platform that nurtures confidence, 
                    intelligence, leadership, and social responsibility, transforming queens into influential 
                    ambassadors of positive change.
                  </p>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-brown-600 to-amber-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                <div className="relative bg-gradient-to-br from-white to-amber-50 rounded-2xl p-8 shadow-xl">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-brown-600 to-brown-700 rounded-xl flex items-center justify-center shadow-lg">
                      <Star className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-brown-900">Vision Statement</h3>
                  </div>
                  <p className="text-brown-700 text-lg leading-relaxed">
                    To be a world-class international beauty pageant recognized for excellence, 
                    integrity, and impact — producing timeless queens who inspire, lead, and 
                    uplift communities globally.
                  </p>
                </div>
              </div>
            </div>

            {/* Four Pillars */}
            <div className="mb-16">
              <div className="text-center mb-12">
                <h3 className="text-2xl md:text-3xl font-bold text-brown-900 mb-4">
                  Our Four Pillars of Excellence
                </h3>
                <p className="text-brown-600 max-w-3xl mx-auto">
                  The cornerstones that define the Classic Queen International experience
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {pillars.map((pillar, index) => {
                  const Icon = pillar.icon
                  return (
                    <div key={index} className="group">
                      <div className="relative h-full">
                        <div className={`absolute -inset-0.5 bg-gradient-to-r ${pillar.color} rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300`}></div>
                        <div className="relative h-full bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                          <div className={`w-14 h-14 bg-gradient-to-br ${pillar.color} rounded-xl flex items-center justify-center mb-6 shadow-md`}>
                            <Icon className="h-7 w-7 text-white" />
                          </div>
                          <h4 className="text-xl font-bold text-brown-900 mb-3">{pillar.title}</h4>
                          <p className="text-brown-600">{pillar.description}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Core Values */}
            <div>
              <div className="text-center mb-12">
                <h3 className="text-2xl md:text-3xl font-bold text-brown-900 mb-4">
                  Our Core Values
                </h3>
                <p className="text-brown-600 max-w-3xl mx-auto">
                  The principles that guide every decision and interaction at Classic Queen International
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {values.map((value, index) => {
                  const Icon = value.icon
                  return (
                    <div key={index} className="group">
                      <div className="relative h-full bg-gradient-to-br from-white to-amber-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-amber-100 hover:border-amber-200">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600 rounded-xl flex items-center justify-center shadow-sm">
                            <Icon size={24} />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-brown-900 mb-2">{value.title}</h4>
                            <p className="text-brown-600 text-sm">{value.description}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Impact & Legacy Section */}
      <div className="bg-gradient-to-b from-amber-50 to-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brown-100 to-brown-50 rounded-2xl mb-6 shadow-lg">
                <Trophy className="h-8 w-8 text-brown-600" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-brown-900 mb-4">
                Creating Lasting Impact
              </h2>
              <p className="text-brown-600 max-w-3xl mx-auto text-lg">
                How Classic Queen International transforms lives and communities
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-brown-900">Personal Transformation</h3>
                  </div>
                  <p className="text-brown-700">
                    Through our comprehensive training programs, contestants develop confidence, 
                    communication skills, and leadership abilities that serve them long after the competition ends.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-brown-500 to-brown-600 rounded-lg flex items-center justify-center">
                      <Globe className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-brown-900">Global Influence</h3>
                  </div>
                  <p className="text-brown-700">
                    Our queens become ambassadors for positive change, representing their countries 
                    with pride and working on international initiatives that address pressing global challenges.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-700 rounded-lg flex items-center justify-center">
                      <Heart className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-brown-900">Community Engagement</h3>
                  </div>
                  <p className="text-brown-700">
                    Each contestant develops and implements a social impact project, creating 
                    tangible benefits for their communities and inspiring others to make a difference.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="bg-gradient-to-br from-brown-900 to-amber-900 rounded-2xl p-8 text-white shadow-2xl">
                  <div className="text-center mb-8">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <Image
                        src={logoUrl}
                        alt="Classic Queen International Logo"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">The Classic Queen Difference</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-amber-300" />
                      </div>
                      <div>
                        <h4 className="font-bold text-amber-200 mb-1">Holistic Development</h4>
                        <p className="text-amber-100 text-sm">
                          We focus on mind, body, and spirit — developing complete women ready to lead.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-amber-300" />
                      </div>
                      <div>
                        <h4 className="font-bold text-amber-200 mb-1">Lifelong Network</h4>
                        <p className="text-amber-100 text-sm">
                          Join a global sisterhood of empowered women supporting each other's growth.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center">
                        <Award className="h-4 w-4 text-amber-300" />
                      </div>
                      <div>
                        <h4 className="font-bold text-amber-200 mb-1">Career Advancement</h4>
                        <p className="text-amber-100 text-sm">
                          Media exposure, networking opportunities, and brand partnerships for career growth.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center">
                        <Globe className="h-4 w-4 text-amber-300" />
                      </div>
                      <div>
                        <h4 className="font-bold text-amber-200 mb-1">International Platform</h4>
                        <p className="text-amber-100 text-sm">
                          Represent your country on a world stage and make your voice heard globally.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA - Reduced gap */}
      <div className="container mx-auto px-4 pt-8 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-600 to-brown-600 rounded-3xl blur-2xl opacity-20"></div>
            <div className="relative bg-gradient-to-br from-brown-800 to-amber-900 rounded-2xl p-8 md:p-12 text-white shadow-2xl">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <Image
                  src={logoUrl}
                  alt="Classic Queen International Logo"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Become a Classic Queen
              </h2>
              <p className="text-xl text-amber-200 mb-8 max-w-2xl mx-auto">
                Join our prestigious platform and begin your journey to becoming a timeless queen 
                who leads with grace, intelligence, and purpose.
              </p>
              <div className="flex justify-center">
                <button 
                  onClick={handleStartJourney}
                  className="px-10 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-brown-900 font-bold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center group"
                >
                  Start Your Journey
                  <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}