import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, User, Mail, Phone, MapPin, Edit, Plus, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Beneficiary {
  id: string;
  name: string;
  relationship: string;
  email?: string;
  phone?: string;
  location?: string;
}

interface Will {
  id: number;
  userId: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isComplete: boolean;
  beneficiaries?: Beneficiary[];
}

interface BeneficiariesProps {
  initialBeneficiaries?: Beneficiary[];
  willId?: number;
}

const defaultBeneficiaries: Beneficiary[] = [];

const Beneficiaries: React.FC<BeneficiariesProps> = ({
  initialBeneficiaries = defaultBeneficiaries,
  willId
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(initialBeneficiaries);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const { toast } = useToast();
  
  // Fetch will details if willId is provided
  const { data: will, isLoading: isLoadingWill } = useQuery<Will>({
    queryKey: ['/api/wills', willId],
    queryFn: async () => {
      if (!willId) return null;
      const res = await apiRequest('GET', `/api/wills/${willId}`);
      return res.json();
    },
    enabled: !!willId
  });
  
  // Extract beneficiaries from will data if available
  useEffect(() => {
    if (will?.beneficiaries) {
      setBeneficiaries(will.beneficiaries);
    } else if (will && will.content) {
      // Parse content to potentially extract beneficiary data
      // For example, extract a JSON section from the will content
      try {
        const contentObj = JSON.parse(will.content);
        if (contentObj.beneficiaries && Array.isArray(contentObj.beneficiaries)) {
          setBeneficiaries(contentObj.beneficiaries);
        }
      } catch (e) {
        // If content isn't parseable as JSON, that's ok - it might be plain text
        console.log("Will content doesn't contain parseable beneficiaries");
      }
    }
  }, [will]);

  // Toggle card expansion
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div 
        onClick={toggleExpand}
        className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center cursor-pointer"
      >
        <div className="flex items-center">
          <Users className="h-5 w-5 text-primary mr-2" />
          <h3 className="font-semibold text-gray-800 dark:text-white">Beneficiaries</h3>
          <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">
            {beneficiaries.length}
          </span>
        </div>
        <button 
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            toggleExpand();
          }}
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Beneficiaries List */}
            <div className="p-4">
              <div className="space-y-3">
                {isLoadingWill ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading beneficiaries...</p>
                  </div>
                ) : beneficiaries.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="mx-auto w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
                      <Users className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h4 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-1">No Beneficiaries Added</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-4">
                      Add beneficiaries to specify who should receive your assets and be contacted when your will is executed.
                    </p>
                  </div>
                ) : (
                  beneficiaries.map((beneficiary) => (
                    <motion.div
                      key={beneficiary.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="ml-3">
                          <h4 className="font-medium text-gray-800 dark:text-white">{beneficiary.name}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{beneficiary.relationship}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 text-xs">
                        {beneficiary.email && (
                          <div className="flex items-center bg-white dark:bg-gray-800 py-1 px-2 rounded border border-gray-200 dark:border-gray-700">
                            <Mail className="h-3 w-3 text-gray-500 mr-1" />
                            <span className="truncate max-w-[120px]">{beneficiary.email}</span>
                          </div>
                        )}
                        
                        {beneficiary.phone && (
                          <div className="flex items-center bg-white dark:bg-gray-800 py-1 px-2 rounded border border-gray-200 dark:border-gray-700">
                            <Phone className="h-3 w-3 text-gray-500 mr-1" />
                            <span>{beneficiary.phone}</span>
                          </div>
                        )}
                        
                        {beneficiary.location && (
                          <div className="flex items-center bg-white dark:bg-gray-800 py-1 px-2 rounded border border-gray-200 dark:border-gray-700">
                            <MapPin className="h-3 w-3 text-gray-500 mr-1" />
                            <span>{beneficiary.location}</span>
                          </div>
                        )}
                        
                        <button 
                          onClick={() => setSelectedBeneficiary(beneficiary)}
                          className="ml-auto flex-shrink-0 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Add New Button */}
              <button className="mt-4 w-full flex items-center justify-center py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors">
                <Plus className="h-4 w-4 mr-1" />
                Add Beneficiary
              </button>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
              <p>
                Keeping your beneficiaries' contact information up-to-date ensures they can be reached when needed.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed Preview (when not expanded) */}
      {!isExpanded && (
        <div className="p-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Total Beneficiaries: {beneficiaries.length}</span>
            <button className="text-xs text-primary hover:text-primary-dark transition-colors">
              Manage
            </button>
          </div>
          <p className="text-xs">
            {beneficiaries.map(b => b.name).join(', ')}
          </p>
        </div>
      )}

      {/* Edit Modal (would be implemented with a proper modal component) */}
      {/* For simplicity, this is just a placeholder */}
    </div>
  );
};

export default Beneficiaries;