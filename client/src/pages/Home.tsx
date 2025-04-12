import React, { useEffect } from 'react'
import { useLocation } from 'wouter'
import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import HowItWorks from '@/components/HowItWorks'
import Features from '@/components/Features'
import Templates from '@/components/Templates'
import Testimonials from '@/components/Testimonials'
import FAQ from '@/components/FAQ'
import Contact from '@/components/Contact'
import BlogPreview from '@/components/BlogPreview'
import Footer from '@/components/Footer'
import ParticlesBackground from '@/components/ParticlesBackground'
import AnimatedAurora from '@/components/ui/AnimatedAurora'
import { useAuth } from '@/hooks/use-auth'

const Home: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // If user is logged in, redirect to appropriate page
  useEffect(() => {
    if (!isLoading && user) {
      setLocation('/redirect');
    }
  }, [user, isLoading, setLocation]);

  return (
    <div className="bg-white text-neutral-800 overflow-x-hidden">
      <Navbar />
      <AnimatedAurora />
      <ParticlesBackground />
      <HeroSection />
      <HowItWorks />
      <Features />
      <Templates />
      <Testimonials />
      <FAQ />
      <Contact />
      <BlogPreview />
      <Footer />
    </div>
  )
}

export default Home
