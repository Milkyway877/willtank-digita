import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Calendar, Clock, Plus, Edit, Trash, BellRing, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Reminder {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  repeat: 'never' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  completed: boolean;
}

const RemindersPage: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Fetch reminders from API
  const { 
    data: apiReminders = [], 
    isLoading, 
    isError,
    refetch 
  } = useQuery<Reminder[]>({
    queryKey: ['/api/reminders'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/reminders');
      if (!res.ok) {
        throw new Error('Failed to fetch reminders');
      }
      return res.json();
    }
  });
  
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  
  const [formData, setFormData] = useState<Omit<Reminder, 'id' | 'completed'>>({
    title: '',
    description: '',
    date: '',
    time: '',
    repeat: 'never'
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddNewClick = () => {
    setIsAddingNew(true);
    setEditingReminder(null);
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      repeat: 'never'
    });
  };
  
  const handleEditClick = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setIsAddingNew(false);
    setFormData({
      title: reminder.title,
      description: reminder.description || '',
      date: reminder.date,
      time: reminder.time || '',
      repeat: reminder.repeat
    });
  };
  
  const handleDeleteClick = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };
  
  const handleSaveClick = () => {
    if (!formData.title || !formData.date) return;
    
    if (editingReminder) {
      // Update existing reminder
      setReminders(prev => 
        prev.map(r => 
          r.id === editingReminder.id 
            ? { ...formData, id: editingReminder.id, completed: editingReminder.completed } 
            : r
        )
      );
    } else if (isAddingNew) {
      // Add new reminder
      const newReminder: Reminder = {
        ...formData,
        id: Date.now().toString(),
        completed: false
      };
      setReminders(prev => [...prev, newReminder]);
    }
    
    // Reset form
    setIsAddingNew(false);
    setEditingReminder(null);
  };
  
  const handleToggleComplete = (id: string) => {
    setReminders(prev => 
      prev.map(r => 
        r.id === id 
          ? { ...r, completed: !r.completed } 
          : r
      )
    );
  };
  
  const handleCancelClick = () => {
    setIsAddingNew(false);
    setEditingReminder(null);
  };
  
  // Filter reminders by completion status
  const upcomingReminders = reminders.filter(r => !r.completed);
  const completedReminders = reminders.filter(r => r.completed);
  
  return (
    <DashboardLayout title="Reminders & Check-Ins">
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
          <Plus className="h-4 w-4 mr-1.5" />
          Add Reminder
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {/* Reminders List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-primary mr-2" />
                <h3 className="font-semibold text-gray-800 dark:text-white">Upcoming Reminders</h3>
                <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-0.5 rounded-full">
                  {upcomingReminders.length}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              {upcomingReminders.length === 0 ? (
                <div className="text-center py-10">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                    <Calendar className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No Upcoming Reminders</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                    Set up reminders to keep track of important tasks related to your will and estate planning.
                  </p>
                  <button
                    onClick={handleAddNewClick}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors inline-flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Reminder
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingReminders.map((reminder) => (
                    <div 
                      key={reminder.id}
                      className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between"
                    >
                      <div className="flex items-start">
                        <button
                          onClick={() => handleToggleComplete(reminder.id)}
                          className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center mr-3 mt-1 cursor-pointer hover:bg-primary/10 transition-colors"
                        >
                          {reminder.completed && <CheckCircle className="h-4 w-4 text-primary" />}
                        </button>
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-white">{reminder.title}</h4>
                          {reminder.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {reminder.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center mr-3">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(reminder.date).toLocaleDateString()}
                            </span>
                            {reminder.time && (
                              <span className="flex items-center mr-3">
                                <Clock className="h-3 w-3 mr-1" />
                                {reminder.time}
                              </span>
                            )}
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">
                              {reminder.repeat === 'never' ? 'One-time' : `Repeats ${reminder.repeat}`}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex mt-3 sm:mt-0 space-x-2 ml-auto">
                        <button 
                          onClick={() => handleEditClick(reminder)}
                          className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(reminder.id)}
                          className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-red-500 dark:text-red-400 transition-colors"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Completed Reminders Section */}
              {completedReminders.length > 0 && (
                <div className="mt-8">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Completed ({completedReminders.length})
                  </h4>
                  
                  <div className="space-y-2">
                    {completedReminders.map((reminder) => (
                      <div 
                        key={reminder.id}
                        className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between opacity-60"
                      >
                        <div className="flex items-center">
                          <button
                            onClick={() => handleToggleComplete(reminder.id)}
                            className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3 cursor-pointer"
                          >
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </button>
                          <div>
                            <h4 className="font-medium text-gray-800 dark:text-white line-through">{reminder.title}</h4>
                            <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(reminder.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteClick(reminder.id)}
                          className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-red-500 dark:text-red-400 transition-colors"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Add/Edit Form */}
        <AnimatePresence>
          {(isAddingNew || editingReminder) ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-white">
                  {editingReminder ? 'Edit Reminder' : 'New Reminder'}
                </h3>
              </div>
              
              <div className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title*
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-white"
                      placeholder="Reminder title"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-white resize-none"
                      placeholder="Add more details..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date*
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Time (Optional)
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Repeat
                    </label>
                    <select
                      name="repeat"
                      value={formData.repeat}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-white"
                    >
                      <option value="never">Never (One-time)</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6 flex space-x-2">
                  <button
                    onClick={handleSaveClick}
                    disabled={!formData.title || !formData.date}
                    className={`px-4 py-2 rounded-md flex items-center justify-center ${
                      !formData.title || !formData.date
                        ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-400'
                        : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
                  >
                    Save
                  </button>
                  <button 
                    onClick={handleCancelClick}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-white flex items-center">
                  <BellRing className="h-5 w-5 text-primary mr-2" />
                  Why Set Reminders?
                </h3>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    Regular check-ins and reminders help ensure your will and estate planning documents stay up-to-date with your life circumstances.
                  </p>
                  
                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                    <h4 className="font-medium text-gray-800 dark:text-white mb-2">Recommended Reminders</h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs mr-2 mt-0.5 flex-shrink-0">✓</div>
                        <div>Annual review of your will and beneficiaries</div>
                      </li>
                      <li className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs mr-2 mt-0.5 flex-shrink-0">✓</div>
                        <div>Check-in after major life events (marriage, birth of children, etc.)</div>
                      </li>
                      <li className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs mr-2 mt-0.5 flex-shrink-0">✓</div>
                        <div>Executor and beneficiary contact information updates</div>
                      </li>
                      <li className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs mr-2 mt-0.5 flex-shrink-0">✓</div>
                        <div>Semi-annual review of supporting documents</div>
                      </li>
                    </ul>
                  </div>
                  
                  <button
                    onClick={handleAddNewClick}
                    className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-lg transition-colors mt-4 flex items-center justify-center"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add New Reminder
                  </button>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default RemindersPage;