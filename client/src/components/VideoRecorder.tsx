import React, { useState, useRef, useEffect } from "react";
// No longer using file-saver for downloads

interface VideoRecorderProps {
  onComplete?: (blob: Blob) => void;
  onSkip?: () => void;
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({ onComplete, onSkip }) => {
  const [recording, setRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recordedVideo) {
        URL.revokeObjectURL(recordedVideo);
      }
    };
  }, [recordedVideo]);

  const startCamera = async () => {
    try {
      console.log("Requesting camera and microphone access...");
      
      // Request video (with audio for a complete recording)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: true 
      });
      
      console.log("Camera and microphone access granted");
      
      // Store the stream reference
      streamRef.current = stream;
      
      // Connect stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log("Stream connected to video element");
      }

      // Create media recorder from stream
      mediaRecorderRef.current = new MediaRecorder(stream);
      console.log("MediaRecorder created with state:", mediaRecorderRef.current.state);
      
      // Set up recorder event handlers using the helper function
      setupRecorderHandlers();

      // Set camera as enabled
      setCameraEnabled(true);
      console.log("Camera initialized successfully");
    } catch (err) {
      console.error("Camera error:", err);
      alert("Camera access denied or not supported.");
    }
  };

  const startRecording = () => {
    console.log("Start recording button clicked");
    
    if (!streamRef.current) {
      console.error("No stream available");
      alert("Camera stream not initialized. Please enable camera first.");
      return;
    }
    
    if (!mediaRecorderRef.current) {
      console.error("Media recorder not initialized");
      
      // Try to reinitialize the recorder
      try {
        mediaRecorderRef.current = new MediaRecorder(streamRef.current);
        console.log("MediaRecorder reinitialized");
        
        // Set up event handlers again
        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };
        
        mediaRecorderRef.current.onstop = () => {
          if (chunksRef.current.length === 0) {
            console.error("No recording data available");
            return;
          }
          
          // Create video blob from collected chunks
          const blob = new Blob(chunksRef.current, { type: "video/webm" });
          
          // Create URL for playback
          const videoURL = URL.createObjectURL(blob);
          setRecordedVideo(videoURL);
          
          // Send blob to parent component for server upload
          if (onComplete) onComplete(blob);
        };
      } catch (err) {
        console.error("Failed to reinitialize media recorder:", err);
        alert("Failed to setup recording. Please enable camera and try again.");
        return;
      }
    }
    
    // Clear any previous recording chunks
    chunksRef.current = [];
    
    try {
      console.log("MediaRecorder state before start:", mediaRecorderRef.current.state);
      
      // Only start if not already recording
      if (mediaRecorderRef.current.state === 'inactive') {
        // Start recording with 1-second chunks for better reliability
        mediaRecorderRef.current.start(1000);
        setRecording(true);
        console.log("Recording started - " + new Date().toISOString());
      } else {
        console.warn("Recorder is not in inactive state, current state:", mediaRecorderRef.current.state);
        
        // If it's already recording, stop it first then restart
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
          
          // Small delay before restarting
          setTimeout(() => {
            if (mediaRecorderRef.current && streamRef.current) {
              // Reinitialize recorder
              mediaRecorderRef.current = new MediaRecorder(streamRef.current);
              
              // Set handlers again
              setupRecorderHandlers();
              
              // Start recording
              mediaRecorderRef.current.start(1000);
              setRecording(true);
              console.log("Recording restarted - " + new Date().toISOString());
            }
          }, 500);
        }
      }
    } catch (err) {
      console.error("Failed to start recording:", err);
      alert("Failed to start recording. Please try again.");
    }
  };
  
  // Helper function to set up recorder event handlers
  const setupRecorderHandlers = () => {
    if (!mediaRecorderRef.current) return;
    
    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };
    
    mediaRecorderRef.current.onstop = async () => {
      if (chunksRef.current.length === 0) {
        console.error("No recording data available");
        return;
      }
      
      // Create video blob from collected chunks
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      
      // Create URL for playback
      const videoURL = URL.createObjectURL(blob);
      setRecordedVideo(videoURL);

      // Upload the video to server (this is called by parent component)
      if (onComplete) onComplete(blob);
      
      // We don't automatically download anymore - server will save it
      console.log("Video recording completed and ready for server upload");
    };
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) {
      console.error("No media recorder available");
      return;
    }
    
    try {
      console.log("Attempting to stop recording...");
      
      // Stop the recorder only if it's currently recording
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        console.log("Recording stopped successfully");
      } else {
        console.log("MediaRecorder already inactive");
      }
      
      // Update UI state
      setRecording(false);
    } catch (err) {
      console.error("Error stopping recording:", err);
      setRecording(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-4">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="rounded-xl w-full max-w-lg border shadow"
      ></video>

      {!recording ? (
        <div className="flex gap-4">
          {!cameraEnabled ? (
            <button
              onClick={startCamera}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Enable Camera
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Start Recording
            </button>
          )}
          <button
            onClick={onSkip}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Skip Recording
          </button>
        </div>
      ) : (
        <button
          onClick={stopRecording}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Stop Recording
        </button>
      )}

      {recordedVideo && (
        <div className="mt-4 w-full">
          <p className="mb-2 text-lg font-semibold text-center">Preview:</p>
          <video
            src={recordedVideo}
            controls
            className="rounded-lg border shadow w-full max-w-lg mx-auto"
          />
        </div>
      )}
    </div>
  );
};

export default VideoRecorder;