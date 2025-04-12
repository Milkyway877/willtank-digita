import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Users, UserPlus, User, Mail, Phone, MapPin, Edit, Trash, Plus, X, Save, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

interface Beneficiary {
  id: string;
  name: string;
  relationship: string;
  email?: string;
  phone?: string;
  location?: string;
  share?: string;
}

const BeneficiariesPage: React.FC = () => {
  const [, navigate] = useLocation();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([
    {
      id: '1',
      name: 'Jane Smith',
      relationship: 'Spouse',
      email: 'jane.smith@example.com',
      phone: '+1 (555) 123-4567',
      location: 'New York, NY',
      share: '50%'
    },
    {
      id: '2',
      name: 'Michael Johnson',
      relationship: 'Son',
      email: 'michael.j@example.com',
      phone: '+1 (555) 987-6543',
      location: 'Boston, MA',
      share: '25%'
    },
    {
      id: '3',
      name: 'Sarah Williams',
      relationship: 'Daughter',
      email: 'sarah.w@example.com',
      phone: '+1 (555) 456-7890',
      location: 'Chicago, IL',
      share: '25%'
    }
  ]);
  
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null);
  
  const [formData, setFormData] = useState<Omit<Beneficiary, 'id'>>({
    name: '',
    relationship: '',
    email: '',
    phone: '',
    location: '',
    share: ''
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddNewClick = () => {
    setIsAddingNew(true);
    setEditingBeneficiary(null);
    setFormData({
      name: '',
      relationship: '',
      email: '',
      phone: '',
      location: '',
      share: ''
    });
  };
  
  const handleEditClick = (beneficiary: Beneficiary) => {
    setEditingBeneficiary(beneficiary);
    setIsAddingNew(false);
    setFormData({
      name: beneficiary.name,
      relationship: beneficiary.relationship,
      email: beneficiary.email || '',
      phone: beneficiary.phone || '',
      location: beneficiary.location || '',
      share: beneficiary.share || ''
    });
  };
  
  const handleDeleteClick = (id: string) => {
    setBeneficiaries(prev => prev.filter(b => b.id !== id));
  };
  
  const handleSaveClick = () => {
    if (editingBeneficiary) {
      // Update existing beneficiary
      setBeneficiaries(prev => 
        prev.map(b => 
          b.id === editingBeneficiary.id 
            ? { ...formData, id: editingBeneficiary.id } 
            : b
        )
      );
    } else if (isAddingNew) {
      // Add new beneficiary
      const newBeneficiary: Beneficiary = {
        ...formData,
        id: Date.now().toString()
      };
      setBeneficiaries(prev => [...prev, newBeneficiary]);
    }
    
    // Reset the form
    setIsAddingNew(false);
    setEditingBeneficiary(null);
  };
  
  const handleCancelClick = () => {
    setIsAddingNew(false);
    setEditingBeneficiary(null);
  };
  
  // Calculate total share allocation
  const totalShare = beneficiaries.reduce((sum, b) => {
    const shareValue = parseInt(b.share?.replace('%', '') || '0');
    return sum + shareValue;
  }, 0);
  
  return (
    <DashboardLayout title="Beneficiaries">
      <div className="mb-6 flex items-center justify-between">
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </button>
        
        <button
          onClick={handleAddNewClick}
          className="px-3 py-1.5 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors flex items-center"
          disabled={isAddingNew}
        >
          <UserPlus className="h-4 w-4 mr-1.5" />
          Add Beneficiary
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {/* Beneficiaries List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-primary mr-2" />
                <h3 className="font-semibold text-gray-800 dark:text-white">My Beneficiaries</h3>
                <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-0.5 rounded-full">
                  {beneficiaries.length}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              {beneficiaries.length === 0 ? (
                <div className="text-center py-10">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No Beneficiaries Added</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                    Add the people who should receive your assets when your will is executed.
                  </p>
                  <button
                    onClick={handleAddNewClick}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors inline-flex items-center"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Your First Beneficiary
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {beneficiaries.map((beneficiary) => (
                    <motion.div
                      key={beneficiary.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                          <div className="ml-3">
                            <h4 className="font-medium text-gray-800 dark:text-white">{beneficiary.name}</h4>
                            <div className="flex flex-wrap items-center mt-1">
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded mr-2">
                                {beneficiary.relationship}
                              </span>
                              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded">
                                Share: {beneficiary.share || 'Not specified'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-auto">
                          <button 
                            onClick={() => handleEditClick(beneficiary)}
                            className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(beneficiary.id)}
                            className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-red-500 dark:text-red-400 transition-colors"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        {beneficiary.email && (
                          <div className="flex items-center">
                            <Mail className="h-3 w-3 text-gray-500 dark:text-gray-400 mr-1" />
                            <span className="text-gray-600 dark:text-gray-300 truncate">{beneficiary.email}</span>
                          </div>
                        )}
                        
                        {beneficiary.phone && (
                          <div className="flex items-center">
                            <Phone className="h-3 w-3 text-gray-500 dark:text-gray-400 mr-1" />
                            <span className="text-gray-600 dark:text-gray-300">{beneficiary.phone}</span>
                          </div>
                        )}
                        
                        {beneficiary.location && (
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 text-gray-500 dark:text-gray-400 mr-1" />
                            <span className="text-gray-600 dark:text-gray-300">{beneficiary.location}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Add/Edit Form */}
        <AnimatePresence>
          {(isAddingNew || editingBeneficiary) && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800 dark:text-white">
                  {editingBeneficiary ? 'Edit Beneficiary' : 'Add New Beneficiary'}
                </h3>
                <button 
                  onClick={handleCancelClick}
                  className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name*
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-white"
                      placeholder="Full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Relationship*
                    </label>
                    <input
                      type="text"
                      name="relationship"
                      value={formData.relationship}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-white"
                      placeholder="e.g. Spouse, Child, Friend"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Share Percentage
                    </label>
                    <input
                      type="text"
                      name="share"
                      value={formData.share}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-white"
                      placeholder="e.g. 25%"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-white"
                      placeholder="email@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-white"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-white"
                      placeholder="City, State"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={handleSaveClick}
                    disabled={!formData.name || !formData.relationship}
                    className={`w-full py-2 rounded-md flex items-center justify-center ${
                      !formData.name || !formData.relationship
                        ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-400'
                        : 'bg-primary text-white hover:bg-primary-dark'
                    } transition-colors`}
                  >
                    <Save className="h-4 w-4 mr-1.5" />
                    {editingBeneficiary ? 'Update Beneficiary' : 'Save Beneficiary'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Share Allocation Panel */}
        {!isAddingNew && !editingBeneficiary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-white">Estate Share Allocation</h3>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Allocated</span>
                  <span className={`font-medium ${
                    totalShare === 100 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {totalShare}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div 
                    className={`h-full rounded-full ${
                      totalShare === 100 
                        ? 'bg-green-500' 
                        : totalShare > 100 
                          ? 'bg-red-500' 
                          : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(totalShare, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              {totalShare !== 100 && (
                <div className={`text-sm p-3 rounded-lg ${
                  totalShare > 100
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                    : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                }`}>
                  {totalShare > 100 
                    ? `You've allocated ${totalShare - 100}% more than your total estate.`
                    : `You still need to allocate ${100 - totalShare}% of your estate.`
                  }
                </div>
              )}
              
              {beneficiaries.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Beneficiary Shares</h4>
                  <div className="space-y-2">
                    {beneficiaries.map(b => (
                      <div key={b.id} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[70%]">{b.name}</span>
                        <span className="text-sm font-medium">{b.share || '0%'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BeneficiariesPage;