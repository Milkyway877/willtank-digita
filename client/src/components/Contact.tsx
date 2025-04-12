import React from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MessageCircle } from 'lucide-react'

const Contact: React.FC = () => {
  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">Get in Touch</h2>
              <p className="mt-4 text-lg text-neutral-600">
                Have questions about WillTank or need personalized assistance? Our team is here to help you secure your legacy.
              </p>
              
              <div className="mt-8 space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-neutral-900">Email Us</h3>
                    <p className="mt-1 text-neutral-600">
                      Our support team usually responds within 24 hours.
                    </p>
                    <a href="mailto:support@willtank.com" className="mt-2 inline-block text-primary hover:text-primary-dark font-medium transition">support@willtank.com</a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-neutral-900">Phone Support</h3>
                    <p className="mt-1 text-neutral-600">
                      Available Monday to Friday, 9AM to 5PM EST.
                    </p>
                    <a href="tel:+18005551234" className="mt-2 inline-block text-primary hover:text-primary-dark font-medium transition">+1 (800) 555-1234</a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MessageCircle className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-neutral-900">Live Chat</h3>
                    <p className="mt-1 text-neutral-600">
                      Chat with Skyler or a human agent for instant assistance.
                    </p>
                    <a href="#" className="mt-2 inline-block text-primary hover:text-primary-dark font-medium transition">Start a conversation</a>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              className="bg-white rounded-xl p-8 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-2xl font-semibold text-neutral-900">Send Us a Message</h3>
              <p className="mt-2 text-neutral-600">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
              
              <form className="mt-6 space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-neutral-700">Full Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    className="mt-1 block w-full rounded-lg border-neutral-300 shadow-sm focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    className="mt-1 block w-full rounded-lg border-neutral-300 shadow-sm focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-neutral-700">Subject</label>
                  <input 
                    type="text" 
                    id="subject" 
                    name="subject" 
                    className="mt-1 block w-full rounded-lg border-neutral-300 shadow-sm focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-neutral-700">Message</label>
                  <textarea 
                    id="message" 
                    name="message" 
                    rows={4} 
                    className="mt-1 block w-full rounded-lg border-neutral-300 shadow-sm focus:ring-primary focus:border-primary"
                  ></textarea>
                </div>
                
                <div>
                  <button 
                    type="submit" 
                    className="w-full px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition shadow-md hover:shadow-lg"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact
