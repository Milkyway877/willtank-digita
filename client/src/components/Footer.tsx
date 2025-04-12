import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Twitter, 
  Linkedin, 
  Instagram, 
  X, 
  Users, 
  Building, 
  FileText, 
  BookOpen, 
  HelpCircle, 
  ShieldCheck, 
  FileTerminal 
} from 'lucide-react'

interface FooterModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const FooterModal: React.FC<FooterModalProps> = ({ isOpen, onClose, title, icon, content }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className="relative bg-white w-full max-w-3xl max-h-[80vh] overflow-y-auto rounded-xl shadow-2xl"
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-neutral-100 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-md text-primary">
                  {icon}
                </div>
                <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
              </div>
              <button 
                className="p-2 rounded-full hover:bg-neutral-100 transition text-neutral-500 hover:text-neutral-700"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 text-neutral-700">
              {content}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Newsletter component with form validation
const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Clear any error and show success state
    setError('');
    setIsSubmitted(true);
    
    // Reset form after success (could connect to API here)
    setTimeout(() => {
      setEmail('');
      setIsSubmitted(false);
    }, 3000);
  };
  
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
      <p className="text-neutral-300 mb-4">
        Subscribe to our newsletter for the latest updates on estate planning and digital will innovations.
      </p>
      
      {isSubmitted ? (
        <div className="p-3 bg-green-500 bg-opacity-20 border border-green-500 rounded-md">
          <p className="text-green-400 text-sm">Thanks for subscribing! We'll be in touch soon.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <label htmlFor="email-address" className="sr-only">Email address</label>
            <input 
              id="email-address" 
              name="email" 
              type="email" 
              autoComplete="email" 
              required 
              className={`w-full px-4 py-2 text-neutral-800 bg-white rounded-md focus:ring-2 focus:ring-primary focus:outline-none ${error ? 'border-red-500' : 'border-transparent'}`}
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          </div>
          <div>
            <button 
              type="submit" 
              className="w-full px-4 py-2 bg-gradient-to-r from-primary to-blue-500 hover:from-primary-dark hover:to-blue-600 text-white font-medium rounded-md transition shadow-md hover:shadow-lg"
            >
              Subscribe
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

const Footer: React.FC = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
  const modalContent = {
    about: {
      title: "About WillTank",
      icon: <Building className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p>WillTank is a revolutionary AI-powered platform dedicated to simplifying the estate planning process for everyone. Founded in 2023 by a team of legal experts and technology innovators, our mission is to make will creation accessible, secure, and personalized.</p>
          
          <h3 className="text-lg font-semibold mt-6">Our Mission</h3>
          <p>We believe everyone deserves access to proper estate planning, regardless of their financial status or legal knowledge. WillTank leverages cutting-edge AI technology to democratize this essential service, ensuring your legacy is protected exactly as you intend.</p>
          
          <h3 className="text-lg font-semibold mt-6">Innovation at Our Core</h3>
          <p>Our AI assistant, Skyler, represents the fusion of sophisticated machine learning algorithms with deep legal knowledge. This combination allows us to provide personalized guidance that's both legally sound and attuned to your unique circumstances.</p>
          
          <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
            <h4 className="font-medium">Key Facts</h4>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Founded in 2023</li>
              <li>Headquarters in San Francisco, CA</li>
              <li>Team of 50+ professionals</li>
              <li>Legal partnerships in 38 states</li>
              <li>Over 100,000 wills created</li>
            </ul>
          </div>
        </div>
      )
    },
    team: {
      title: "Our Team",
      icon: <Users className="h-5 w-5" />,
      content: (
        <div className="space-y-6">
          <p>WillTank is powered by a diverse team of legal experts, technologists, designers, and customer support specialists who share a passion for making estate planning accessible to everyone.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="p-4 border border-neutral-100 rounded-lg">
              <h4 className="font-semibold text-primary">Sarah Chen</h4>
              <p className="text-sm text-neutral-500">CEO & Co-Founder</p>
              <p className="mt-2 text-sm">Former estate planning attorney with 15 years experience. JD from Harvard Law School.</p>
            </div>
            
            <div className="p-4 border border-neutral-100 rounded-lg">
              <h4 className="font-semibold text-primary">Michael Rodriguez</h4>
              <p className="text-sm text-neutral-500">CTO & Co-Founder</p>
              <p className="mt-2 text-sm">AI specialist with background in natural language processing. PhD from MIT.</p>
            </div>
            
            <div className="p-4 border border-neutral-100 rounded-lg">
              <h4 className="font-semibold text-primary">Amara Washington</h4>
              <p className="text-sm text-neutral-500">Chief Legal Officer</p>
              <p className="mt-2 text-sm">Estate law specialist with 20+ years experience across multiple jurisdictions.</p>
            </div>
            
            <div className="p-4 border border-neutral-100 rounded-lg">
              <h4 className="font-semibold text-primary">David Park</h4>
              <p className="text-sm text-neutral-500">Head of Product Design</p>
              <p className="mt-2 text-sm">Award-winning UX designer focused on creating accessible interfaces for complex tasks.</p>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold">Join Our Team</h3>
            <p className="mt-2">We're always looking for talented individuals passionate about combining legal expertise with cutting-edge technology. Visit our careers page to see current openings.</p>
          </div>
        </div>
      )
    },
    careers: {
      title: "Careers at WillTank",
      icon: <Building className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p>Join our mission to revolutionize estate planning with AI technology. At WillTank, we're building a team of dedicated professionals who are passionate about making a meaningful impact.</p>
          
          <h3 className="text-lg font-semibold mt-6">Open Positions</h3>
          
          <div className="space-y-4 mt-4">
            <div className="p-4 border border-neutral-100 rounded-lg hover:border-primary hover:shadow-md transition">
              <h4 className="font-semibold text-primary">Senior Full Stack Developer</h4>
              <p className="text-sm text-neutral-600 mt-1">San Francisco, CA (Remote Optional)</p>
              <p className="mt-2">Build and maintain our core platform using React, Node.js, and PostgreSQL. 5+ years experience required.</p>
              <button className="mt-3 px-4 py-1.5 bg-primary/10 text-primary text-sm rounded-md hover:bg-primary/20 transition">View Details</button>
            </div>
            
            <div className="p-4 border border-neutral-100 rounded-lg hover:border-primary hover:shadow-md transition">
              <h4 className="font-semibold text-primary">AI/ML Engineer</h4>
              <p className="text-sm text-neutral-600 mt-1">San Francisco, CA (Remote Optional)</p>
              <p className="mt-2">Improve our AI assistant Skyler with advanced NLP and machine learning techniques. Experience with large language models required.</p>
              <button className="mt-3 px-4 py-1.5 bg-primary/10 text-primary text-sm rounded-md hover:bg-primary/20 transition">View Details</button>
            </div>
            
            <div className="p-4 border border-neutral-100 rounded-lg hover:border-primary hover:shadow-md transition">
              <h4 className="font-semibold text-primary">Estate Planning Attorney</h4>
              <p className="text-sm text-neutral-600 mt-1">Remote</p>
              <p className="mt-2">Provide legal expertise for our templates and AI training. JD required with 3+ years estate planning experience.</p>
              <button className="mt-3 px-4 py-1.5 bg-primary/10 text-primary text-sm rounded-md hover:bg-primary/20 transition">View Details</button>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
            <h4 className="font-medium">Benefits & Perks</h4>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Competitive salary and equity packages</li>
              <li>Comprehensive health, dental and vision coverage</li>
              <li>Flexible remote work options</li>
              <li>Professional development budget</li>
              <li>Unlimited PTO policy</li>
            </ul>
          </div>
        </div>
      )
    },
    help: {
      title: "Help Center",
      icon: <HelpCircle className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p>Welcome to the WillTank Help Center. Find answers to common questions or get in touch with our support team for personalized assistance.</p>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold">Frequently Asked Questions</h3>
            
            <div className="mt-4 space-y-4">
              <div className="border-b border-neutral-100 pb-4">
                <h4 className="font-medium text-primary">How secure is WillTank?</h4>
                <p className="mt-1 text-sm">WillTank uses bank-level 256-bit AES encryption to protect your data. All information is stored in secure, encrypted databases with strict access controls and regular security audits.</p>
              </div>
              
              <div className="border-b border-neutral-100 pb-4">
                <h4 className="font-medium text-primary">Is my will legally binding?</h4>
                <p className="mt-1 text-sm">Yes, all wills created through WillTank are designed to be legally valid in your jurisdiction. Our templates are regularly reviewed by legal experts and updated to comply with changing laws.</p>
              </div>
              
              <div className="border-b border-neutral-100 pb-4">
                <h4 className="font-medium text-primary">How does Skyler AI work?</h4>
                <p className="mt-1 text-sm">Skyler uses advanced natural language processing and machine learning to understand your unique situation and provide personalized guidance. It's trained on thousands of legal documents and continuously improved by our team of legal experts.</p>
              </div>
              
              <div className="border-b border-neutral-100 pb-4">
                <h4 className="font-medium text-primary">Can I update my will after creating it?</h4>
                <p className="mt-1 text-sm">Absolutely! You can update your will anytime with our premium subscription. We also recommend reviewing your will annually or after major life events like marriage, divorce, having children, or acquiring significant assets.</p>
              </div>
              
              <div className="pb-4">
                <h4 className="font-medium text-primary">How do I get help with a specific issue?</h4>
                <p className="mt-1 text-sm">You can contact our support team via email at support@willtank.com or use the live chat feature on our platform. Premium members also have access to scheduled consultations with our legal experts.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-primary/5 rounded-lg">
            <h4 className="font-medium text-primary">Contact Support</h4>
            <p className="mt-2 text-sm">Need more help? Our support team is available Monday through Friday, 9am-5pm PT.</p>
            <div className="mt-3 flex space-x-2">
              <button className="px-4 py-2 bg-primary text-white text-sm rounded-md hover:bg-primary-dark transition">Email Support</button>
              <button className="px-4 py-2 border border-primary text-primary text-sm rounded-md hover:bg-primary/5 transition">Live Chat</button>
            </div>
          </div>
        </div>
      )
    },
    privacy: {
      title: "Privacy Policy",
      icon: <ShieldCheck className="h-5 w-5" />,
      content: (
        <div className="space-y-4 text-sm">
          <p className="font-medium">Last Updated: April 10, 2025</p>
          
          <p>At WillTank, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our website and services.</p>
          
          <h3 className="text-lg font-semibold mt-6">Information We Collect</h3>
          <p>We collect information that you provide directly to us, including:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Personal information (name, email address, phone number)</li>
            <li>Account information (username, password)</li>
            <li>Will-related information (family structure, asset details, beneficiary information)</li>
            <li>Payment information (processed securely through our payment processors)</li>
          </ul>
          
          <h3 className="text-lg font-semibold mt-6">How We Use Your Information</h3>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Provide, maintain, and improve our services</li>
            <li>Create and update your will documents</li>
            <li>Process payments and send administrative notifications</li>
            <li>Respond to comments, questions, and customer support requests</li>
            <li>Analyze usage patterns and optimize user experience</li>
            <li>Protect against, identify, and prevent fraud and other illegal activities</li>
          </ul>
          
          <h3 className="text-lg font-semibold mt-6">Data Security</h3>
          <p>We implement appropriate technical and organizational measures to protect your personal information, including:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>256-bit AES encryption for all stored data</li>
            <li>SSL/TLS encryption for data in transit</li>
            <li>Regular security audits and vulnerability assessments</li>
            <li>Strict access controls and authentication requirements</li>
            <li>Employee training on data protection and privacy practices</li>
          </ul>
          
          <p className="mt-6">For the complete privacy policy, please contact our privacy team at privacy@willtank.com.</p>
        </div>
      )
    },
    terms: {
      title: "Terms of Service",
      icon: <FileText className="h-5 w-5" />,
      content: (
        <div className="space-y-4 text-sm">
          <p className="font-medium">Last Updated: April 1, 2025</p>
          
          <p>These Terms of Service ("Terms") govern your access to and use of WillTank's website, products, and services. By using our services, you agree to be bound by these Terms.</p>
          
          <h3 className="text-lg font-semibold mt-6">Account Registration</h3>
          <p>To use certain features of our services, you must create an account. You agree to provide accurate and complete information when you register and to keep your account information updated. You are responsible for safeguarding your account credentials and for all activities that occur under your account.</p>
          
          <h3 className="text-lg font-semibold mt-6">Service Usage</h3>
          <p>While we strive to provide legally valid documents, WillTank is not a law firm and does not provide legal advice. Our AI assistant, templates, and educational materials are tools to help you create your estate planning documents, but they are not a substitute for professional legal advice.</p>
          
          <h3 className="text-lg font-semibold mt-6">Intellectual Property</h3>
          <p>All content, features, and functionality of our services, including but not limited to text, graphics, logos, icons, and software, are owned by WillTank and are protected by United States and international copyright, trademark, and other intellectual property laws.</p>
          
          <h3 className="text-lg font-semibold mt-6">Subscription and Billing</h3>
          <p>Some features of our services require a paid subscription. Billing terms, including pricing, payment methods, and cancellation policies, are specified during the subscription process. We reserve the right to change our prices with notice to subscribers.</p>
          
          <h3 className="text-lg font-semibold mt-6">Limitation of Liability</h3>
          <p>To the maximum extent permitted by law, WillTank shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, or goodwill, resulting from your access to or use of or inability to access or use the services.</p>
          
          <p className="mt-6">For the complete terms of service, please contact our legal team at legal@willtank.com.</p>
        </div>
      )
    },
    cookies: {
      title: "Cookie Policy",
      icon: <FileTerminal className="h-5 w-5" />,
      content: (
        <div className="space-y-4 text-sm">
          <p className="font-medium">Last Updated: March 15, 2025</p>
          
          <p>This Cookie Policy explains how WillTank uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.</p>
          
          <h3 className="text-lg font-semibold mt-6">What Are Cookies?</h3>
          <p>Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information.</p>
          
          <h3 className="text-lg font-semibold mt-6">Types of Cookies We Use</h3>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><span className="font-medium">Essential Cookies:</span> Required for the operation of our website. They include cookies that enable you to log into secure areas of our website.</li>
            <li><span className="font-medium">Analytical/Performance Cookies:</span> Allow us to recognize and count the number of visitors and see how visitors move around our website. This helps us improve the way our website works.</li>
            <li><span className="font-medium">Functionality Cookies:</span> Used to recognize you when you return to our website. This enables us to personalize our content for you and remember your preferences.</li>
            <li><span className="font-medium">Targeting Cookies:</span> Record your visit to our website, the pages you have visited, and the links you have followed. We use this information to make our website and the advertising displayed on it more relevant to your interests.</li>
          </ul>
          
          <h3 className="text-lg font-semibold mt-6">How to Control Cookies</h3>
          <p>You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. If you disable or refuse cookies, please note that some parts of this website may become inaccessible or not function properly.</p>
          
          <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
            <h4 className="font-medium">Cookie Preferences</h4>
            <p className="mt-2">You can adjust your cookie preferences anytime by visiting our Cookie Preferences Center.</p>
            <button className="mt-3 px-4 py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition">Cookie Preferences</button>
          </div>
        </div>
      )
    },
    guide: {
      title: "Estate Planning Guide",
      icon: <BookOpen className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p>This comprehensive guide will help you understand the fundamentals of estate planning and how to make informed decisions about your will.</p>
          
          <h3 className="text-lg font-semibold mt-6">What is Estate Planning?</h3>
          <p>Estate planning is the process of arranging for the management and disposal of your estate during your life and after death. It involves creating legal documents that ensure your assets are distributed according to your wishes and that your loved ones are taken care of.</p>
          
          <h3 className="text-lg font-semibold mt-6">Key Components of an Estate Plan</h3>
          
          <div className="mt-4 space-y-4">
            <div className="p-4 border border-neutral-100 rounded-lg">
              <h4 className="font-medium text-primary">Last Will and Testament</h4>
              <p className="mt-1 text-sm">A legal document that communicates how you want your property distributed after death, who should manage the distribution, and who should care for any minor children.</p>
            </div>
            
            <div className="p-4 border border-neutral-100 rounded-lg">
              <h4 className="font-medium text-primary">Power of Attorney</h4>
              <p className="mt-1 text-sm">Designates someone to make financial decisions on your behalf if you become incapacitated.</p>
            </div>
            
            <div className="p-4 border border-neutral-100 rounded-lg">
              <h4 className="font-medium text-primary">Healthcare Directive</h4>
              <p className="mt-1 text-sm">Specifies your medical treatment preferences and designates someone to make healthcare decisions for you if you're unable to do so.</p>
            </div>
            
            <div className="p-4 border border-neutral-100 rounded-lg">
              <h4 className="font-medium text-primary">Trust</h4>
              <p className="mt-1 text-sm">A legal arrangement where a trustee holds assets for beneficiaries, often used to avoid probate, minimize taxes, or manage assets for minor children.</p>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mt-6">When to Update Your Estate Plan</h3>
          <p>Your estate plan should be reviewed and potentially updated after major life events, including:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Marriage or divorce</li>
            <li>Birth or adoption of a child</li>
            <li>Death of a spouse or beneficiary</li>
            <li>Significant changes in assets or financial situation</li>
            <li>Moving to a different state</li>
            <li>Changes in tax laws</li>
          </ul>
          
          <div className="mt-6 p-4 bg-primary/5 rounded-lg">
            <h4 className="font-medium text-primary">Download Our Full Guide</h4>
            <p className="mt-2 text-sm">For more detailed information, download our comprehensive estate planning guide, which includes worksheets, checklists, and state-specific information.</p>
            <button className="mt-3 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition flex items-center justify-center">
              Download PDF Guide
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>
      )
    }
  };
  
  const openModal = (modalId: string) => {
    setActiveModal(modalId);
  };

  return (
    <footer className="bg-neutral-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <a href="#hero" className="inline-block">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent">WillTank</h2>
            </a>
            <p className="mt-4 text-neutral-300 max-w-md">
              The future of estate planning. Create, store, and deliver your will with AI guidance, ensuring your legacy is protected and your wishes are fulfilled.
            </p>
            <div className="mt-8 flex space-x-4">
              <a 
                href="https://twitter.com/willtank" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white hover:text-cyan-400 transition p-2 bg-white/5 rounded-full hover:bg-white/10"
              >
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="https://linkedin.com/company/willtank" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white hover:text-cyan-400 transition p-2 bg-white/5 rounded-full hover:bg-white/10"
              >
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="https://instagram.com/willtank" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white hover:text-cyan-400 transition p-2 bg-white/5 rounded-full hover:bg-white/10"
              >
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Links 1 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white/90">Company</h3>
            <ul className="space-y-3">
              <li><button onClick={() => openModal('about')} className="text-neutral-300 hover:text-white transition hover:translate-x-0.5">About WillTank</button></li>
              <li><button onClick={() => openModal('team')} className="text-neutral-300 hover:text-white transition hover:translate-x-0.5">Our Team</button></li>
              <li><button onClick={() => openModal('careers')} className="text-neutral-300 hover:text-white transition hover:translate-x-0.5">Careers</button></li>
              <li><a href="#contact" className="text-neutral-300 hover:text-white transition hover:translate-x-0.5 block">Contact Us</a></li>
              <li><a href="#testimonials" className="text-neutral-300 hover:text-white transition hover:translate-x-0.5 block">Testimonials</a></li>
            </ul>
          </div>
          
          {/* Links 2 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white/90">Resources</h3>
            <ul className="space-y-3">
              <li><button onClick={() => openModal('help')} className="text-neutral-300 hover:text-white transition hover:translate-x-0.5">Help Center</button></li>
              <li><button onClick={() => openModal('guide')} className="text-neutral-300 hover:text-white transition hover:translate-x-0.5">Estate Planning Guide</button></li>
              <li><a href="#templates" className="text-neutral-300 hover:text-white transition hover:translate-x-0.5 block">Will Templates</a></li>
              <li><button onClick={() => openModal('privacy')} className="text-neutral-300 hover:text-white transition hover:translate-x-0.5">Privacy Policy</button></li>
              <li><button onClick={() => openModal('terms')} className="text-neutral-300 hover:text-white transition hover:translate-x-0.5">Terms of Use</button></li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <Newsletter />
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-neutral-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-400 text-sm">
              &copy; {new Date().getFullYear()} WillTank. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <button onClick={() => openModal('privacy')} className="text-neutral-400 hover:text-white text-sm transition">Privacy Policy</button>
              <button onClick={() => openModal('terms')} className="text-neutral-400 hover:text-white text-sm transition">Terms of Service</button>
              <button onClick={() => openModal('cookies')} className="text-neutral-400 hover:text-white text-sm transition">Cookie Policy</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      {activeModal && modalContent[activeModal as keyof typeof modalContent] && (
        <FooterModal
          isOpen={!!activeModal}
          onClose={() => setActiveModal(null)}
          title={modalContent[activeModal as keyof typeof modalContent].title}
          icon={modalContent[activeModal as keyof typeof modalContent].icon}
          content={modalContent[activeModal as keyof typeof modalContent].content}
        />
      )}
    </footer>
  )
}

export default Footer
