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
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        chunksRef.current = [];
        const videoURL = URL.createObjectURL(blob);
        setRecordedVideo(videoURL);

        // Optional: save locally
        saveAs(blob, "willtank-recording.webm");

        // Optional: send blob to backend via onComplete(blob)
        if (onComplete) onComplete(blob);
      };
    } catch (err) {
      alert("Camera access denied or not supported.");
      console.error("Camera error:", err);
    }
  };

  const startRecording = () => {
    setRecording(true);
    mediaRecorderRef.current?.start();
  };

  const stopRecording = () => {
    setRecording(false);
    mediaRecorderRef.current?.stop();
    const tracks = videoRef.current?.srcObject instanceof MediaStream 
      ? videoRef.current.srcObject.getTracks() 
      : undefined;
    tracks?.forEach((track) => track.stop());
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