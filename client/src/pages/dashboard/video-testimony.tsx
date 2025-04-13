import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  ArrowLeft, Download, Share, Video, Film, Play, Pause, Volume2, VolumeX, RefreshCw, Loader2
} from 'lucide-react';

interface Will {
  id: number;
  userId: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isComplete: boolean;
  videoUrl?: string;
  videoRecordedAt?: string;
}

const VideoTestimonyPage: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get the most recent will with video
  const { data: wills, isLoading: isLoadingWills } = useQuery<Will[]>({
    queryKey: ['/api/wills'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/wills');
      return res.json();
    }
  });
  
  // Get the most recent will with video recording
  const willWithVideo = wills?.find(will => will.videoUrl) || null;
  
  useEffect(() => {
    if (!isLoadingWills) {
      setIsLoading(false);
      
      if (willWithVideo?.videoUrl) {
        setVideoSrc(willWithVideo.videoUrl);
      }
    }
  }, [willWithVideo, isLoadingWills]);
  
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };
  
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };
  
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
    }
  };
  
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };
  
  const handleDownload = () => {
    if (!videoSrc) {
      toast({
        title: "No video available",
        description: "You haven't recorded a video testimony yet.",
        variant: "destructive"
      });
      return;
    }
    
    // Create a link to download the video
    const link = document.createElement('a');
    link.href = videoSrc;
    link.download = "video_testimony.mp4";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download started",
      description: "Your video testimony is downloading.",
      variant: "default"
    });
  };
  
  const handleShare = () => {
    toast({
      title: "Sharing not available",
      description: "Sharing functionality will be available in a future update.",
      variant: "default"
    });
  };
  
  const handleRecordNew = () => {
    if (willWithVideo) {
      navigate(`/video-recording?willId=${willWithVideo.id}`);
    } else {
      toast({
        title: "No will found",
        description: "Please create a will before recording a video testimony.",
        variant: "destructive"
      });
      navigate('/dashboard');
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
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center">
            <Film className="h-5 w-5 text-primary mr-2" />
            <h3 className="font-semibold text-gray-800 dark:text-white">Video Testimony</h3>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={handleDownload}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
              disabled={!videoSrc}
            >
              <Download className={`h-5 w-5 ${!videoSrc ? 'opacity-50' : ''}`} />
            </button>
            <button 
              onClick={handleShare}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
              disabled={!videoSrc}
            >
              <Share className={`h-5 w-5 ${!videoSrc ? 'opacity-50' : ''}`} />
            </button>
            <button 
              onClick={handleRecordNew}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Video Player */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading your video testimony...</p>
            </div>
          ) : videoSrc ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col w-full"
            >
              <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  className="w-full h-full object-contain"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => setIsPlaying(false)}
                >
                  <source src={videoSrc} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                
                {/* Play/Pause Overlay */}
                <div 
                  className="absolute inset-0 flex items-center justify-center cursor-pointer"
                  onClick={handlePlayPause}
                >
                  {!isPlaying && (
                    <div className="bg-black/40 rounded-full p-4">
                      <Play className="h-10 w-10 text-white" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Video Controls */}
              <div className="flex items-center space-x-4 mb-2">
                <button
                  onClick={handlePlayPause}
                  className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                </button>
                
                <div className="text-sm text-gray-600 dark:text-gray-400 w-20">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
                
                <div className="flex-1">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${(currentTime / (duration || 1)) * 100}%, transparent ${(currentTime / (duration || 1)) * 100}%, transparent 100%)`,
                      backgroundSize: '100% 100%',
                      backgroundRepeat: 'no-repeat'
                    }}
                  />
                </div>
                
                <button
                  onClick={handleMuteToggle}
                  className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="h-6 w-6" />
                  ) : (
                    <Volume2 className="h-6 w-6" />
                  )}
                </button>
                
                <div className="w-24">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${volume * 100}%, transparent ${volume * 100}%, transparent 100%)`,
                      backgroundSize: '100% 100%',
                      backgroundRepeat: 'no-repeat'
                    }}
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium text-gray-800 dark:text-white mb-2">About this video</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Recorded on {willWithVideo?.videoRecordedAt 
                    ? new Date(willWithVideo.videoRecordedAt).toLocaleDateString() 
                    : new Date().toLocaleDateString()}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                  This video testimony is a spoken confirmation of your will and testament. It helps verify your intentions and can be used to clarify any ambiguities in your written will.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="bg-gray-100 dark:bg-gray-700 p-5 rounded-full mb-6">
                <Video className="h-12 w-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">No Video Testimony Found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
                You haven't recorded a video testimony yet. Recording a video can help clarify your intentions and provide additional context to your written will.
              </p>
              <button 
                onClick={handleRecordNew}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center"
              >
                <Video className="h-4 w-4 mr-2" />
                Record Video Testimony
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VideoTestimonyPage;