import React, { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false)
    const element = document.getElementById(id)
    if (element) {
      const offset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <header id="header" className={`fixed w-full z-50 transition-all duration-300 bg-white bg-opacity-90 backdrop-blur-sm ${isScrolled ? 'shadow-md' : ''}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <a href="#" className="flex items-center space-x-2" onClick={() => scrollToSection('home')}>
            <span className="text-primary font-bold text-2xl">WillTank</span>
          </a>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#home" className="text-neutral-600 hover:text-primary font-medium transition" onClick={(e) => { e.preventDefault(); scrollToSection('home') }}>Home</a>
            <a href="#how-it-works" className="text-neutral-600 hover:text-primary font-medium transition" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works') }}>How It Works</a>
            <a href="#features" className="text-neutral-600 hover:text-primary font-medium transition" onClick={(e) => { e.preventDefault(); scrollToSection('features') }}>Features</a>
            <a href="#templates" className="text-neutral-600 hover:text-primary font-medium transition" onClick={(e) => { e.preventDefault(); scrollToSection('templates') }}>Templates</a>
            <a href="#testimonials" className="text-neutral-600 hover:text-primary font-medium transition" onClick={(e) => { e.preventDefault(); scrollToSection('testimonials') }}>Testimonials</a>
            <a href="#faq" className="text-neutral-600 hover:text-primary font-medium transition" onClick={(e) => { e.preventDefault(); scrollToSection('faq') }}>FAQ</a>
            <a href="#contact" className="text-neutral-600 hover:text-primary font-medium transition" onClick={(e) => { e.preventDefault(); scrollToSection('contact') }}>Contact</a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <a href="#" className="hidden md:inline-block px-4 py-2 text-primary hover:text-primary-dark font-medium transition">Login</a>
            <a href="#" className="hidden md:inline-block px-5 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition shadow-md hover:shadow-lg">Get Started</a>
            <button 
              className="md:hidden text-neutral-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        <div className={`md:hidden pb-4 ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="flex flex-col space-y-3">
            <a href="#home" className="text-neutral-600 hover:text-primary font-medium transition py-2" onClick={(e) => { e.preventDefault(); scrollToSection('home') }}>Home</a>
            <a href="#how-it-works" className="text-neutral-600 hover:text-primary font-medium transition py-2" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works') }}>How It Works</a>
            <a href="#features" className="text-neutral-600 hover:text-primary font-medium transition py-2" onClick={(e) => { e.preventDefault(); scrollToSection('features') }}>Features</a>
            <a href="#templates" className="text-neutral-600 hover:text-primary font-medium transition py-2" onClick={(e) => { e.preventDefault(); scrollToSection('templates') }}>Templates</a>
            <a href="#testimonials" className="text-neutral-600 hover:text-primary font-medium transition py-2" onClick={(e) => { e.preventDefault(); scrollToSection('testimonials') }}>Testimonials</a>
            <a href="#faq" className="text-neutral-600 hover:text-primary font-medium transition py-2" onClick={(e) => { e.preventDefault(); scrollToSection('faq') }}>FAQ</a>
            <a href="#contact" className="text-neutral-600 hover:text-primary font-medium transition py-2" onClick={(e) => { e.preventDefault(); scrollToSection('contact') }}>Contact</a>
            <div className="pt-2 flex flex-col space-y-3">
              <a href="#" className="px-4 py-2 text-primary border border-primary text-center font-medium rounded-lg transition">Login</a>
              <a href="#" className="px-4 py-2 bg-primary text-white text-center font-medium rounded-lg transition shadow-md">Get Started</a>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
