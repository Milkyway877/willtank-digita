import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ArrowRight } from 'lucide-react'

const FAQ: React.FC = () => {
  // FAQ items data
  const faqItems = [
    {
      question: "Is a will created with WillTank legally valid?",
      answer: "Yes, wills created with WillTank are legally valid. Our templates are designed by legal professionals to comply with legal requirements in your jurisdiction. However, for complex estates or special circumstances, we recommend consulting with a lawyer. Some jurisdictions may also require witnesses for will signing, which our system will guide you through."
    },
    {
      question: "How secure is my information on WillTank?",
      answer: "Security is our top priority. We use bank-level 256-bit AES encryption to protect your documents and personal information. Our systems undergo regular security audits and penetration testing. We also offer two-factor authentication and biometric verification options to ensure only you can access your account and documents."
    },
    {
      question: "Who is Skyler, and how does the AI assistance work?",
      answer: "Skyler is our AI assistant that guides you through the will creation process. Skyler helps by explaining legal concepts in simple terms, suggesting options based on your specific situation, and ensuring you don't miss important details. The AI learns from legal experts' knowledge and is regularly updated to reflect current laws. However, Skyler doesn't store your personal information—all your data remains encrypted and private."
    },
    {
      question: "How does the executor delivery system work?",
      answer: "Our executor delivery system allows you to designate trusted individuals who will receive access to your will and related documents when needed. You can set up specific conditions for document release, such as inactivity periods or manual verification. Executors receive secure access links with multi-factor authentication to ensure only authorized individuals can view your documents."
    },
    {
      question: "Can I update my will after creating it?",
      answer: "Absolutely! Life changes, and your will should too. With WillTank, you can make unlimited updates to your will. Each revision is tracked, and you can view previous versions at any time. We also send annual reminders to review and update your will to reflect major life changes such as marriage, divorce, new children, or significant asset changes."
    },
    {
      question: "What happens if WillTank ceases to operate?",
      answer: "We've taken precautions to ensure your documents remain accessible even in unlikely scenarios. We maintain a financial reserve specifically for service continuity and have established a legal framework with a third-party escrow service to maintain document access. Additionally, you can download local copies of all your documents at any time, which we encourage as a backup practice."
    }
  ];

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-neutral-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">Frequently Asked Questions</h2>
          <p className="mt-4 text-lg text-neutral-600">
            Have questions about WillTank? Find answers to the most common questions below.
          </p>
        </motion.div>
        
        <motion.div 
          className="mt-12 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div 
                key={index} 
                className={`bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden`}
              >
                <button 
                  className="w-full text-left px-6 py-4 focus:outline-none flex justify-between items-center"
                  onClick={() => toggleFAQ(index)}
                >
                  <span className="text-lg font-medium text-neutral-900">{item.question}</span>
                  <ChevronDown 
                    className={`h-5 w-5 text-neutral-500 transition-transform duration-300 ${activeIndex === index ? 'transform rotate-180' : ''}`} 
                  />
                </button>
                {activeIndex === index && (
                  <div className="px-6 pb-4">
                    <p className="text-neutral-600">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <motion.div 
            className="mt-10 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <p className="text-neutral-600">
              Still have questions? We're here to help.
            </p>
            <a 
              href="#contact" 
              className="mt-4 inline-flex items-center text-primary hover:text-primary-dark font-medium transition"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Contact our support team
              <ArrowRight className="ml-1 h-5 w-5" />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default FAQ
