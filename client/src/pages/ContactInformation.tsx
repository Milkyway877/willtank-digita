import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Plus, X, ArrowRight, User, Phone, Mail, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AnimatedAurora from '@/components/ui/AnimatedAurora';
import { apiRequest } from '@/lib/queryClient';
import { saveWillProgress, WillCreationStep } from '@/lib/will-progress-tracker';

// Contact interface
interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  relationship: string;
  role: 'beneficiary' | 'executor' | 'guardian' | 'witness';
}

// Country interface for dropdown
interface Country {
  code: string;
  name: string;
}

// List of countries
const countries: Country[] = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'MX', name: 'Mexico' },
  // Add more countries as needed
];

// Contact validation
const validateContact = (contact: Contact): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  if (!contact.name.trim()) {
    errors.name = 'Name is required';
  }
  
  if (!contact.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^\S+@\S+\.\S+$/.test(contact.email)) {
    errors.email = 'Enter a valid email address';
  }
  
  if (!contact.phone.trim()) {
    errors.phone = 'Phone number is required';
  }
  
  if (!contact.country) {
    errors.country = 'Country is required';
  }
  
  if (!contact.relationship.trim()) {
    errors.relationship = 'Relationship is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const ContactInformation: React.FC = () => {
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  // State
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [currentContact, setCurrentContact] = useState<Contact>({
    id: '',
    name: '',
    email: '',
    phone: '',
    country: '',
    relationship: '',
    role: 'beneficiary'
  });
  const [editing, setEditing] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [willData, setWillData] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  
  // Redirect to login if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth/sign-in');
    }
  }, [user, isLoading, navigate]);
  
  // Load will data and track progress
  useEffect(() => {
    saveWillProgress(WillCreationStep.CONTACT_INFO);
    
    // Load will data from localStorage to generate initial contacts
    const savedWillData = localStorage.getItem('willData');
    if (savedWillData) {
      try {
        const parsedData = JSON.parse(savedWillData);
        setWillData(parsedData);
        
        if (!isInitialized) {
          generateInitialContacts(parsedData);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Error parsing will data:', error);
        // Navigate back to document upload if data is invalid
        navigate('/document-upload');
      }
    } else {
      // No will data found, redirect back to document upload
      navigate('/document-upload');
    }
    
    // Load any existing contacts from storage
    loadContacts();
  }, [navigate, isInitialized]);
  
  // Generate initial contacts from will data
  const generateInitialContacts = (data: any) => {
    const initialContacts: Contact[] = [];
    
    // Add beneficiaries
    if (data.beneficiaries && data.beneficiaries.length > 0) {
      data.beneficiaries.forEach((beneficiary: any, index: number) => {
        if (beneficiary.name) {
          initialContacts.push({
            id: `beneficiary-${index}`,
            name: beneficiary.name,
            email: '',
            phone: '',
            country: 'US', // Default country
            relationship: beneficiary.relationship || '',
            role: 'beneficiary'
          });
        }
      });
    }
    
    // Add executor if present
    if (data.executor && data.executor.name) {
      initialContacts.push({
        id: 'executor',
        name: data.executor.name,
        email: '',
        phone: '',
        country: 'US', // Default country
        relationship: data.executor.relationship || '',
        role: 'executor'
      });
    }
    
    // Add guardians if present
    if (data.guardians && data.guardians.length > 0) {
      data.guardians.forEach((guardian: any, index: number) => {
        if (guardian.name) {
          initialContacts.push({
            id: `guardian-${index}`,
            name: guardian.name,
            email: '',
            phone: '',
            country: 'US', // Default country
            relationship: guardian.relationship || '',
            role: 'guardian'
          });
        }
      });
    }
    
    // Initialize with these contacts if no existing contacts
    if (initialContacts.length > 0) {
      setContacts(initialContacts);
    }
  };
  
  // Load contacts from API or localStorage
  const loadContacts = async () => {
    try {
      // First check if contacts are saved in database
      const willId = localStorage.getItem('currentWillId');
      
      if (willId) {
        const response = await apiRequest('GET', `/api/beneficiaries`);
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setContacts(data);
            return;
          }
        }
      }
      
      // If no contacts in database, check localStorage
      const savedContacts = localStorage.getItem('willContacts');
      if (savedContacts) {
        setContacts(JSON.parse(savedContacts));
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast({
        title: 'Error',
        description: 'Could not load saved contacts',
        variant: 'destructive'
      });
    }
  };
  
  // Save contacts to API and localStorage
  const saveContacts = async (): Promise<boolean> => {
    try {
      setIsSaving(true);
      
      // Always save to localStorage for backup
      localStorage.setItem('willContacts', JSON.stringify(contacts));
      
      // Save to API if we have a will ID
      const willId = localStorage.getItem('currentWillId');
      if (willId) {
        // For each contact, either update or create
        for (const contact of contacts) {
          try {
            if (contact.id.startsWith('new-')) {
              // New contact, create
              await apiRequest('POST', `/api/beneficiaries`, {
                willId: parseInt(willId),
                name: contact.name,
                email: contact.email,
                phone: contact.phone,
                country: contact.country,
                relationship: contact.relationship,
                role: contact.role
              });
            } else {
              // Existing contact, update
              await apiRequest('PUT', `/api/beneficiaries/${contact.id}`, {
                willId: parseInt(willId),
                name: contact.name,
                email: contact.email,
                phone: contact.phone,
                country: contact.country,
                relationship: contact.relationship,
                role: contact.role
              });
            }
          } catch (err) {
            console.error(`Error saving contact ${contact.name}:`, err);
            // Continue with other contacts
          }
        }
      }
      
      toast({
        title: 'Contacts saved',
        description: 'Contact information has been saved successfully'
      });
      
      return true;
    } catch (error) {
      console.error('Error saving contacts:', error);
      toast({
        title: 'Error',
        description: 'Failed to save contact information',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle adding a new contact
  const handleAddContact = () => {
    setCurrentContact({
      id: `new-${Date.now()}`, // Temporary ID
      name: '',
      email: '',
      phone: '',
      country: 'US', // Default country
      relationship: '',
      role: 'beneficiary' // Default role
    });
    setValidationErrors({});
    setEditing(true);
  };
  
  // Handle editing an existing contact
  const handleEditContact = (contact: Contact) => {
    setCurrentContact({ ...contact });
    setValidationErrors({});
    setEditing(true);
  };
  
  // Handle removing a contact
  const handleRemoveContact = (contactId: string) => {
    setContacts(contacts.filter(c => c.id !== contactId));
    
    // Also handle API removal if needed
    if (!contactId.startsWith('new-')) {
      try {
        apiRequest('DELETE', `/api/beneficiaries/${contactId}`);
      } catch (error) {
        console.error('Error removing contact from API:', error);
      }
    }
  };
  
  // Handle saving the current contact
  const handleSaveContact = () => {
    const { isValid, errors } = validateContact(currentContact);
    
    if (!isValid) {
      setValidationErrors(errors);
      return;
    }
    
    if (contacts.some(c => c.id === currentContact.id)) {
      // Update existing contact
      setContacts(contacts.map(c => c.id === currentContact.id ? currentContact : c));
    } else {
      // Add new contact
      setContacts([...contacts, currentContact]);
    }
    
    setEditing(false);
    setValidationErrors({});
  };
  
  // Handle continuing to next step
  const handleContinue = async () => {
    // At least one contact is required
    if (contacts.length === 0) {
      toast({
        title: 'Contact required',
        description: 'Please add at least one contact',
        variant: 'destructive'
      });
      return;
    }
    
    // Save contacts first
    const saveSuccess = await saveContacts();
    
    if (saveSuccess) {
      navigate('/video-recording');
    }
  };
  
  // Handle input change for the current contact form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentContact({ ...currentContact, [name]: value });
    
    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: '' });
    }
  };
  
  // Handle select change for dropdown fields
  const handleSelectChange = (name: string, value: string) => {
    setCurrentContact({ ...currentContact, [name]: value });
    
    // Clear validation error when user selects
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: '' });
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen relative bg-gray-50 dark:bg-gray-900">
      {/* Background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <AnimatedAurora />
      </div>
      
      <div className="container mx-auto px-4 py-8 md:py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Contact Information</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Add contact details for the people mentioned in your will
            </p>
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                1
              </div>
              <div className="h-1 w-16 bg-primary"></div>
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                2
              </div>
              <div className="h-1 w-16 bg-primary"></div>
              <div className="w-8 h-8 rounded-full border-2 border-primary text-primary flex items-center justify-center">
                3
              </div>
              <div className="h-1 w-16 bg-gray-300 dark:bg-gray-700"></div>
              <div className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-700 text-gray-400 flex items-center justify-center">
                4
              </div>
            </div>
          </div>
          
          {/* Contact List */}
          <Card className="p-6 mb-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Your Contacts</h2>
              <Button onClick={handleAddContact} size="sm" className="flex items-center">
                <Plus className="h-4 w-4 mr-1" />
                Add Contact
              </Button>
            </div>
            
            {contacts.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No contacts added yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Add contacts to help execute your will
                </p>
                <Button onClick={handleAddContact} className="mt-4">
                  Add Your First Contact
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {contacts.map((contact) => (
                  <motion.div
                    key={contact.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{contact.name}</h3>
                        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-0.5">
                          <div className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            <span>{contact.email}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            <span>{contact.phone}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{countries.find(c => c.code === contact.country)?.name || contact.country}</span>
                          </div>
                        </div>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs rounded-full">
                          {contact.role.charAt(0).toUpperCase() + contact.role.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditContact(contact)}
                        className="h-8 w-8"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          <path d="m15 5 4 4" />
                        </svg>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveContact(contact.id)}
                        className="h-8 w-8 text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
          
          {/* Contact Form Dialog */}
          {editing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    {currentContact.id.startsWith('new-') ? 'Add New Contact' : 'Edit Contact'}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditing(false)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={currentContact.name}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                      className={validationErrors.name ? 'border-red-500' : ''}
                    />
                    {validationErrors.name && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
                    )}
                  </div>
                  
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={currentContact.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                      className={validationErrors.email ? 'border-red-500' : ''}
                    />
                    {validationErrors.email && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                    )}
                  </div>
                  
                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={currentContact.phone}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                      className={validationErrors.phone ? 'border-red-500' : ''}
                    />
                    {validationErrors.phone && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
                    )}
                  </div>
                  
                  {/* Country */}
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={currentContact.country}
                      onValueChange={(value) => handleSelectChange('country', value)}
                    >
                      <SelectTrigger 
                        id="country"
                        className={validationErrors.country ? 'border-red-500' : ''}
                      >
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.country && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.country}</p>
                    )}
                  </div>
                  
                  {/* Relationship */}
                  <div className="space-y-2">
                    <Label htmlFor="relationship">Relationship</Label>
                    <Input
                      id="relationship"
                      name="relationship"
                      value={currentContact.relationship}
                      onChange={handleInputChange}
                      placeholder="E.g., Spouse, Child, Friend"
                      className={validationErrors.relationship ? 'border-red-500' : ''}
                    />
                    {validationErrors.relationship && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.relationship}</p>
                    )}
                  </div>
                  
                  {/* Role */}
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={currentContact.role}
                      onValueChange={(value) => handleSelectChange('role', value as any)}
                    >
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beneficiary">Beneficiary</SelectItem>
                        <SelectItem value="executor">Executor</SelectItem>
                        <SelectItem value="guardian">Guardian</SelectItem>
                        <SelectItem value="witness">Witness</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveContact}>
                    Save Contact
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
          
          {/* Continue Button */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => navigate('/document-upload')}
            >
              Back
            </Button>
            <Button 
              onClick={handleContinue}
              className="space-x-2"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>Continue to Video Recording</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactInformation;