import React from 'react'
import { Twitter, Linkedin, Instagram } from 'lucide-react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <a href="#" className="inline-block">
              <h2 className="text-2xl font-bold">WillTank</h2>
            </a>
            <p className="mt-4 text-neutral-300 max-w-md">
              The future of estate planning. Create, store, and deliver your will with AI guidance, ensuring your legacy is protected and your wishes are fulfilled.
            </p>
            <div className="mt-8 flex space-x-4">
              <a href="#" className="text-white hover:text-cyan-400 transition">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-white hover:text-cyan-400 transition">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-6 w-6" />
              </a>
              <a href="#" className="text-white hover:text-cyan-400 transition">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          {/* Links 1 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-neutral-300 hover:text-white transition">About WillTank</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white transition">Our Team</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white transition">Careers</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white transition">Press</a></li>
              <li><a href="#blog" className="text-neutral-300 hover:text-white transition">Blog</a></li>
            </ul>
          </div>
          
          {/* Links 2 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-neutral-300 hover:text-white transition">Help Center</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white transition">Estate Planning Guide</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white transition">Legal Dictionary</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white transition">Terms of Use</a></li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
            <p className="text-neutral-300 mb-4">
              Subscribe to our newsletter for the latest updates on estate planning and digital will innovations.
            </p>
            <form className="space-y-2">
              <div>
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <input 
                  id="email-address" 
                  name="email" 
                  type="email" 
                  autoComplete="email" 
                  required 
                  className="w-full px-4 py-2 text-neutral-800 bg-white rounded-md focus:ring-2 focus:ring-primary focus:outline-none" 
                  placeholder="Your email address"
                />
              </div>
              <div>
                <button 
                  type="submit" 
                  className="w-full px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-md transition shadow-md hover:shadow-lg"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-neutral-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-400 text-sm">
              &copy; {new Date().getFullYear()} WillTank. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className="text-neutral-400 hover:text-white text-sm">Privacy Policy</a>
              <a href="#" className="text-neutral-400 hover:text-white text-sm">Terms of Service</a>
              <a href="#" className="text-neutral-400 hover:text-white text-sm">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
