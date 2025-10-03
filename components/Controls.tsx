"use client";
import { useEffect } from "react";
import { useFlow, useFlowEventListener } from "@speechmatics/flow-client-react";
import { usePCMAudioRecorderContext, usePCMAudioListener } from "@speechmatics/browser-audio-input-react";
import { usePCMAudioPlayerContext } from "@speechmatics/web-pcm-player-react";
import { MicrophoneSelect } from "./MicrophoneSelect";
import { getJWT } from "@/app/actions";

interface Persona {
  id: string;
  name: string;
  description?: string;
}

interface ControlsProps {
  personas: Persona[];
}

export function Controls({ personas }: ControlsProps) {
  const { socketState, sessionId, startConversation, endConversation, sendAudio } = useFlow();
  const { isRecording, mute, unmute, isMuted, startRecording, stopRecording } = usePCMAudioRecorderContext();
  const { playAudio, volumePercentage, setVolumePercentage } = usePCMAudioPlayerContext();

  // Debug audio player context
  console.log('Audio player context:', { playAudio: !!playAudio, volumePercentage });

  // Ensure audio context is running
  useEffect(() => {
    const resumeAudioContext = async () => {
      if (typeof window !== 'undefined' && window.AudioContext) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
          console.log('Audio context resumed');
        }
      }
    };
    resumeAudioContext();
  }, []);

  // Send audio data to Flow service when recording
  usePCMAudioListener((audioData) => {
    if (socketState === "open" && sessionId && isRecording) {
      // Convert Float32Array to ArrayBuffer for Flow
      const buffer = new ArrayBuffer(audioData.length * 2);
      const view = new DataView(buffer);
      for (let i = 0; i < audioData.length; i++) {
        // Convert float32 (-1 to 1) to int16 (-32768 to 32767)
        const sample = Math.max(-1, Math.min(1, audioData[i]));
        view.setInt16(i * 2, sample * 0x7FFF, true);
      }
      sendAudio(buffer);
      // Log audio sending less frequently to avoid spam
      if (Math.random() < 0.01) { // Log 1% of the time
        console.log("Audio sent to Flow service, buffer size:", buffer.byteLength);
      }
    }
  });

  // Flow event listeners for debugging
  useFlowEventListener("ConversationStarted", (event) => {
    console.log("Flow: Conversation started", event);
  });

  useFlowEventListener("ConversationEnded", (event) => {
    console.log("Flow: Conversation ended", event);
  });

  useFlowEventListener("AddTranscript", (event) => {
    console.log("Flow: Transcript received", event);
  });

  useFlowEventListener("AddPartialTranscript", (event) => {
    console.log("Flow: Partial transcript received", event);
  });

  useFlowEventListener("ResponseStarted", (event) => {
    console.log("Flow: AI response started", event);
  });

  useFlowEventListener("ResponseCompleted", (event) => {
    console.log("Flow: AI response completed", event);
  });

  useFlowEventListener("AudioAdded", (event) => {
    console.log("Flow: Audio added", event);
  });

  useFlowEventListener("Error", (event) => {
    console.error("Flow: Error received", event);
  });

  // Handle AI audio responses
  useFlowEventListener("agentAudio", (event) => {
    console.log("Flow: AI audio received, data length:", event.data.length);
    // Play the AI audio response
    try {
      playAudio(event.data);
      console.log("AI audio played successfully");
    } catch (error) {
      console.error("Failed to play AI audio:", error);
    }
  });

  // Debug logging
  console.log('Controls - socketState:', socketState, 'sessionId:', sessionId, 'isRecording:', isRecording);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const personaId = formData.get("personaId") as string;
    const deviceId = formData.get("deviceId") as string;

    if (socketState === "open" && sessionId) {
      // Confirm before stopping
      if (confirm("Are you sure you want to end the conversation?")) {
        // Stop recording first
        if (isRecording) {
          stopRecording();
          console.log("Recording stopped");
        }
        // End the current session
        endConversation();
      }
    } else {
      // Start a new session
      try {
        const jwt = await getJWT("flow");
        const selectedPersona = personas.find(p => p.id === personaId);
        
        if (!selectedPersona) {
          alert("Please select a valid persona");
          return;
        }
        
        console.log("Starting conversation with persona:", selectedPersona.id);
        console.log("JWT token:", jwt.substring(0, 50) + "...");
        
        // Add timeout handling
        const conversationPromise = startConversation(jwt, {
          config: {
            template_id: selectedPersona.id,
            template_variables: {}
          },
          audioFormat: {
            type: "raw",
            encoding: "pcm_s16le",
            sample_rate: 16000
          }
        });
        
        // Add a timeout wrapper
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Conversation start timeout after 30 seconds")), 30000);
        });
        
        await Promise.race([conversationPromise, timeoutPromise]);
        console.log("Conversation started successfully");
        
        // Start recording after conversation starts
        try {
          console.log("Starting recording with deviceId:", deviceId);
          await startRecording({ deviceId });
          console.log("Recording started successfully");
        } catch (recordingError) {
          console.error("Failed to start recording:", recordingError);
        }
      } catch (error) {
        console.error("Failed to start session:", error);
        alert(`Failed to start session: ${error.message || error}. Please check your API key and try again.`);
      }
    }
  };

  return (
    <section className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Voice Bot Controls</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="personaId" className="block text-sm font-medium text-gray-700 mb-2">
            Choose AI Persona
          </label>
          <select
            name="personaId"
            id="personaId"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {personas.map((persona) => (
              <option key={persona.id} value={persona.id}>
                {persona.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="deviceId" className="block text-sm font-medium text-gray-700 mb-2">
            Microphone
          </label>
          <MicrophoneSelect disabled={socketState === "open" && !!sessionId} />
        </div>
        
        <div className="space-y-3">
          <div className="flex gap-3">
            <ActionButton socketState={socketState} sessionId={sessionId} />
            <MuteMicrophoneButton 
              isRecording={isRecording} 
              isMuted={isMuted} 
              mute={mute} 
              unmute={unmute} 
            />
          </div>
          
          <div>
            <label htmlFor="volume" className="block text-sm font-medium text-gray-700 mb-2">
              AI Voice Volume: {volumePercentage || 100}%
            </label>
            <input
              type="range"
              id="volume"
              name="volume"
              min="0"
              max="100"
              value={volumePercentage || 100}
              onChange={(e) => setVolumePercentage(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </form>
    </section>
  );
}

function ActionButton({ socketState, sessionId }: { socketState: string | undefined; sessionId: string | undefined }) {
  const isLoading = socketState === "connecting" || socketState === "closing" || (socketState === "open" && !sessionId);
  const isRunning = socketState === "open" && sessionId;

  return (
    <button 
      type="submit" 
      disabled={isLoading}
      className={`px-6 py-2 rounded-md font-medium transition-colors ${
        isRunning 
          ? "bg-red-500 hover:bg-red-600 text-white" 
          : "bg-blue-500 hover:bg-blue-600 text-white"
      } disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2`}
    >
      {isLoading && (
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
          <path 
            d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z" 
            fill="currentColor"
          />
        </svg>
      )}
      {isRunning ? "Stop Conversation" : "Start Conversation"}
    </button>
  );
}

function MuteMicrophoneButton({ 
  isRecording, 
  isMuted, 
  mute, 
  unmute 
}: { 
  isRecording: boolean; 
  isMuted: boolean; 
  mute: () => void; 
  unmute: () => void; 
}) {
  if (!isRecording) return null;

  return (
    <button 
      type="button" 
      onClick={isMuted ? unmute : mute}
      className={`px-4 py-2 rounded-md font-medium transition-colors ${
        isMuted 
          ? "bg-green-500 hover:bg-green-600 text-white" 
          : "bg-yellow-500 hover:bg-yellow-600 text-white"
      }`}
    >
      {isMuted ? "🔊 Unmute" : "🔇 Mute"}
    </button>
  );
}