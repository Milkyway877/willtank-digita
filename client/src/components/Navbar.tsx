import React, { useState, useEffect } from 'react'
import { 
  Menu, 
  X, 
  Home, 
  Lightbulb, 
  LayoutGrid, 
  FileText, 
  Star, 
  HelpCircle, 
  Phone,
  LogIn,
  UserPlus 
} from 'lucide-react'
import { Link, useLocation } from 'wouter'
import { ExpandableTabs } from '@/components/ui/expandable-tabs'
import Logo from '@/components/ui/Logo'

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [selectedTab, setSelectedTab] = useState<number | null>(null)
  const [currentLocation, setLocation] = useLocation()

  // Don't show the navbar on auth or dashboard pages
  if (currentLocation.startsWith('/auth') || currentLocation.startsWith('/dashboard')) {
    return null
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const navItems = [
    { title: "Home", icon: Home },
    { title: "How It Works", icon: Lightbulb },
    { title: "Features", icon: LayoutGrid },
    { title: "Templates", icon: FileText },
    { type: "separator" as const },
    { title: "Testimonials", icon: Star },
    { title: "FAQ", icon: HelpCircle },
    { title: "Contact", icon: Phone },
  ]

  const authItems = [
    { title: "Login", icon: LogIn },
    { title: "Sign Up", icon: UserPlus },
  ]

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

  const handleNavItemClick = (index: number | null) => {
    if (index !== null) {
      const item = navItems[index]
      if (item.title) {
        // Map section titles to their actual IDs in the HTML
        const sectionIdMap: Record<string, string> = {
          "Home": "home",
          "How It Works": "how-it-works",
          "Features": "features",
          "Templates": "templates",
          "Testimonials": "testimonials",
          "FAQ": "faq",
          "Contact": "contact"
        }
        
        const sectionId = sectionIdMap[item.title] || item.title.toLowerCase().replace(/\s+/g, '-')
        scrollToSection(sectionId)
      }
    }
    setSelectedTab(index)
  }

  const handleAuthItemClick = (index: number | null) => {
    if (index === 0) {
      setLocation('/auth/sign-in')
    } else if (index === 1) {
      setLocation('/auth/sign-up')
    }
  }

  return (
    <header id="header" className={`fixed w-full z-50 transition-all duration-300 bg-white bg-opacity-90 backdrop-blur-sm ${isScrolled ? 'shadow-md' : ''}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <a href="#" className="flex items-center" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>
            <Logo size="md" withText={true} />
          </a>
          
          <div className="hidden md:block">
            <ExpandableTabs 
              tabs={navItems} 
              activeColor="text-primary"
              onChange={handleNavItemClick}
              className="border-gray-100"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <ExpandableTabs 
                tabs={authItems} 
                activeColor="text-primary"
                onChange={handleAuthItemClick}
                className="border-gray-100"
              />
            </div>
            <button 
              className="md:hidden text-neutral-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        <div className={`md:hidden pb-4 ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="flex flex-col space-y-4 mt-2">
            <ExpandableTabs 
              tabs={navItems} 
              activeColor="text-primary"
              onChange={handleNavItemClick}
              className="border-gray-100"
            />
            
            <div className="mt-4">
              <ExpandableTabs 
                tabs={authItems} 
                activeColor="text-primary"
                onChange={handleAuthItemClick}
                className="border-gray-100"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
