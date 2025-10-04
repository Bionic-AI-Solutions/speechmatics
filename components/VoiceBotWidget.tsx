"use client";

import { useState, useRef, useEffect } from "react";
import { useFlow, useFlowEventListener } from "@speechmatics/flow-client-react";
import { usePCMAudioRecorderContext, usePCMAudioListener } from "@speechmatics/browser-audio-input-react";
import { usePCMAudioPlayerContext } from "@speechmatics/web-pcm-player-react";
import { getJWT } from "@/app/actions";
import { useTTS } from "@/hooks/useTTS";
import { useAudioContexts } from "@/hooks/useAudioContexts";
import { MicrophoneSelect } from "./MicrophoneSelect";

interface Persona {
  id: string;
  name: string;
  description?: string;
  character?: string;
  startText?: string;
  avatar?: string;
  template_id?: string;
  template_variables?: {
    persona: string;
    style: string;
    context: string;
  };
  language?: string;
  accent?: string;
  personality_traits?: string[];
}

interface VoiceBotWidgetProps {
  personas: Persona[];
}

interface TranscriptMessage {
  id: string;
  type: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

export function VoiceBotWidget({ personas }: VoiceBotWidgetProps) {
  const { socketState, sessionId, startConversation, endConversation, sendAudio } = useFlow();
  const { isRecording, startRecording, stopRecording } = usePCMAudioRecorderContext();
  const { playAudio, volumePercentage, setVolumePercentage } = usePCMAudioPlayerContext();
  const { playText: playTTS, isPlaying: ttsPlaying, isLoading: ttsLoading, error: ttsError } = useTTS();
  const { playbackAudioContext } = useAudioContexts();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('hi');
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [isConversationActive, setIsConversationActive] = useState(false);
  
  const transcriptRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  // Audio listener for sending audio to Flow
  usePCMAudioListener((audioData) => {
    if (socketState === "open" && sessionId && isRecording) {
      const buffer = new ArrayBuffer(audioData.length * 2);
      const view = new DataView(buffer);
      for (let i = 0; i < audioData.length; i++) {
        const sample = Math.max(-1, Math.min(1, audioData[i]));
        view.setInt16(i * 2, sample * 0x7FFF, true);
      }
      sendAudio(buffer);
    }
  });

  // Flow event listeners
  useFlowEventListener("ConversationStarted", (event) => {
    console.log("🎉 Flow: Conversation started", event);
    setIsConversationActive(true);
  });

  useFlowEventListener("ConversationEnded", (event) => {
    console.log("🔚 Flow: Conversation ended", event);
    setIsConversationActive(false);
    setTranscript([]);
  });

  useFlowEventListener("AddTranscript", (event) => {
    console.log("📝 Flow: AddTranscript event received:", event);
    
    if (event.data.type === "agent") {
      // Add agent message to transcript
      const newMessage: TranscriptMessage = {
        id: Date.now().toString(),
        type: 'agent',
        text: event.data.text || '',
        timestamp: new Date()
      };
      setTranscript(prev => [...prev, newMessage]);
      
      // Trigger TTS for agent response
      if (currentPersona && event.data.text) {
        const language = currentPersona.language || 'en';
        console.log("🎤 Triggering TTS for language:", language);
        playTTS(event.data.text, language);
      }
    } else if (event.data.type === "user") {
      // Add user message to transcript
      const newMessage: TranscriptMessage = {
        id: Date.now().toString(),
        type: 'user',
        text: event.data.text || '',
        timestamp: new Date()
      };
      setTranscript(prev => [...prev, newMessage]);
    }
  });

  useFlowEventListener("agentAudio", (event) => {
    console.log("Flow: AI audio received, data length:", event.data.length);
    try {
      playAudio(event.data);
    } catch (error) {
      console.error("Failed to play AI audio:", error);
    }
  });

  const handlePhoneClick = async () => {
    if (isConversationActive) {
      // End conversation
      if (isRecording) {
        stopRecording();
      }
      endConversation();
      setCurrentPersona(null);
      setIsConversationActive(false);
      setTranscript([]);
    } else {
      // Start conversation
      try {
        const jwt = await getJWT("flow");
        
        // Find Hindi persona for the selected language
        const selectedPersona = personas.find(p => p.language === selectedLanguage) || personas[0];
        
        if (!selectedPersona) {
          alert("No persona available for the selected language");
          return;
        }

        setCurrentPersona(selectedPersona);
        
        console.log("Starting conversation with persona:", selectedPersona.name);
        
        const conversationConfig: any = {
          config: {
            template_id: selectedPersona.template_id || selectedPersona.id,
            template_variables: selectedPersona.template_variables || {}
          },
          audioFormat: {
            type: "raw",
            encoding: "pcm_s16le",
            sample_rate: 16000
          }
        };

        if (selectedPersona.language === 'hi') {
          conversationConfig.transcription_config = {
            language: "hi",
            enable_partials: true,
            enable_entities: true,
            enable_speaker_diarization: true,
          };
        }

        await startConversation(jwt, conversationConfig);
        console.log("Conversation started successfully");

        // Start recording
        try {
          await startRecording();
          console.log("Recording started successfully");
        } catch (recordingError) {
          console.error("Failed to start recording:", recordingError);
        }
      } catch (error: any) {
        console.error("Failed to start session:", error);
        alert(`Failed to start session: ${error.message}`);
      }
    }
  };

  const handleWidgetClick = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleCloseWidget = () => {
    if (isConversationActive) {
      if (confirm("Are you sure you want to end the conversation?")) {
        handlePhoneClick();
      }
    }
    setIsExpanded(false);
  };

  // Collapsed widget view
  if (!isExpanded) {
    return (
      <div 
        className="fixed bottom-6 right-6 w-16 h-16 bg-white rounded-full shadow-lg cursor-pointer flex items-center justify-center hover:shadow-xl transition-shadow"
        onClick={handleWidgetClick}
      >
        <div className="flex items-center space-x-1">
          <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
            <span className="text-xs">👤</span>
          </div>
          <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  // Expanded widget view
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Header with language selector */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-5 h-5 bg-gradient-to-b from-orange-400 via-white to-green-500 rounded-sm flex items-center justify-center">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
          </div>
          <span className="text-sm font-medium text-gray-700">हिन्दी</span>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Transcript window */}
      {transcript.length > 0 && (
        <div 
          ref={transcriptRef}
          className="h-48 overflow-y-auto p-4 bg-gray-50 border-b border-gray-200"
        >
          <div className="space-y-3">
            {transcript.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'agent' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    message.type === 'agent'
                      ? 'bg-blue-100 text-blue-900'
                      : 'bg-green-100 text-green-900'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="p-6 text-center">
        {/* Persona illustration */}
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-white rounded-full border-4 border-gray-200 mx-auto flex items-center justify-center">
            <span className="text-4xl">👤</span>
          </div>
          
          {/* Phone button */}
          <button
            onClick={handlePhoneClick}
            disabled={socketState === "connecting"}
            className={`absolute -bottom-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isConversationActive
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-black hover:bg-gray-800'
            } ${socketState === "connecting" ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {socketState === "connecting" ? (
              <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            )}
          </button>
        </div>

        {/* Status indicators */}
        <div className="space-y-2 text-sm text-gray-600">
          {isConversationActive ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>Conversation Active</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>Ready to Chat</span>
            </div>
          )}
          
          {ttsLoading && (
            <div className="text-blue-600">Generating speech...</div>
          )}
          
          {ttsError && (
            <div className="text-red-600">TTS Error: {ttsError}</div>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={handleCloseWidget}
          className="mt-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}