import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { BarChart, ArrowLeft, CheckCircle, AlertCircle, Info, Award, Clock } from 'lucide-react';
import { useLocation } from 'wouter';

interface TrustFactor {
  id: string;
  name: string;
  description: string;
  importance: 'high' | 'medium' | 'low';
  completed: boolean;
  completionDate?: string;
}

const TrustProgressPage: React.FC = () => {
  const [, navigate] = useLocation();
  const [trustFactors, setTrustFactors] = useState<TrustFactor[]>([
    {
      id: 'will',
      name: 'Will Document',
      description: 'Create your will document with all necessary information.',
      importance: 'high',
      completed: true,
      completionDate: '2024-05-01'
    },
    {
      id: 'executor',
      name: 'Executor Assignment',
      description: 'Designate someone to execute your will.',
      importance: 'high',
      completed: true,
      completionDate: '2024-05-01'
    },
    {
      id: 'beneficiaries',
      name: 'Beneficiaries',
      description: 'List all beneficiaries and their inheritance details.',
      importance: 'high',
      completed: true,
      completionDate: '2024-05-01'
    },
    {
      id: 'assets',
      name: 'Assets Documentation',
      description: 'Document your assets and their distribution.',
      importance: 'high',
      completed: true,
      completionDate: '2024-05-01'
    },
    {
      id: 'video',
      name: 'Video Testimony',
      description: 'Record a video testimony explaining your will.',
      importance: 'medium',
      completed: true,
      completionDate: '2024-05-15'
    },
    {
      id: 'documents',
      name: 'Supporting Documents',
      description: 'Upload supporting documents for your will.',
      importance: 'medium',
      completed: false
    },
    {
      id: 'delivery',
      name: 'Delivery Instructions',
      description: 'Specify how your will should be delivered.',
      importance: 'medium',
      completed: false
    },
    {
      id: 'legal',
      name: 'Legal Review',
      description: 'Have a legal professional review your will.',
      importance: 'low',
      completed: false
    },
    {
      id: 'witnesses',
      name: 'Witness Signatures',
      description: 'Have your will signed by witnesses.',
      importance: 'high',
      completed: false
    },
    {
      id: 'review',
      name: 'Regular Review',
      description: 'Schedule regular reviews of your will.',
      importance: 'low',
      completed: false
    }
  ]);
  
  // Calculate progress
  const completedFactors = trustFactors.filter(f => f.completed);
  const highImportanceFactors = trustFactors.filter(f => f.importance === 'high');
  const completedHighImportance = highImportanceFactors.filter(f => f.completed);
  
  const overallProgress = Math.round((completedFactors.length / trustFactors.length) * 100);
  const highImportanceProgress = Math.round((completedHighImportance.length / highImportanceFactors.length) * 100);
  
  // Filter trust factors
  const [filterOption, setFilterOption] = useState<'all' | 'completed' | 'pending'>('all');
  const filteredFactors = trustFactors.filter(factor => {
    if (filterOption === 'completed') return factor.completed;
    if (filterOption === 'pending') return !factor.completed;
    return true;
  });
  
  // Sort trust factors by importance and completion status
  const sortedFactors = [...filteredFactors].sort((a, b) => {
    // First by completion status (pending first)
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    
    // Then by importance
    const importanceOrder = { high: 0, medium: 1, low: 2 };
    return importanceOrder[a.importance] - importanceOrder[b.importance];
  });
  
  const handleCompleteTask = (id: string) => {
    setTrustFactors(factors => 
      factors.map(factor => 
        factor.id === id 
          ? { 
              ...factor, 
              completed: !factor.completed,
              completionDate: !factor.completed ? new Date().toISOString().split('T')[0] : undefined
            } 
          : factor
      )
    );
  };
  
  return (
    <DashboardLayout title="Trust Progress">
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
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Overall Trust Progress</h3>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                <span className="text-sm font-medium text-primary">{overallProgress}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full mb-4">
                <div 
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {completedFactors.length} of {trustFactors.length} completed
                </span>
                <div className="flex ml-auto">
                  <div className="flex items-center mr-3">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-1.5"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Completed</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 mr-1.5"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Pending</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* High-Priority Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3">High-Priority Factors</h3>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                <span className="text-sm font-medium text-primary">{highImportanceProgress}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full mb-4">
                <div 
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${highImportanceProgress}%` }}
                ></div>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {completedHighImportance.length} of {highImportanceFactors.length} completed
                </span>
                <div className="ml-auto">
                  {highImportanceProgress === 100 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      <CheckCircle className="mr-1 h-3 w-3" /> All Complete
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                      <AlertCircle className="mr-1 h-3 w-3" /> Action Needed
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Trust Factor List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center">
                <BarChart className="h-5 w-5 text-primary mr-2" />
                <h3 className="font-semibold text-gray-800 dark:text-white">Trust Factors</h3>
              </div>
              
              <div className="flex space-x-1 text-sm">
                <button 
                  onClick={() => setFilterOption('all')}
                  className={`px-3 py-1 rounded ${
                    filterOption === 'all' 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  All
                </button>
                <button 
                  onClick={() => setFilterOption('pending')}
                  className={`px-3 py-1 rounded ${
                    filterOption === 'pending' 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Pending
                </button>
                <button 
                  onClick={() => setFilterOption('completed')}
                  className={`px-3 py-1 rounded ${
                    filterOption === 'completed' 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="space-y-4">
                {sortedFactors.map((factor) => (
                  <div 
                    key={factor.id}
                    className={`p-4 rounded-lg border ${
                      factor.completed 
                        ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30' 
                        : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start">
                      <div 
                        className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center cursor-pointer mr-3 mt-0.5 ${
                          factor.completed 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-500' 
                            : 'border-2 border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-primary/5'
                        }`}
                        onClick={() => handleCompleteTask(factor.id)}
                      >
                        {factor.completed && <CheckCircle className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-800 dark:text-white flex items-center">
                            {factor.name}
                            <span 
                              className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                factor.importance === 'high' 
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' 
                                  : factor.importance === 'medium' 
                                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' 
                                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                              }`}
                            >
                              {factor.importance.charAt(0).toUpperCase() + factor.importance.slice(1)} priority
                            </span>
                          </h4>
                          
                          {factor.completed && factor.completionDate && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Completed on {new Date(factor.completionDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {factor.description}
                        </p>
                        
                        {!factor.completed && (
                          <div className="mt-3">
                            <button 
                              onClick={() => handleCompleteTask(factor.id)}
                              className="text-xs text-primary hover:text-primary-dark transition-colors"
                            >
                              Mark as Complete
                            </button>
                            {factor.id === 'documents' && (
                              <button 
                                onClick={() => navigate('/dashboard/documents')}
                                className="text-xs text-primary hover:text-primary-dark transition-colors ml-4"
                              >
                                Upload Documents
                              </button>
                            )}
                            {factor.id === 'delivery' && (
                              <button 
                                onClick={() => navigate('/dashboard/delivery')}
                                className="text-xs text-primary hover:text-primary-dark transition-colors ml-4"
                              >
                                Set Up Delivery
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Info Panel */}
        <div className="space-y-6">
          {/* Trust Score */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-white flex items-center">
                <Award className="h-5 w-5 text-primary mr-2" />
                Your Trust Score
              </h3>
            </div>
            
            <div className="p-6 text-center">
              <div className="inline-block relative">
                <svg className="w-32 h-32" viewBox="0 0 100 100">
                  <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke="#e5e7eb" 
                    strokeWidth="8" 
                    className="dark:stroke-gray-700" 
                  />
                  <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    strokeDasharray="282.7" 
                    strokeDashoffset={282.7 - (282.7 * overallProgress) / 100} 
                    strokeLinecap="round" 
                    className="text-primary" 
                    transform="rotate(-90 50 50)" 
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-3xl font-bold text-gray-800 dark:text-white">{overallProgress}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">out of 100</span>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium text-xl text-gray-800 dark:text-white">
                  {overallProgress >= 80 
                    ? 'Excellent' 
                    : overallProgress >= 60 
                      ? 'Good' 
                      : overallProgress >= 40 
                        ? 'Fair' 
                        : 'Needs Attention'}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {overallProgress >= 80 
                    ? 'Your will is well-prepared and secure.' 
                    : overallProgress >= 60 
                      ? 'Your will is making good progress.' 
                      : overallProgress >= 40 
                        ? 'Your will needs more attention.' 
                        : 'Your will requires significant attention.'}
                </p>
              </div>
            </div>
          </div>
          
          {/* What is Trust Score */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-white flex items-center">
                <Info className="h-5 w-5 text-primary mr-2" />
                About Trust Factors
              </h3>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Trust factors are elements that contribute to the completeness and effectiveness of your will. A high trust score indicates a well-prepared estate plan.
              </p>
              
              <div className="mt-4 space-y-3">
                <div className="flex items-start">
                  <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 flex-shrink-0 mt-0.5 mr-2">
                    <span className="text-xs font-bold">H</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-800 dark:text-white">High Priority</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Essential elements for a legally valid will.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5 mr-2">
                    <span className="text-xs font-bold">M</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-800 dark:text-white">Medium Priority</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Important elements that strengthen your will.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 flex-shrink-0 mt-0.5 mr-2">
                    <span className="text-xs font-bold">L</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-800 dark:text-white">Low Priority</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Supplementary elements that enhance your will.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-800 dark:text-white mb-2">Need Help?</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  If you need assistance completing any of these factors, our support team is here to help.
                </p>
                <button className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-lg transition-colors">
                  Get Assistance
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TrustProgressPage;