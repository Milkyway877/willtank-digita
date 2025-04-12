import React, { useState, useRef, useEffect } from "react";
import { saveAs } from "file-saver";

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
      // Request video (with audio for a complete recording)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: true 
      });
      
      // Store the stream reference
      streamRef.current = stream;
      
      // Connect stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Create media recorder from stream
      mediaRecorderRef.current = new MediaRecorder(stream);

      // Set up recorder event handlers
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

        // Save locally (download)
        saveAs(blob, "willtank-recording.webm");

        // Send blob to parent component
        if (onComplete) onComplete(blob);
      };

      // Set camera as enabled
      setCameraEnabled(true);
      console.log("Camera initialized successfully");
    } catch (err) {
      console.error("Camera error:", err);
      alert("Camera access denied or not supported.");
    }
  };

  const startRecording = () => {
    if (!streamRef.current || !mediaRecorderRef.current) {
      console.error("Media recorder not initialized");
      alert("Please enable camera first");
      return;
    }
    
    // Clear any previous recording chunks
    chunksRef.current = [];
    
    try {
      // Start recording with 1-second chunks for better reliability
      mediaRecorderRef.current.start(1000);
      setRecording(true);
      console.log("Recording started - " + new Date().toISOString());
    } catch (err) {
      console.error("Failed to start recording:", err);
      alert("Failed to start recording. Please try again.");
    }
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