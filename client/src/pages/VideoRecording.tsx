import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Play, Pause, RotateCcw, CheckCircle, Camera, Info, FileVideo, AlertCircle, ArrowRight } from 'lucide-react';
import AnimatedAurora from '@/components/ui/AnimatedAurora';

const VideoRecording: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [status, setStatus] = useState<'idle' | 'requesting' | 'recording' | 'paused' | 'recorded' | 'playing' | 'error'>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [showScript, setShowScript] = useState(true);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth/sign-in');
    }
  }, [user, isLoading, navigate]);

  // Check for will data and document upload status
  useEffect(() => {
    const willData = localStorage.getItem('willData');
    if (!willData) {
      navigate('/ai-chat');
    }
  }, [navigate]);

  // Clean up media resources when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Initialize camera
  const initializeCamera = async () => {
    setStatus('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }, 
        audio: true 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setStatus('idle');
    } catch (error) {
      console.error('Error accessing camera:', error);
      setStatus('error');
      setErrorMessage('Camera access was denied or unavailable. Please ensure your browser has camera permissions.');
    }
  };

  // Start recording
  const startRecording = () => {
    if (!streamRef.current) return;
    
    setRecordedChunks([]);
    setRecordingTime(0);
    
    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    
    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };
      
      mediaRecorder.start(1000); // Collect data every second
      setStatus('recording');
    } catch (error) {
      console.error('Error starting recording:', error);
      setStatus('error');
      setErrorMessage('Unable to start recording. Please try again or use a different browser.');
    }
  };

  // Pause recording
  const pauseRecording = () => {
    if (mediaRecorderRef.current && status === 'recording') {
      mediaRecorderRef.current.pause();
      setStatus('paused');
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // Resume recording
  const resumeRecording = () => {
    if (mediaRecorderRef.current && status === 'paused') {
      mediaRecorderRef.current.resume();
      setStatus('recording');
      
      // Resume timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setStatus('recorded');
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        
        // Clear video element
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      }
    }
  };

  // Play recorded video
  const playRecordedVideo = () => {
    if (recordedChunks.length === 0) return;
    
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    if (videoRef.current) {
      videoRef.current.src = URL.createObjectURL(blob);
      videoRef.current.controls = true;
      videoRef.current.onplay = () => setStatus('playing');
      videoRef.current.onpause = () => setStatus('recorded');
      videoRef.current.onended = () => setStatus('recorded');
      videoRef.current.play();
    }
  };

  // Re-record video
  const reRecord = () => {
    setRecordedChunks([]);
    setRecordingTime(0);
    setPlaybackTime(0);
    setStatus('idle');
    
    if (videoRef.current) {
      videoRef.current.src = '';
      videoRef.current.controls = false;
    }
    
    initializeCamera();
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Continue to final review
  const handleContinue = () => {
    if (recordedChunks.length > 0) {
      // Save video to localStorage (simplified, in a real app you'd upload to server)
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      localStorage.setItem('willVideoRecorded', 'true');
      
      // Redirect to final review
      navigate('/final-review');
    }
  };

  // Loading state
  if (isLoading) {
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
                  <button
                    onClick={initializeCamera}
                    className="px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : status === 'idle' && !streamRef.current ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                  <Camera className="h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Camera Ready</h3>
                  <p className="text-center text-gray-400 mb-6">
                    Your camera will be used to record a short video confirmation of your will.
                  </p>
                  <button
                    onClick={initializeCamera}
                    className="px-6 py-3 bg-primary hover:bg-primary-dark rounded-lg transition-colors shadow-lg font-medium"
                  >
                    Enable Camera
                  </button>
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
              <div className="flex flex-wrap justify-center space-x-3 mb-6">
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
          
          {status !== 'recorded' && status !== 'playing' && (
            <p className="text-center text-sm text-amber-500 dark:text-amber-400 mt-3">
              <AlertCircle className="inline h-4 w-4 mr-1 mb-0.5" />
              You must record a video confirmation before continuing
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default VideoRecording;