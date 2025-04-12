import React, { useState, useRef } from "react";
import { saveAs } from "file-saver";

interface VideoRecorderProps {
  onComplete?: (blob: Blob) => void;
  onSkip?: () => void;
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({ onComplete, onSkip }) => {
  const [recording, setRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startCamera = async () => {
    try {
      // Request video (with audio for a complete recording)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: true 
      });
      
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
        // Create video blob from collected chunks
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        chunksRef.current = [];
        
        // Create URL for playback
        const videoURL = URL.createObjectURL(blob);
        setRecordedVideo(videoURL);

        // Save locally (download)
        saveAs(blob, "willtank-recording.webm");

        // Send blob to parent component
        if (onComplete) onComplete(blob);
      };

      console.log("Camera initialized successfully");
    } catch (err) {
      alert("Camera access denied or not supported.");
      console.error("Camera error:", err);
    }
  };

  const startRecording = () => {
    if (!mediaRecorderRef.current) {
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
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording:", err);
      alert("Failed to start recording. Please try again.");
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
      console.error("Cannot stop: no active recording");
      return;
    }
    
    try {
      // Stop the media recorder
      mediaRecorderRef.current.stop();
      console.log("Recording stopped");
      
      // Update UI state
      setRecording(false);
      
      // Optional: Stop camera tracks if you want to turn off the camera
      // If you want to keep the camera on for another recording, comment this out
      /*
      const tracks = videoRef.current?.srcObject instanceof MediaStream 
        ? videoRef.current.srcObject.getTracks() 
        : undefined;
      tracks?.forEach((track) => track.stop());
      */
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
        muted
        className="rounded-xl w-full max-w-lg border shadow"
      ></video>

      {!recording ? (
        <div className="flex gap-4">
          <button
            onClick={startCamera}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Enable Camera
          </button>
          <button
            onClick={startRecording}
            disabled={!videoRef.current?.srcObject}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Start Recording
          </button>
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
        <div className="mt-4">
          <p className="mb-2 text-lg font-semibold text-center">Preview:</p>
          <video
            src={recordedVideo}
            controls
            className="rounded-lg border shadow w-full max-w-lg"
          />
        </div>
      )}
    </div>
  );
};

export default VideoRecorder;