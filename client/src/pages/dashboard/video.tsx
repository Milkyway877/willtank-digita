import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Video, Play, Download, RefreshCcw, ArrowLeft, Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';

interface WillData {
  id: number;
  title: string;
  videoRecordingUrl?: string;
  lastUpdated?: Date;
}

const VideoPage: React.FC = () => {
  const [, navigate] = useLocation();
  const [hasRecording, setHasRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [recordingDate, setRecordingDate] = useState<string>('');
  const [selectedWill, setSelectedWill] = useState<WillData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user's wills from API
  const { data: wills, isLoading: isLoadingWills } = useQuery<WillData[]>({
    queryKey: ['/api/wills'],
    onSuccess: (data) => {
      if (data.length > 0) {
        // Find the first will with a video recording
        const willWithVideo = data.find(will => will.videoRecordingUrl);
        
        if (willWithVideo) {
          setSelectedWill(willWithVideo);
          setHasRecording(true);
          
          if (willWithVideo.lastUpdated) {
            setRecordingDate(new Date(willWithVideo.lastUpdated).toLocaleDateString());
          } else {
            setRecordingDate(new Date().toLocaleDateString());
          }
        } else {
          // If no will has a video, just select the first one
          setSelectedWill(data[0]);
        }
      }
      setLoading(false);
    },
    onError: () => {
      setLoading(false);
    }
  });

  const handlePlayVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleRecordNew = () => {
    if (selectedWill) {
      navigate(`/video-recording?willId=${selectedWill.id}`);
    } else {
      navigate('/video-recording');
    }
  };

  return (
    <DashboardLayout title="Video Testimony">
      <div className="mb-6 flex items-center">
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center">
            <Video className="h-5 w-5 text-primary mr-2" />
            <h3 className="font-semibold text-gray-800 dark:text-white">Video Will Testimony</h3>
          </div>
          
          {hasRecording && (
            <div className="flex space-x-2">
              <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
                <Download className="h-5 w-5" />
              </button>
              <button 
                onClick={handleRecordNew}
                className="px-3 py-1.5 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors flex items-center"
              >
                <RefreshCcw className="h-4 w-4 mr-1.5" />
                Record New
              </button>
            </div>
          )}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {loading || isLoadingWills ? (
            <div className="p-6 text-center">
              <div className="max-w-md mx-auto flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Loading video testimony...</p>
              </div>
            </div>
          ) : hasRecording && selectedWill?.videoRecordingUrl ? (
            <div className="p-6">
              {/* Video Player */}
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative mb-4">
                <video 
                  ref={videoRef}
                  className="w-full h-full object-contain"
                  onEnded={() => setIsPlaying(false)}
                  src={selectedWill.videoRecordingUrl}
                  preload="metadata"
                ></video>
                
                {!isPlaying && (
                  <button 
                    onClick={handlePlayVideo}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/80 flex items-center justify-center">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                  </button>
                )}
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <span>Will: </span>
                  <span className="font-medium text-primary">{selectedWill.title}</span>
                </div>
                <div>Recorded: {recordingDate}</div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="max-w-md mx-auto">
                <div className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Video className="h-10 w-10 text-primary" />
                  </div>
                </div>
                
                <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No Video Recording Yet</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  A video testimony adds a personal touch to your will and helps clarify your intentions to your beneficiaries.
                </p>
                
                <button 
                  onClick={handleRecordNew}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors flex items-center mx-auto"
                  disabled={!selectedWill}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Record Video Testimony
                </button>
                
                {!selectedWill && (
                  <p className="mt-4 text-sm text-amber-500">
                    You need to create a will first before recording a video testimony.
                  </p>
                )}
              </div>
            </div>
          )}
        </motion.div>
        
        {/* Why Video Testimony Section */}
        <div className="p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <h4 className="font-medium text-gray-800 dark:text-white mb-2">Why Record a Video Testimony?</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            A video testimony can:
          </p>
          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400 list-disc pl-5">
            <li>Provide context and personal explanations for your decisions</li>
            <li>Help prevent misunderstandings among beneficiaries</li>
            <li>Convey sentiments that may not be easily expressed in written form</li>
            <li>Add a personal touch to your estate planning</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VideoPage;