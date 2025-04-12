import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const BlogPreview: React.FC = () => {
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
    <section id="blog" className="py-20 bg-neutral-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">Latest from Our Blog</h2>
          <p className="mt-4 text-lg text-neutral-600">
            Stay informed with the latest articles on estate planning, digital wills, and legal updates.
          </p>
        </motion.div>
        
        <motion.div 
          className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {/* Blog Post 1 */}
          <motion.div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition" variants={item}>
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
              alt="Why Every Young Adult Needs a Will" 
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="text-sm text-neutral-500 mb-2">May 12, 2023</div>
              <h3 className="text-xl font-semibold text-neutral-900">Why Every Young Adult Needs a Will</h3>
              <p className="mt-2 text-neutral-600">
                Many young people believe wills are only for the elderly or wealthy. We explain why this common misconception could leave your loved ones vulnerable.
              </p>
              <a href="#" className="mt-4 inline-flex items-center text-primary hover:text-primary-dark font-medium transition">
                Read Article
                <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </div>
          </motion.div>
          
          {/* Blog Post 2 */}
          <motion.div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition" variants={item}>
            <img 
              src="https://images.unsplash.com/photo-1533750446969-255b9b3a69ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
              alt="Digital Assets in Your Will: What You Need to Know" 
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="text-sm text-neutral-500 mb-2">April 28, 2023</div>
              <h3 className="text-xl font-semibold text-neutral-900">Digital Assets in Your Will: What You Need to Know</h3>
              <p className="mt-2 text-neutral-600">
                From cryptocurrency to social media accounts, we explore how to include digital assets in your estate planning and ensure they're properly managed.
              </p>
              <a href="#" className="mt-4 inline-flex items-center text-primary hover:text-primary-dark font-medium transition">
                Read Article
                <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </div>
          </motion.div>
          
          {/* Blog Post 3 */}
          <motion.div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition" variants={item}>
            <img 
              src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
              alt="5 Common Will Mistakes and How to Avoid Them" 
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="text-sm text-neutral-500 mb-2">April 15, 2023</div>
              <h3 className="text-xl font-semibold text-neutral-900">5 Common Will Mistakes and How to Avoid Them</h3>
              <p className="mt-2 text-neutral-600">
                Even well-intentioned estate planning can go wrong. Learn about the most common mistakes people make when creating their wills and how to prevent them.
              </p>
              <a href="#" className="mt-4 inline-flex items-center text-primary hover:text-primary-dark font-medium transition">
                Read Article
                <ArrowRight className="ml-1 h-4 w-4" />
              </a>
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
            View All Articles
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}

export default BlogPreview
