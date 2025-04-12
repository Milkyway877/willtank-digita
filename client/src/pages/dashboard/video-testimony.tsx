import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
  Play, Trash2, Plus, AlertTriangle, FileVideo, Calendar, Clock, Film, Info 
} from 'lucide-react';

interface VideoTestimony {
  id: string;
  willTitle: string;
  dateRecorded: string;
  duration: string;
  videoUrl?: string;
}

const VideoTestimonyPage = () => {
  const [videos, setVideos] = useState<VideoTestimony[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoTestimony | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, navigate] = useLocation();
  const { user } = useAuth();

  // Load videos from storage (in a real app, this would come from an API)
  useEffect(() => {
    // Simulate loading from API
    setIsLoading(true);
    
    setTimeout(() => {
      // Check if there's a recorded video
      const videoRecorded = localStorage.getItem('willVideoRecorded');
      
      if (videoRecorded === 'true') {
        // Create sample video testimony data
        setVideos([{
          id: '1',
          willTitle: 'My Last Will and Testament',
          dateRecorded: new Date().toLocaleDateString(),
          duration: '1:24',
        }]);
      }
      
      setIsLoading(false);
    }, 800);
  }, []);

  const handleDeleteClick = (video: VideoTestimony) => {
    setSelectedVideo(video);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedVideo) return;
    
    // Remove video from list
    setVideos(prev => prev.filter(v => v.id !== selectedVideo.id));
    
    // In a real app, this would also delete from storage/database
    localStorage.removeItem('willVideoRecorded');
    
    // Close modal
    setIsDeleteModalOpen(false);
    setSelectedVideo(null);
    
    // Show notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg z-50 animate-fade-in';
    notification.innerHTML = '<div class="flex items-center"><span class="mr-2">✓</span>Video testimony deleted successfully</div>';
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
  };

  const handleRecordNew = () => {
    navigate('/video-recording');
  };

  return (
    <DashboardLayout title="Video Testimonies">
      <div className="mb-6 flex justify-between items-center">
        <p className="text-gray-600 dark:text-gray-400">
          Manage your video testimonies attached to your wills
        </p>
        <button
          onClick={handleRecordNew}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Record New Video
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : videos.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex justify-center mb-4">
            <FileVideo className="h-16 w-16 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Video Testimonies Found</h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
            You haven't recorded any video testimonies yet. Video testimonies help establish that you created your will voluntarily and were of sound mind.
          </p>
          <button
            onClick={handleRecordNew}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center mx-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Record Your First Video
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {videos.map(video => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              {/* Video Preview Area */}
              <div className="aspect-video bg-gray-900 relative flex items-center justify-center">
                <Film className="h-16 w-16 text-gray-700/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => video.videoUrl && window.open(video.videoUrl, '_blank')}
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors rounded-full p-4"
                  >
                    <Play className="h-8 w-8 text-white" fill="white" />
                  </button>
                </div>
              </div>
              
              {/* Video Info */}
              <div className="p-5">
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold text-lg">{video.willTitle}</h3>
                  <button
                    onClick={() => handleDeleteClick(video)}
                    className="text-red-500 hover:text-red-700 transition-colors p-1"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="flex flex-col space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Recorded on: {video.dateRecorded}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Duration: {video.duration}</span>
                  </div>
                </div>
                
                <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md flex items-start">
                  <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    This video testimony helps establish that you created your will voluntarily and were of sound mind at the time of creation.
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedVideo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md mx-4 relative"
          >
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-amber-500 h-6 w-6 mr-3" />
              <h3 className="text-xl font-bold">Confirm Deletion</h3>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete this video testimony? Deleting this video testimony means you will need to re-record and re-attach a new one for this will.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete Video
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default VideoTestimonyPage;