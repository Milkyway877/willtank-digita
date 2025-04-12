import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Play, Pause, RotateCcw, CheckCircle, Camera, Info, FileVideo, AlertCircle, ArrowRight } from 'lucide-react';
import AnimatedAurora from '@/components/ui/AnimatedAurora';

const VideoRecording: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // State
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [status, setStatus] = useState<'idle' | 'requesting' | 'recording' | 'paused' | 'recorded' | 'playing' | 'error'>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
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

  // Cleanup when unmounting
  useEffect(() => {
    return () => {
      console.log("Cleanup: Stopping any active streams and timers");
      
      // Stop all media tracks
      if (streamRef.current) {
        try {
          streamRef.current.getTracks().forEach(track => {
            track.stop();
            console.log("Track stopped:", track.kind);
          });
        } catch (error) {
          console.error("Error stopping tracks:", error);
        }
      }
      
      // Clear any active timers
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Revoke any blob URLs
      if (videoRef.current && videoRef.current.src && videoRef.current.src.startsWith('blob:')) {
        URL.revokeObjectURL(videoRef.current.src);
      }
    };
  }, []);

  // Initialize camera - BULLETPROOF VERSION
  const initializeCamera = () => {
    console.log("ENABLE CAMERA BUTTON CLICKED");
    
    // First set requesting state to show loading spinner
    setStatus('requesting');
    
    // Check for browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("getUserMedia is not supported in this browser");
      setStatus('error');
      setErrorMessage('Your browser does not support camera access. Please try a different browser like Chrome or Firefox.');
      return;
    }
    
    // Stop any existing streams first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }

    // Get access to camera with minimal options for best compatibility
    navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: "user" },  // Simple user-facing camera request
      audio: true 
    })
    .then(stream => {
      console.log("Camera access granted successfully");
      
      // Store the stream
      streamRef.current = stream;
      
      // Ensure we have the video element
      if (!videoRef.current) {
        throw new Error("Video element not available");
      }
      
      // Connect stream to video element
      try {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true; // Prevent feedback
        
        // Listen for metadata loaded to start play
        videoRef.current.onloadedmetadata = () => {
          if (!videoRef.current) return;
          
          try {
            const playPromise = videoRef.current.play();
            if (playPromise) {
              playPromise.catch(e => {
                console.warn("Auto-play was prevented:", e);
                // Continue anyway, user can click play manually
              });
            }
          } catch (err) {
            console.error("Error playing video:", err);
          }
        };
        
        // Set UI state to idle with camera
        setStatus('idle');
      } catch (err) {
        console.error("Error setting video source:", err);
        setStatus('error');
        setErrorMessage('Error connecting to camera. Please try again or use a different browser.');
      }
    })
    .catch(error => {
      console.error('Camera access error:', error);
      setStatus('error');
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setErrorMessage('Camera access was denied. Please grant permission and try again.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setErrorMessage('No camera found. Please ensure your device has a working camera.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        setErrorMessage('Camera is already in use by another application. Please close other apps using your camera.');
      } else {
        setErrorMessage('Unable to access camera. Please check your permissions or try a different browser.');
      }
    });
  };

  // Start recording
  const startRecording = () => {
    console.log("START RECORDING BUTTON CLICKED");
    
    // Check if we have a stream
    if (!streamRef.current) {
      console.error("Cannot start recording: No camera stream available");
      setErrorMessage('Camera stream not available. Please enable your camera first.');
      setStatus('error');
      return;
    }
    
    try {
      // Reset recording state
      setRecordedChunks([]);
      setRecordingTime(0);
      
      // Start timer to track recording duration
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Create MediaRecorder with basic settings
      let mediaRecorder: MediaRecorder;
      
      try {
        // Try to create with MIME type
        mediaRecorder = new MediaRecorder(streamRef.current);
      } catch (error) {
        console.error("Failed to create MediaRecorder:", error);
        throw error;
      }
      
      // Store reference
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up data handler
      mediaRecorder.ondataavailable = (event) => {
        console.log(`Recording chunk received: ${event.data?.size || 0} bytes`);
        if (event.data && event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };
      
      // Set up stop handler
      mediaRecorder.onstop = () => {
        console.log('MediaRecorder stopped');
        
        // Clear timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        // Set recorded state
        setStatus('recorded');
      };
      
      // Set up error handler
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setStatus('error');
        setErrorMessage('An error occurred during recording. Please try again.');
        
        // Clear timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
      
      // Start recording with small time slices for better compatibility
      mediaRecorder.start(1000); // Collect data every 1 second
      console.log("MediaRecorder started successfully");
      
      // Update UI state
      setStatus('recording');
    } catch (error) {
      console.error('Error starting recording:', error);
      setStatus('error');
      setErrorMessage('Unable to start recording. Your browser may not support this feature or your camera may be in use by another application.');
      
      // Clear timer if it was started
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Pause recording
  const pauseRecording = () => {
    console.log("PAUSE RECORDING BUTTON CLICKED");
    
    if (!mediaRecorderRef.current || status !== 'recording') {
      console.error("Cannot pause: No active recording");
      return;
    }
    
    try {
      mediaRecorderRef.current.pause();
      console.log("Recording paused");
      
      // Update UI
      setStatus('paused');
      
      // Pause timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } catch (error) {
      console.error('Error pausing recording:', error);
      // Continue recording if pause fails
    }
  };

  // Resume recording
  const resumeRecording = () => {
    console.log("RESUME RECORDING BUTTON CLICKED");
    
    if (!mediaRecorderRef.current || status !== 'paused') {
      console.error("Cannot resume: No paused recording");
      return;
    }
    
    try {
      mediaRecorderRef.current.resume();
      console.log("Recording resumed");
      
      // Update UI
      setStatus('recording');
      
      // Resume timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error resuming recording:', error);
      // Try to recover by stopping the recording
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        // Ignore any errors
      }
      setStatus('error');
      setErrorMessage('Error resuming recording. Please try again.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    console.log("STOP RECORDING BUTTON CLICKED");
    
    if (!mediaRecorderRef.current || (status !== 'recording' && status !== 'paused')) {
      console.error("Cannot stop: No active recording");
      return;
    }
    
    try {
      // Stop the recorder
      mediaRecorderRef.current.stop();
      console.log("MediaRecorder stopped explicitly");
      
      // The onstop handler will set the status and clear the timer
      
      // Stop camera tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log(`Track ${track.kind} stopped`);
        });
        
        // Clear video source
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      
      // Force UI update even if error
      setStatus('recorded');
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Play recorded video
  const playRecordedVideo = () => {
    console.log("PLAY RECORDING BUTTON CLICKED");
    
    if (recordedChunks.length === 0) {
      console.error("No recorded video chunks available");
      return;
    }
    
    try {
      // Create blob from recorded chunks
      const mimeType = 'video/webm';
      const blob = new Blob(recordedChunks, { type: mimeType });
      console.log(`Created video blob: ${blob.size} bytes`);
      
      if (!videoRef.current) {
        throw new Error("Video element not available");
      }
      
      // Clean up previous blob URL
      if (videoRef.current.src && videoRef.current.src.startsWith('blob:')) {
        URL.revokeObjectURL(videoRef.current.src);
      }
      
      // Create and set new blob URL
      const objectUrl = URL.createObjectURL(blob);
      videoRef.current.src = objectUrl;
      videoRef.current.controls = true;
      videoRef.current.muted = false;
      
      // Event handlers
      videoRef.current.onplay = () => setStatus('playing');
      videoRef.current.onpause = () => setStatus('recorded');
      videoRef.current.onended = () => setStatus('recorded');
      
      // Start playback
      const playPromise = videoRef.current.play();
      if (playPromise) {
        playPromise.catch(error => {
          console.warn('Auto-play prevented:', error);
          // Allow user to start playback manually
          setStatus('recorded');
        });
      }
    } catch (error) {
      console.error('Error playing recorded video:', error);
      setStatus('error');
      setErrorMessage('Unable to play the recording. Please try recording again.');
    }
  };

  // Re-record video
  const reRecord = () => {
    console.log("RE-RECORD BUTTON CLICKED");
    
    // Reset state
    setRecordedChunks([]);
    setRecordingTime(0);
    setStatus('idle');
    
    // Clean up video element
    if (videoRef.current) {
      if (videoRef.current.src && videoRef.current.src.startsWith('blob:')) {
        URL.revokeObjectURL(videoRef.current.src);
      }
      videoRef.current.src = '';
      videoRef.current.controls = false;
    }
    
    // Re-initialize camera
    initializeCamera();
  };

  // Skip recording and continue
  const skipRecording = () => {
    console.log("SKIP RECORDING BUTTON CLICKED");
    
    // Clean up any active streams
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Mark as completed in localStorage
    localStorage.setItem('willVideoRecorded', 'true');
    
    // Navigate to next step
    navigate('/final-review');
  };

  // Format time for display (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Continue to final review
  const handleContinue = () => {
    console.log("CONTINUE TO FINAL REVIEW BUTTON CLICKED");
    
    if (recordedChunks.length === 0 && status !== 'recorded' && status !== 'playing') {
      console.error("Cannot continue: No recording available");
      return;
    }
    
    // In a real app, you would upload the video to a server here
    
    // Mark as completed in localStorage
    localStorage.setItem('willVideoRecorded', 'true');
    
    // Store the video blob if needed (in a real app you'd upload it)
    if (recordedChunks.length > 0) {
      try {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        console.log(`Saved video blob: ${blob.size} bytes`);
        
        // In a real implementation, you'd upload the blob to your server
        // For now, we'll just store the fact that recording was completed
      } catch (error) {
        console.error("Error creating final blob:", error);
      }
    }
    
    // Navigate to next step
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {/* Video Display */}
            <div className="w-full aspect-video bg-black relative overflow-hidden">
              {status === 'error' ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                  <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Camera Access Error</h3>
                  <p className="text-center text-gray-300 mb-4">{errorMessage}</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={initializeCamera}
                      className="px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={skipRecording}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      Skip Video Recording
                    </button>
                  </div>
                </div>
              ) : status === 'idle' && !streamRef.current ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                  <Camera className="h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Camera Ready</h3>
                  <p className="text-center text-gray-400 mb-6">
                    Your camera will be used to record a short video confirmation of your will.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={initializeCamera}
                      className="px-6 py-3 bg-primary hover:bg-primary-dark rounded-lg transition-colors shadow-lg font-medium cursor-pointer"
                    >
                      Enable Camera
                    </button>
                    <button
                      onClick={skipRecording}
                      className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors shadow-lg font-medium cursor-pointer"
                    >
                      Skip Recording
                    </button>
                  </div>
                </div>
              ) : status === 'requesting' ? (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
                </div>
              ) : null}
              
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay={status !== 'recorded' && status !== 'playing'}
                muted={status !== 'playing'}
                playsInline
              />
              
              {/* Recording indicator */}
              {status === 'recording' && (
                <div className="absolute top-4 left-4 flex items-center space-x-2 bg-black bg-opacity-50 rounded-full px-3 py-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-white text-sm font-medium">{formatTime(recordingTime)}</span>
                </div>
              )}
            </div>
            
            {/* Controls */}
            <div className="p-6">
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {(status === 'idle' && streamRef.current) && (
                  <button
                    onClick={startRecording}
                    className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg flex items-center"
                  >
                    <Play className="h-5 w-5 mr-2" /> Start Recording
                  </button>
                )}
                
                {status === 'recording' && (
                  <>
                    <button
                      onClick={pauseRecording}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg flex items-center"
                    >
                      <Pause className="h-5 w-5 mr-2" /> Pause
                    </button>
                    
                    <button
                      onClick={stopRecording}
                      className="px-5 py-2.5 bg-gray-700 hover:bg-gray-800 text-white rounded-lg flex items-center"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" /> Finish Recording
                    </button>
                  </>
                )}
                
                {status === 'paused' && (
                  <>
                    <button
                      onClick={resumeRecording}
                      className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg flex items-center"
                    >
                      <Play className="h-5 w-5 mr-2" /> Resume
                    </button>
                    
                    <button
                      onClick={stopRecording}
                      className="px-5 py-2.5 bg-gray-700 hover:bg-gray-800 text-white rounded-lg flex items-center"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" /> Finish Recording
                    </button>
                  </>
                )}
                
                {status === 'recorded' && (
                  <>
                    <button
                      onClick={playRecordedVideo}
                      className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg flex items-center"
                    >
                      <Play className="h-5 w-5 mr-2" /> Play
                    </button>
                    
                    <button
                      onClick={reRecord}
                      className="px-5 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center"
                    >
                      <RotateCcw className="h-5 w-5 mr-2" /> Record Again
                    </button>
                  </>
                )}
                
                {status === 'playing' && (
                  <button
                    onClick={() => videoRef.current?.pause()}
                    className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg flex items-center"
                  >
                    <Pause className="h-5 w-5 mr-2" /> Pause
                  </button>
                )}
              </div>
              
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
          </div>
          
          {/* Continue Button */}
          <div className="mt-10 flex justify-center">
            <button
              onClick={handleContinue}
              disabled={status !== 'recorded' && status !== 'playing'}
              className={`flex items-center px-8 py-3 rounded-lg text-white font-medium ${
                status === 'recorded' || status === 'playing'
                  ? 'bg-gradient-to-r from-primary to-blue-500 hover:from-primary-dark hover:to-blue-600 shadow-lg hover:shadow-xl transition-all'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Continue to Final Review
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
          
          {/* Skip Video Recording (Alternative) */}
          {status !== 'recorded' && status !== 'playing' && (
            <div className="mt-4 text-center">
              <button
                onClick={skipRecording}
                className="text-primary hover:text-primary-dark font-medium underline"
              >
                Skip Video Recording
              </button>
              <p className="text-center text-sm text-amber-500 dark:text-amber-400 mt-3">
                <AlertCircle className="inline h-4 w-4 mr-1 mb-0.5" />
                Recording a video is recommended but optional
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default VideoRecording;