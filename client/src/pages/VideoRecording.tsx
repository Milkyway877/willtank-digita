import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Info, FileVideo, AlertCircle, ArrowRight } from 'lucide-react';
import AnimatedAurora from '@/components/ui/AnimatedAurora';
import VideoRecorder from '@/components/VideoRecorder';
import { saveWillProgress, WillCreationStep } from '@/lib/will-progress-tracker';

const VideoRecording: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [showScript, setShowScript] = useState(true);
  const [loading, setLoading] = useState(true);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth/sign-in');
    } else {
      // Only set loading to false after auth check
      setLoading(false);
    }
  }, [user, authLoading, navigate]);

  // Handle video recording completion
  const handleComplete = (videoBlob: Blob) => {
    console.log("Video recorded successfully:", videoBlob);
    
    // Mark as completed in localStorage
    localStorage.setItem('willVideoRecorded', 'true');
    localStorage.setItem('willVideoDate', new Date().toISOString());
    
    // Update progress tracker
    saveWillProgress(WillCreationStep.VIDEO_RECORDING);
    
    // Show success notification for 2 seconds before continuing
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg z-50 animate-fade-in';
    notification.innerHTML = '<div class="flex items-center"><span class="mr-2">✓</span>Video recorded successfully</div>';
    document.body.appendChild(notification);
    
    // Remove notification and continue after 2 seconds
    setTimeout(() => {
      notification.classList.add('animate-fade-out');
      setTimeout(() => {
        try {
          document.body.removeChild(notification);
        } catch (e) {
          // Element might have been removed already
        }
      }, 500);
    }, 2000);
  };

  // Skip recording and continue
  const handleSkip = () => {
    console.log("SKIP RECORDING BUTTON CLICKED");
    
    // Mark as completed in localStorage
    localStorage.setItem('willVideoRecorded', 'true');
    
    // Update progress tracker
    saveWillProgress(WillCreationStep.VIDEO_RECORDING);
    
    // Navigate to next step
    navigate('/final-review');
  };

  // Continue to final review after recording
  const handleContinue = () => {
    navigate('/final-review');
  };

  // Loading state during auth check
  if (loading) {
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
      
      <div className="container mx-auto py-16 px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Record Confirmation Video</h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Recording a brief video statement helps establish that you created this will voluntarily and were of sound mind.
            </p>
          </div>
          
          {/* Video Area */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden p-6">
            <VideoRecorder onComplete={handleComplete} onSkip={handleSkip} />
            
            {/* Script Card */}
            <div className="mt-6 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div 
                className="bg-gray-100 dark:bg-gray-900 px-4 py-3 flex justify-between items-center cursor-pointer"
                onClick={() => setShowScript(!showScript)}
              >
                <div className="flex items-center">
                  <FileVideo className="h-5 w-5 text-primary mr-2" />
                  <h3 className="font-medium">Suggested Script</h3>
                </div>
                <span className="text-sm text-primary">{showScript ? 'Hide' : 'Show'}</span>
              </div>
              
              {showScript && (
                <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-gray-700 dark:text-gray-300 text-sm">
                    <p className="mb-3">
                      "I, [your full legal name], am recording this video on [today's date] to confirm that this is my Last Will and Testament.
                    </p>
                    <p className="mb-3">
                      I am of sound mind and body, and I am creating this will voluntarily, without any duress or undue influence from others.
                    </p>
                    <p className="mb-3">
                      This will reflects my wishes for the distribution of my assets and property after my death. I have carefully considered my decisions, and I believe they are fair and appropriate.
                    </p>
                    <p>
                      I understand that this video will be stored securely as evidence of my intentions and mental capacity at the time of creating my will."
                    </p>
                  </div>
                  
                  <div className="mt-4 flex items-start">
                    <Info className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      This script is a suggestion. Feel free to use your own words as long as you clearly state your name, the date, and that you are voluntarily creating this will.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Continue Button */}
          <div className="mt-10 flex justify-center">
            <button
              onClick={handleContinue}
              className="flex items-center px-8 py-3 rounded-lg text-white font-medium bg-gradient-to-r from-primary to-blue-500 hover:from-primary-dark hover:to-blue-600 shadow-lg hover:shadow-xl transition-all"
            >
              Continue to Final Review
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VideoRecording;