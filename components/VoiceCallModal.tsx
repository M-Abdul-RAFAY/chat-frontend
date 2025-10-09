"use client";

import { useState, useEffect, useCallback } from "react";
import {
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Clock,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { callAPI, Call } from "@/lib/api";
import { showToast } from "@/lib/toast";

interface VoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId?: string;
  customerName: string;
  customerPhone: string;
  onCallStatusChange?: (status: string) => void;
}

export default function VoiceCallModal({
  isOpen,
  onClose,
  conversationId,
  customerName,
  customerPhone,
  onCallStatusChange,
}: VoiceCallModalProps) {
  const [callStatus, setCallStatus] = useState<
    "idle" | "initiating" | "ringing" | "in-progress" | "ended"
  >("idle");
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [currentCall, setCurrentCall] = useState<Call | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Format duration as MM:SS
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (callStatus === "in-progress") {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStatus]);

  // Initiate call when modal opens
  useEffect(() => {
    if (isOpen && callStatus === "idle") {
      initiateCall();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const initiateCall = async () => {
    try {
      setCallStatus("initiating");
      setError(null);

      const response = await callAPI.initiateCall({
        conversationId,
        to: customerPhone,
      });

      if (response.success) {
        setCurrentCall(response.call);
        setCallStatus("ringing");
        showToast.success("Call initiated");
        onCallStatusChange?.("ringing");
      } else {
        throw new Error("Failed to initiate call");
      }
    } catch (err) {
      console.error("Error initiating call:", err);
      setError(err instanceof Error ? err.message : "Failed to initiate call");
      setCallStatus("idle");
      showToast.error("Failed to initiate call");
    }
  };

  const endCall = async () => {
    if (!currentCall) {
      handleClose();
      return;
    }

    try {
      await callAPI.endCall(currentCall._id);
      setCallStatus("ended");
      showToast.success("Call ended");
      onCallStatusChange?.("ended");

      // Close modal after a brief delay
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      console.error("Error ending call:", err);
      showToast.error("Failed to end call");
      handleClose();
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    // In a real implementation, this would interact with the Twilio Device
    showToast.success(isMuted ? "Microphone on" : "Microphone muted");
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn((prev) => !prev);
    showToast.success(isSpeakerOn ? "Speaker off" : "Speaker on");
  };

  const handleClose = useCallback(() => {
    setCallStatus("idle");
    setCallDuration(0);
    setIsMuted(false);
    setIsSpeakerOn(false);
    setCurrentCall(null);
    setError(null);
    onClose();
  }, [onClose]);

  // Update call status based on socket events (will be implemented)
  useEffect(() => {
    const handleCallStatusUpdate = (status: string) => {
      switch (status) {
        case "ringing":
          setCallStatus("ringing");
          break;
        case "in-progress":
          setCallStatus("in-progress");
          setCallDuration(0);
          break;
        case "completed":
        case "busy":
        case "no-answer":
        case "failed":
          setCallStatus("ended");
          setTimeout(handleClose, 2000);
          break;
      }
      onCallStatusChange?.(status);
    };

    // This will be used with socket events
    // For now, it's just defined for future integration
    return () => {
      // Cleanup socket listeners here
    };
  }, [handleClose, onCallStatusChange]);

  if (!isOpen) return null;

  const getStatusColor = () => {
    switch (callStatus) {
      case "initiating":
      case "ringing":
        return "bg-yellow-500";
      case "in-progress":
        return "bg-green-500";
      case "ended":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = () => {
    switch (callStatus) {
      case "initiating":
        return "Initiating call...";
      case "ringing":
        return "Ringing...";
      case "in-progress":
        return "In progress";
      case "ended":
        return "Call ended";
      default:
        return "Ready";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-8">
          <div className="flex flex-col items-center">
            {/* Avatar */}
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 border-4 border-white/30">
              <User className="w-12 h-12 text-white" />
            </div>

            {/* Customer name */}
            <h2 className="text-2xl font-bold mb-1">{customerName}</h2>
            <p className="text-sm text-white/80 mb-4">{customerPhone}</p>

            {/* Status badge */}
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <div className={cn("w-2 h-2 rounded-full", getStatusColor())} />
              <span className="text-sm font-medium">{getStatusText()}</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Call duration */}
          {callStatus === "in-progress" && (
            <div className="flex items-center justify-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-gray-500" />
              <span className="text-3xl font-mono font-bold text-gray-900 dark:text-white">
                {formatDuration(callDuration)}
              </span>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Call controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            {/* Mute button */}
            <button
              onClick={toggleMute}
              disabled={callStatus !== "in-progress"}
              className={cn(
                "p-4 rounded-full transition-all",
                callStatus === "in-progress"
                  ? isMuted
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
              )}
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </button>

            {/* End call button */}
            <button
              onClick={endCall}
              disabled={callStatus === "idle" || callStatus === "ended"}
              className={cn(
                "p-6 rounded-full transition-all",
                callStatus === "idle" || callStatus === "ended"
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
              )}
              aria-label="End call"
            >
              <PhoneOff className="w-8 h-8" />
            </button>

            {/* Speaker button */}
            <button
              onClick={toggleSpeaker}
              disabled={callStatus !== "in-progress"}
              className={cn(
                "p-4 rounded-full transition-all",
                callStatus === "in-progress"
                  ? isSpeakerOn
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
              )}
              aria-label={isSpeakerOn ? "Speaker off" : "Speaker on"}
            >
              {isSpeakerOn ? (
                <Volume2 className="w-6 h-6" />
              ) : (
                <VolumeX className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Call info */}
          {currentCall && (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              <p>Call ID: {currentCall._id.slice(-8)}</p>
              {currentCall.twilioSid && (
                <p className="text-xs mt-1">
                  Twilio: {currentCall.twilioSid.slice(-8)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
