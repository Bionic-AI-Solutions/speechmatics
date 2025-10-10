"use client";
import {
  usePCMAudioListener,
  usePCMAudioRecorderContext,
} from "@speechmatics/browser-audio-input-react";
import {
  type AgentAudioEvent,
  useFlow,
  useFlowEventListener,
} from "@speechmatics/flow-client-react";
import { usePCMAudioPlayerContext } from "@speechmatics/web-pcm-player-react";
import {
  transcriptGroupKey,
  useFlowTranscript,
  wordsToText,
} from "@speechmatics/use-flow-transcript";
import { useCallback, useEffect, useRef } from "react";
import { getJWT } from "@/app/actions";

export function SimpleVoiceChat() {
  const {
    startConversation,
    endConversation,
    sendAudio,
    socketState,
    sessionId,
  } = useFlow();

  const { startRecording, stopRecording, audioContext } =
    usePCMAudioRecorderContext();

  const { playAudio } = usePCMAudioPlayerContext();
  const transcriptGroups = useFlowTranscript();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Custom template ID
  const templateId = "d275a370-d772-470f-8347-3cffc44c6e1e:latest";

  const startSession = useCallback(
    async () => {
      if (!audioContext) {
        console.error("Audio context not initialized!");
        return;
      }

      try {
        const jwt = await getJWT("flow");

        await startConversation(jwt, {
          config: {
            template_id: templateId,
            template_variables: {},
          },
          audioFormat: {
            type: "raw",
            encoding: "pcm_f32le",
            sample_rate: audioContext.sampleRate,
          },
        });

        // Get default microphone and start recording
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInput = devices.find(device => device.kind === 'audioinput');
        if (audioInput) {
          await startRecording({ deviceId: audioInput.deviceId });
        }
      } catch (error) {
        console.error("Error starting conversation:", error);
      }
    },
    [startConversation, audioContext, startRecording],
  );

  const stopSession = useCallback(async () => {
    try {
      stopRecording();
      endConversation();
    } catch (error) {
      console.error("Error stopping conversation:", error);
    }
  }, [stopRecording, endConversation]);

  const handleToggleClick = useCallback(async () => {
    if (socketState === "open" && sessionId) {
      await stopSession();
    } else {
      await startSession();
    }
  }, [socketState, sessionId, startSession, stopSession]);


  // Audio handling
  usePCMAudioListener(sendAudio);
  useFlowEventListener(
    "agentAudio",
    useCallback(
      ({ data }: AgentAudioEvent) => {
        if (socketState === "open" && sessionId) {
          playAudio(data);
        }
      },
      [socketState, sessionId, playAudio],
    ),
  );

  useFlowEventListener("message", ({ data }) => {
    if (data.message === "Error") {
      console.error("Error message from server:", data);
    }
  });

  useFlowEventListener("socketError", (e) => {
    console.error("Socket error:", e);
  });

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    if (scrollRef.current) {
      const element = scrollRef.current;
      element.scrollTop = element.scrollHeight;
    }
  }, [transcriptGroups]);

  const isActive = socketState === "open" && sessionId;
  const isProcessing = socketState === "connecting" || socketState === "closing" || (socketState === "open" && !sessionId);

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Chat Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4"
        style={{ scrollBehavior: "smooth" }}
      >
        {transcriptGroups.length === 0 && (
          <div className="text-center text-gray-500 mt-16">
            <div className="text-8xl mb-6">🎤</div>
            <h2 className="text-2xl font-semibold mb-2">Voice Assistant Ready</h2>
            <p className="text-lg">Click the microphone button below to start a voice conversation</p>
            <p className="text-sm mt-2 text-gray-400">The same button will stop the conversation when active</p>
          </div>
        )}
        
        {transcriptGroups.map((group) => (
          <div
            className={`flex ${group.type === "agent" ? "justify-start" : "justify-end"}`}
            key={transcriptGroupKey(group)}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                group.type === "agent"
                  ? "bg-white border border-gray-200"
                  : "bg-blue-500 text-white"
              }`}
            >
              <div className="text-sm font-medium mb-1">
                {group.type === "agent" ? "Assistant" : "You"}
              </div>
              <div className="text-sm">
                {group.type === "agent"
                  ? group.data.map((response) => response.text).join(" ")
                  : wordsToText(group.data)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area with Prominent Toggle Button */}
      <div className="bg-white border-t border-gray-200 p-6">
        {/* Prominent Microphone Button */}
        <div className="flex justify-center mb-4">
          <button
            onClick={handleToggleClick}
            disabled={isProcessing}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
              isActive
                ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                : isProcessing
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
            title={isActive ? "Click to stop conversation" : "Click to start conversation"}
          >
            {isProcessing ? (
              <svg className="w-10 h-10 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : isActive ? (
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h12v12H6z" />
              </svg>
            ) : (
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            )}
          </button>
        </div>


        {/* Status Indicator */}
        <div className="text-sm text-gray-600 text-center">
          {isProcessing && "🔄 Connecting to voice assistant..."}
          {isActive && "🎤 Listening... Click microphone to stop"}
          {!isActive && !isProcessing && "🎯 Click the microphone to start voice conversation"}
        </div>
      </div>
    </div>
  );
}
