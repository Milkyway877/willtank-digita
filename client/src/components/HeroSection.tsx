import React from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Link } from 'wouter'
import { Globe } from '@/components/ui/globe'

const HeroSection: React.FC = () => {
  return (
    <section id="home" className="pt-32 pb-20 relative overflow-hidden bg-gradient-to-b from-blue-50/40 to-white/90">
      {/* Add extra decorative elements */}
      <div className="absolute -top-10 right-32 w-72 h-72 bg-blue-400 opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute top-40 -left-20 w-80 h-80 bg-purple-400 opacity-5 rounded-full blur-3xl"></div>
      
      {/* Globe background */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="w-full h-full">
          <Globe 
            className="scale-[2.2] translate-y-[5%]" 
            config={{
              width: 800,
              height: 800,
              onRender: () => {},
              devicePixelRatio: 2,
              phi: 0,
              theta: 0.3,
              dark: 0,
              diffuse: 1.2,
              mapSamples: 16000,
              mapBrightness: 6,
              baseColor: [0.3, 0.4, 1],
              markerColor: [251 / 255, 100 / 255, 21 / 255],
              glowColor: [0.2, 0.5, 1],
              markers: [
                { location: [14.5995, 120.9842], size: 0.08 },
                { location: [19.076, 72.8777], size: 0.15 },
                { location: [23.8103, 90.4125], size: 0.1 },
                { location: [30.0444, 31.2357], size: 0.12 },
                { location: [39.9042, 116.4074], size: 0.15 },
                { location: [-23.5505, -46.6333], size: 0.15 },
                { location: [19.4326, -99.1332], size: 0.15 },
                { location: [40.7128, -74.006], size: 0.15 },
                { location: [34.6937, 135.5022], size: 0.1 },
                { location: [41.0082, 28.9784], size: 0.12 },
              ],
            }}
          />
        </div>
      </div>
      
      {/* Gradient overlay to enhance content visibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/70 to-white/50 dark:from-black/40 dark:to-black/20 z-0"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight">
              Create Your <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Digital Will</span> with AI Guidance
            </h1>
            <p className="mt-6 text-lg text-neutral-600 max-w-lg">
              WillTank is a modern platform that makes creating, storing, and delivering your will simple and secure with AI assistant Skyler guiding you every step of the way.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/welcome" className="px-6 py-3 bg-gradient-to-r from-primary to-blue-500 hover:from-primary-dark hover:to-blue-600 text-white font-medium rounded-lg transition shadow-md hover:shadow-xl transform hover:-translate-y-0.5">
                Start Your Will
              </Link>
              <a 
                href="#how-it-works" 
                className="px-6 py-3 bg-white border border-neutral-300 hover:border-primary text-neutral-700 hover:text-primary font-medium rounded-lg transition shadow-sm hover:shadow"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                How It Works
              </a>
            </div>
            <div className="mt-8 flex items-center text-neutral-500">
              <div className="flex -space-x-2">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&w=80&h=80&crop=faces&fit=crop" className="w-10 h-10 rounded-full border-2 border-white" alt="User portrait" />
                <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&w=80&h=80&crop=faces&fit=crop" className="w-10 h-10 rounded-full border-2 border-white" alt="User portrait" />
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&w=80&h=80&crop=faces&fit=crop" className="w-10 h-10 rounded-full border-2 border-white" alt="User portrait" />
              </div>
              <span className="ml-4 text-sm">
                <span className="font-medium">5,000+</span> users already trust WillTank
              </span>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-300 bg-opacity-10 rounded-full filter blur-3xl"></div>
            <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-purple-300 bg-opacity-10 rounded-full filter blur-2xl"></div>
            <div className="relative animate-[float_6s_ease-in-out_infinite]">
              <lottie-player 
                src="https://assets10.lottiefiles.com/packages/lf20_ca8zbrdk.json" 
                background="transparent" 
                speed="1" 
                style={{ width: '100%', height: '400px' }} 
                loop 
                autoplay
              ></lottie-player>
            </div>
          </motion.div>
        </div>
      </div>
      
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 hidden md:block z-10">
        <a 
          href="#how-it-works" 
          className="text-neutral-400 hover:text-primary transition-colors"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <ChevronDown className="h-10 w-10 animate-bounce" />
        </a>
      </div>
    </section>
  )
}

export default HeroSection
