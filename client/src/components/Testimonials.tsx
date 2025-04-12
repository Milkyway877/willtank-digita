import React from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const Testimonials: React.FC = () => {
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

  const testimonials = [
    {
      name: "Sarah Johnson",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&w=150&h=150&crop=faces&fit=crop",
      text: "\"I've been putting off creating my will for years because it seemed so daunting. WillTank made it surprisingly easy! Skyler guided me through each step and explained everything in plain English. Having my will securely stored gives me incredible peace of mind.\"",
      since: "Customer since 2022"
    },
    {
      name: "Michael Tran",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=150&h=150&crop=faces&fit=crop",
      text: "\"As a small business owner, I needed a will that addressed both personal and business assets. The Business Owner template was perfect, and I loved being able to record video messages for my family. The security features are impressive too—everything feels safe and professional.\"",
      since: "Customer since 2023"
    },
    {
      name: "Elena Rodriguez",
      image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&w=150&h=150&crop=faces&fit=crop",
      text: "\"With property in two countries, I needed a will that would work across borders. The International Assets template was exactly what I needed, and Skyler helped customize it for my specific situation. I've already recommended WillTank to my entire family.\"",
      since: "Customer since 2022"
    }
  ];

  return (
    <section id="testimonials" className="py-20 testimonial-section">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">What Our Users Say</h2>
          <p className="mt-4 text-lg text-neutral-600">
            Thousands of people have already secured their legacy with WillTank. Here's what some of them have to say.
          </p>
        </motion.div>
        
        <motion.div
          className="mt-16"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition"
                variants={item}
              >
                <div className="flex items-center mb-6">
                  <img src={testimonial.image} alt={testimonial.name} className="w-14 h-14 rounded-full object-cover" />
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-neutral-900">{testimonial.name}</h3>
                    <div className="flex text-yellow-400 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-neutral-600">
                  {testimonial.text}
                </p>
                <div className="mt-6 pt-4 border-t border-neutral-100 text-sm text-neutral-500">
                  {testimonial.since}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Testimonials
