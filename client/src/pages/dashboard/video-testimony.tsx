import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { saveAs } from 'file-saver';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  ArrowLeft, Download, Share, Video, Film, Play, Pause, Volume2, VolumeX, RefreshCw
} from 'lucide-react';

const VideoTestimonyPage: React.FC = () => {
  const [, navigate] = useLocation();
  const [hasVideo, setHasVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoBlob = useRef<Blob | null>(null);
  
  useEffect(() => {
    // In a real app, this would fetch the video from an API or cloud storage
    // For this demo, we'll check localStorage to see if a video has been recorded
    const videoRecorded = localStorage.getItem('willVideoRecorded');
    
    if (videoRecorded === 'true') {
      setHasVideo(true);
      
      // In a real app, we would load the video here
      // For this demo, we'll just simulate having a video
    }
  }, []);
  
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
  
  const handleDownload = async () => {
    // In a real app, we would download the actual video file
    try {
      if (videoBlob.current) {
        saveAs(videoBlob.current, "video_testimony.mp4");
      } else {
        // Create a placeholder video for demo purposes
        const response = await fetch("/sample-video.mp4");
        const blob = await response.blob();
        saveAs(blob, "video_testimony.mp4");
      }
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg z-50 animate-fade-in';
      notification.innerHTML = '<div class="flex items-center"><span class="mr-2">✓</span>Video downloaded successfully</div>';
      document.body.appendChild(notification);
      
      // Remove notification after 3 seconds
      setTimeout(() => {
        notification.classList.add('animate-fade-out');
        setTimeout(() => {
          try {
            document.body.removeChild(notification);
          } catch (e) {
            // Element might have been removed already
          }
        }, 500);
      }, 3000);
    } catch (error) {
      console.error("Error downloading video:", error);
    }
  };
  
  const handleShare = () => {
    // In a real app, this would open a sharing dialog
    alert('Sharing functionality would be implemented here');
  };
  
  const handleRecordNew = () => {
    navigate('/video-recording');
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
              disabled={!hasVideo}
            >
              <Download className={`h-5 w-5 ${!hasVideo ? 'opacity-50' : ''}`} />
            </button>
            <button 
              onClick={handleShare}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
              disabled={!hasVideo}
            >
              <Share className={`h-5 w-5 ${!hasVideo ? 'opacity-50' : ''}`} />
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
          {hasVideo ? (
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
                  poster="/video-thumbnail.jpg" // Replace with actual thumbnail
                >
                  {/* In a real app, we would load the actual video source */}
                  <source src="/sample-video.mp4" type="video/mp4" />
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
                  Recorded on {new Date().toLocaleDateString()} • 2 minutes
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