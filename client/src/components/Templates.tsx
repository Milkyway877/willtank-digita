import React from 'react'
import { motion } from 'framer-motion'
import { Building, Home, Globe, Sparkles, ArrowRight, ExternalLink } from 'lucide-react'

const Templates: React.FC = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  return (
    <section id="templates" className="py-20 bg-neutral-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">Will Templates</h2>
          <p className="mt-4 text-lg text-neutral-600">
            Choose from our collection of expert-crafted templates designed for different life situations, or let Skyler create a custom template just for you.
          </p>
        </motion.div>
        
        <motion.div 
          className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {/* Template 1 */}
          <motion.div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition" variants={item}>
            <div className="p-6">
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Home className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900">Basic Family Will</h3>
              <p className="mt-2 text-neutral-600">
                Perfect for individuals with straightforward assets and family structures. Covers essential property, guardianship, and basic bequests.
              </p>
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <div className="flex justify-between items-center">
                  <span className="text-primary-dark font-medium">Free</span>
                  <a href="#" className="text-neutral-600 hover:text-primary transition flex items-center">
                    Preview
                    <ExternalLink className="ml-1 h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Template 2 */}
          <motion.div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition" variants={item}>
            <div className="p-6">
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Building className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900">Business Owner Will</h3>
              <p className="mt-2 text-neutral-600">
                Designed for entrepreneurs with business assets, succession planning, and special considerations for ongoing operations.
              </p>
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <div className="flex justify-between items-center">
                  <span className="text-primary-dark font-medium">Premium</span>
                  <a href="#" className="text-neutral-600 hover:text-primary transition flex items-center">
                    Preview
                    <ExternalLink className="ml-1 h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Template 3 */}
          <motion.div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition" variants={item}>
            <div className="p-6">
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900">International Assets</h3>
              <p className="mt-2 text-neutral-600">
                For those with property or investments across multiple countries, ensuring compliant distribution across jurisdictions.
              </p>
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <div className="flex justify-between items-center">
                  <span className="text-primary-dark font-medium">Premium</span>
                  <a href="#" className="text-neutral-600 hover:text-primary transition flex items-center">
                    Preview
                    <ExternalLink className="ml-1 h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Template 4 */}
          <motion.div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition" variants={item}>
            <div className="p-6">
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900">Custom AI Template</h3>
              <p className="mt-2 text-neutral-600">
                Work with Skyler to create a fully customized will template tailored to your unique situation and specific needs.
              </p>
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <div className="flex justify-between items-center">
                  <span className="text-primary-dark font-medium">Premium+</span>
                  <a href="#" className="text-neutral-600 hover:text-primary transition flex items-center">
                    Learn More
                    <ExternalLink className="ml-1 h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <a href="#" className="inline-flex items-center px-6 py-3 bg-white border border-neutral-300 hover:border-primary text-neutral-700 hover:text-primary font-medium rounded-lg transition shadow-sm hover:shadow">
            View All Templates
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}

export default Templates
