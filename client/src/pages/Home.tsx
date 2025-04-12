import React from 'react'
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

const Home: React.FC = () => {
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
