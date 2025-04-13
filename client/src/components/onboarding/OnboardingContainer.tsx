import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'wouter'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { apiRequest } from '@/lib/queryClient'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'

// Steps
import WelcomeStep from './steps/WelcomeStep'
import WhyWeExistStep from './steps/WhyWeExistStep'
import CustomizeExperienceStep from './steps/CustomizeExperienceStep'
import SecurityStep from './steps/SecurityStep'
import TemplateStep from './steps/TemplateStep'
import WorkspaceStep from './steps/WorkspaceStep'
import PaywallStep from './steps/PaywallStep'

// Import Aurora background
import AnimatedAurora from '@/components/ui/AnimatedAurora'

// Types
type OnboardingStepProps = {
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  animateOnExit?: boolean
}

const totalSteps = 7

const OnboardingContainer: React.FC = () => {
  const [, navigate] = useLocation();
  const { user, refetchUser } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [animateOnExit, setAnimateOnExit] = useState(true)
  
  // Check if onboarding is already completed from the user object
  useEffect(() => {
    if (user?.hasCompletedOnboarding) {
      // Navigate to template selection if onboarding was already completed
      navigate('/template-selection');
    }
  }, [navigate, user]);
  
  // Mutation to complete onboarding
  const completeOnboardingMutation = useMutation({
    mutationFn: async (profile: any) => {
      const res = await apiRequest('POST', '/api/onboarding/complete', { profile });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to complete onboarding');
      }
      return res.json();
    },
    onSuccess: async () => {
      toast({
        title: "Onboarding completed",
        description: "Your preferences have been saved",
      });
      // Refetch user data to update the hasCompletedOnboarding flag
      await refetchUser();
      navigate('/template-selection');
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to complete onboarding",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }
  
  const handleSkip = () => {
    setAnimateOnExit(false)
    setCurrentStep(totalSteps - 1) // Go to paywall
    
    // Save user profile with preferences
    const profile = {
      preferences: {
        reason: selectedReason || 'general',
        template: selectedTemplate || 'standard',
      }
    };
    
    // Complete onboarding via API
    completeOnboardingMutation.mutate(profile);
  }

  const selectReason = (reason: string) => {
    setSelectedReason(reason)
  }

  const selectTemplate = (template: string) => {
    setSelectedTemplate(template)
  }
  
  // Reset animation flag when step changes
  useEffect(() => {
    setAnimateOnExit(true)
  }, [currentStep])

  const renderStepContent = () => {
    const commonProps = {
      onNext: handleNext,
      onBack: handleBack, 
      onSkip: handleSkip,
      animateOnExit
    }
    
    switch (currentStep) {
      case 0:
        return <WelcomeStep {...commonProps} />
      case 1:
        return <WhyWeExistStep {...commonProps} />
      case 2:
        return <CustomizeExperienceStep 
          {...commonProps} 
          selectedReason={selectedReason}
          onSelectReason={selectReason}
        />
      case 3:
        return <SecurityStep {...commonProps} />
      case 4:
        return <TemplateStep 
          {...commonProps} 
          selectedTemplate={selectedTemplate}
          onSelectTemplate={selectTemplate}
        />
      case 5:
        return <WorkspaceStep {...commonProps} />
      case 6:
        return <PaywallStep {...commonProps} />
      default:
        return <WelcomeStep {...commonProps} />
    }
  }
  
  return (
    <div className="min-h-screen w-full flex flex-col overflow-hidden relative bg-gradient-to-b from-slate-50 to-white">
      {/* Animated Aurora Background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <AnimatedAurora />
      </div>
      
      {/* Header with Skip & Progress */}
      <header className="w-full p-4 flex justify-between items-center z-10">
        <div className="flex items-center">
          {currentStep > 0 && (
            <button 
              onClick={handleBack}
              className="flex items-center text-neutral-500 hover:text-primary transition-colors"
            >
              <ChevronLeft size={20} />
              <span className="ml-1">Back</span>
            </button>
          )}
        </div>
        
        {currentStep < totalSteps - 1 && (
          <button 
            onClick={handleSkip}
            className="text-neutral-400 hover:text-primary transition-colors"
          >
            Skip <X size={16} className="inline ml-1 mb-0.5" />
          </button>
        )}
      </header>
      
      {/* Progress Indicator */}
      <div className="w-full px-6 pt-2 pb-6 flex justify-center z-10">
        <div className="flex space-x-1.5">
          {Array.from({ length: totalSteps - 1 }).map((_, idx) => (
            <div 
              key={idx}
              className={`h-1.5 w-6 rounded-full transition-all duration-300 ${
                idx === currentStep ? 'bg-primary w-8' : 
                idx < currentStep ? 'bg-primary opacity-70' : 'bg-neutral-200'
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center w-full max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={animateOnExit ? { opacity: 0, y: -20 } : {}}
            transition={{ duration: 0.4 }}
            className="w-full max-w-3xl mx-auto"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </main>
      
      {/* Footer with Logo */}
      <footer className="w-full p-4 flex justify-center text-neutral-500 z-10">
        <Link href="/">
          <span className="text-primary font-bold tracking-tight hover:text-primary-dark transition-colors cursor-pointer">
            WillTank
          </span>
        </Link>
      </footer>
    </div>
  )
}

export default OnboardingContainer