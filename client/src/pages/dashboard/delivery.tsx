import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { MessageSquare, Users, Mail, Phone, Shield, Save, ArrowLeft, Info, AlertCircle } from 'lucide-react';
import { useLocation } from 'wouter';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  relationship: string;
}

const DeliveryPage: React.FC = () => {
  const [, navigate] = useLocation();
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'attorney' | 'executor' | ''>('');
  const [emailContacts, setEmailContacts] = useState<Contact[]>([]);
  const [attorneyContact, setAttorneyContact] = useState<Contact | null>(null);
  const [message, setMessage] = useState('');
  const [savedInstructions, setSavedInstructions] = useState(false);
  
  // Form states
  const [showAddContact, setShowAddContact] = useState(false);
  const [contactForm, setContactForm] = useState<Omit<Contact, 'id'>>({
    name: '',
    email: '',
    phone: '',
    relationship: ''
  });
  
  const handleContactInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddContact = () => {
    if (!contactForm.name || !contactForm.email) return;
    
    const newContact: Contact = {
      ...contactForm,
      id: Date.now().toString()
    };
    
    setEmailContacts(prev => [...prev, newContact]);
    setContactForm({
      name: '',
      email: '',
      phone: '',
      relationship: ''
    });
    setShowAddContact(false);
  };
  
  const handleRemoveContact = (id: string) => {
    setEmailContacts(prev => prev.filter(contact => contact.id !== id));
  };
  
  const handleSaveInstructions = () => {
    // Save delivery instructions
    localStorage.setItem('willDeliveryMethod', deliveryMethod);
    localStorage.setItem('willDeliveryContacts', JSON.stringify(emailContacts));
    localStorage.setItem('willDeliveryMessage', message);
    
    setSavedInstructions(true);
    
    setTimeout(() => {
      setSavedInstructions(false);
    }, 3000);
  };
  
  return (
    <DashboardLayout title="Delivery Instructions">
      <div className="mb-6 flex items-center">
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 text-primary mr-2" />
              <h3 className="font-semibold text-gray-800 dark:text-white">Delivery Settings</h3>
            </div>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-4">How should your will be delivered?</h4>
              
              <div className="space-y-3">
                {/* Email Option */}
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    deliveryMethod === 'email' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5'
                  }`}
                  onClick={() => setDeliveryMethod('email')}
                >
                  <div className="flex items-start">
                    <div className={`w-5 h-5 rounded-full border flex-shrink-0 mr-3 mt-0.5 flex items-center justify-center ${
                      deliveryMethod === 'email' 
                        ? 'border-primary' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {deliveryMethod === 'email' && (
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                      )}
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-800 dark:text-white">Send via Email</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Your will and instructions will be emailed to your designated recipients after a specified period of inactivity.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Attorney Option */}
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    deliveryMethod === 'attorney' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5'
                  }`}
                  onClick={() => setDeliveryMethod('attorney')}
                >
                  <div className="flex items-start">
                    <div className={`w-5 h-5 rounded-full border flex-shrink-0 mr-3 mt-0.5 flex items-center justify-center ${
                      deliveryMethod === 'attorney' 
                        ? 'border-primary' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {deliveryMethod === 'attorney' && (
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                      )}
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-800 dark:text-white">Notify My Attorney</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Your attorney will be notified and given access to your will and related documents.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Executor Option */}
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    deliveryMethod === 'executor' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5'
                  }`}
                  onClick={() => setDeliveryMethod('executor')}
                >
                  <div className="flex items-start">
                    <div className={`w-5 h-5 rounded-full border flex-shrink-0 mr-3 mt-0.5 flex items-center justify-center ${
                      deliveryMethod === 'executor' 
                        ? 'border-primary' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {deliveryMethod === 'executor' && (
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                      )}
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-800 dark:text-white">Executor Only</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Only your designated executor will receive your will and instructions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {deliveryMethod === 'email' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-5 mb-6">
                  <h4 className="font-medium text-gray-800 dark:text-white mb-4">Who should receive your will?</h4>
                  
                  {emailContacts.length > 0 ? (
                    <div className="space-y-3 mb-4">
                      {emailContacts.map(contact => (
                        <div key={contact.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-800 dark:text-white text-sm">{contact.name}</h5>
                              <div className="flex flex-wrap items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center mr-3">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {contact.email}
                                </span>
                                {contact.phone && (
                                  <span className="flex items-center mr-3">
                                    <Phone className="h-3 w-3 mr-1" />
                                    {contact.phone}
                                  </span>
                                )}
                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">
                                  {contact.relationship}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleRemoveContact(contact.id)}
                            className="text-red-500 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg mb-4">
                      <p className="text-gray-500 dark:text-gray-400">
                        You haven't added any contacts yet.
                      </p>
                    </div>
                  )}
                  
                  {!showAddContact ? (
                    <button 
                      onClick={() => setShowAddContact(true)}
                      className="w-full py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-primary hover:bg-primary/5 transition-colors"
                    >
                      + Add Contact
                    </button>
                  ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                      <h5 className="font-medium text-gray-800 dark:text-white mb-3">Add Contact</h5>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Name*
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={contactForm.name}
                            onChange={handleContactInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-white"
                            placeholder="Full name"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email*
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={contactForm.email}
                            onChange={handleContactInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-white"
                            placeholder="email@example.com"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Phone
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={contactForm.phone}
                            onChange={handleContactInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-white"
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Relationship*
                          </label>
                          <input
                            type="text"
                            name="relationship"
                            value={contactForm.relationship}
                            onChange={handleContactInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-white"
                            placeholder="e.g. Executor, Spouse, Child"
                            required
                          />
                        </div>
                        
                        <div className="flex pt-2 space-x-2">
                          <button 
                            onClick={handleAddContact}
                            disabled={!contactForm.name || !contactForm.email || !contactForm.relationship}
                            className={`px-4 py-2 rounded-md ${
                              !contactForm.name || !contactForm.email || !contactForm.relationship
                                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                : 'bg-primary text-white hover:bg-primary-dark'
                            }`}
                          >
                            Add
                          </button>
                          <button 
                            onClick={() => setShowAddContact(false)}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            
            {deliveryMethod && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <h4 className="font-medium text-gray-800 dark:text-white mb-2">Personal Message (Optional)</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Write a personal message to accompany your will.
                  </p>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-white resize-none"
                    placeholder="Write a personal message to your beneficiaries here..."
                  ></textarea>
                </div>
                
                <button
                  onClick={handleSaveInstructions}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Instructions
                </button>
                
                {savedInstructions && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-800 dark:text-green-300 text-sm flex items-start">
                    <div className="mt-0.5 mr-2">✓</div>
                    <div>Your delivery instructions have been saved successfully.</div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Info Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-white flex items-center">
              <Info className="h-5 w-5 text-primary mr-2" />
              Why Delivery Matters
            </h3>
          </div>
          
          <div className="p-6">
            <div className="rounded-lg bg-primary/5 p-4 mb-6 border border-primary/20">
              <h4 className="font-medium text-gray-800 dark:text-white mb-2 flex items-center">
                <Shield className="h-4 w-4 text-primary mr-2" />
                Security & Privacy
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your will contains sensitive information. Proper delivery instructions ensure it reaches only your intended recipients.
              </p>
            </div>
            
            <h4 className="font-medium text-gray-800 dark:text-white mb-3">Key Considerations:</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs mr-2 mt-0.5">1</div>
                <div>Choose recipients who you trust completely with your personal and financial information.</div>
              </li>
              <li className="flex items-start">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs mr-2 mt-0.5">2</div>
                <div>Consider including both family members and trusted professionals like attorneys.</div>
              </li>
              <li className="flex items-start">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs mr-2 mt-0.5">3</div>
                <div>Use the personal message to explain any decisions that might need clarification.</div>
              </li>
              <li className="flex items-start">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs mr-2 mt-0.5">4</div>
                <div>Update these instructions whenever your circumstances change.</div>
              </li>
            </ul>
            
            <div className="mt-6 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-800 dark:text-amber-300 text-sm flex items-start">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                Legally, your executor has the primary responsibility for executing your will. Make sure they are included in your delivery plan.
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DeliveryPage;