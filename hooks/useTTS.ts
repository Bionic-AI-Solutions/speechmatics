"use client";

import { useState, useCallback } from 'react';
import { synthesizeSpeech } from '@/app/tts-actions';
import { usePCMAudioPlayerContext } from '@speechmatics/web-pcm-player-react';
import { useAudioContexts } from './useAudioContexts';

export interface TTSState {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useTTS() {
  const [state, setState] = useState<TTSState>({
    isPlaying: false,
    isLoading: false,
    error: null
  });
  
  const { playAudio } = usePCMAudioPlayerContext();
  const { playbackAudioContext } = useAudioContexts();

  const playText = useCallback(async (text: string, language: string = 'en') => {
    if (!text.trim()) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('🎤 TTS Hook - Starting synthesis:', {
        text: text.substring(0, 100) + '...',
        language: language,
        textLength: text.length
      });
      
      const audioContent = await synthesizeSpeech(text, language);
      
            if (audioContent && playAudio) {
              console.log('🔊 TTS Hook - Playing audio:', {
                audioSize: audioContent.byteLength,
                language: language,
                audioType: audioContent.constructor.name,
                isArrayBuffer: audioContent instanceof ArrayBuffer
              });
              
              setState(prev => ({ ...prev, isPlaying: true, isLoading: false }));
              
              // Ensure we have an ArrayBuffer
              let arrayBuffer: ArrayBuffer;
              if (audioContent instanceof ArrayBuffer) {
                arrayBuffer = audioContent;
              } else if (audioContent instanceof Uint8Array) {
                arrayBuffer = audioContent.buffer.slice(
                  audioContent.byteOffset,
                  audioContent.byteOffset + audioContent.byteLength
                );
              } else {
                throw new Error(`Unexpected audio content type: ${audioContent.constructor.name}`);
              }
              
              // Convert ArrayBuffer to Float32Array for PCM player
              const audioBuffer = new Float32Array(arrayBuffer.byteLength / 2);
              const dataView = new DataView(arrayBuffer);
              
              // Convert 16-bit PCM to float32 (-1 to 1)
              for (let i = 0; i < audioBuffer.length; i++) {
                const sample = dataView.getInt16(i * 2, true); // little-endian
                audioBuffer[i] = sample / 32768.0; // Convert to float32 range
              }
              
              console.log('🔊 Converted audio buffer:', {
                originalSize: audioContent.byteLength,
                float32Size: audioBuffer.length,
                sampleRate: 16000
              });
              
              // Resume the correct audio context before playing
              if (playbackAudioContext) {
                console.log('🔊 Audio context state before resume:', playbackAudioContext.state);
                if (playbackAudioContext.state === 'suspended') {
                  try {
                    await playbackAudioContext.resume();
                    console.log('🔊 Audio context resumed for TTS playback, new state:', playbackAudioContext.state);
                  } catch (error) {
                    console.log('Audio context resume failed:', error);
                  }
                } else {
                  console.log('🔊 Audio context already running:', playbackAudioContext.state);
                }
              } else {
                console.log('❌ No playback audio context available');
              }
              
              // Try direct Web Audio API playback instead of PCM player
              console.log('🎵 About to play audio buffer directly:', {
                bufferLength: audioBuffer.length,
                sampleRate: 16000,
                duration: audioBuffer.length / 16000
              });
              
              try {
                // Create an AudioBuffer from our Float32Array
                const audioBufferSource = playbackAudioContext.createBuffer(1, audioBuffer.length, 16000);
                audioBufferSource.copyToChannel(audioBuffer, 0);
                
                // Create and play the audio
                const source = playbackAudioContext.createBufferSource();
                source.buffer = audioBufferSource;
                source.connect(playbackAudioContext.destination);
                
                // Play the audio
                source.start();
                console.log('🎵 Direct Web Audio API playback started');
                
                // Wait for the audio to finish
                await new Promise((resolve) => {
                  source.onended = () => {
                    console.log('🎵 Direct Web Audio API playback ended');
                    resolve(void 0);
                  };
                });
                
              } catch (directPlayError) {
                console.error('❌ Direct Web Audio API playback failed:', directPlayError);
                // Fallback to PCM player
                console.log('🔄 Falling back to PCM player...');
                await playAudio(audioBuffer);
              }
              
              setState(prev => ({ ...prev, isPlaying: false }));
              console.log('✅ TTS audio playback complete');
      } else {
        console.error('❌ TTS Hook - Missing audio content or playAudio function:', {
          hasAudioContent: !!audioContent,
          hasPlayAudio: !!playAudio
        });
        throw new Error('No audio content or playAudio function available');
      }
      
    } catch (error) {
      console.error('TTS Hook Error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isPlaying: false,
        error: error instanceof Error ? error.message : 'TTS synthesis failed' 
      }));
    }
  }, [playAudio]);

  const stop = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  return {
    ...state,
    playText,
    stop
  };
}