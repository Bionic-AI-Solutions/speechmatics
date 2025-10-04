"use server";

import { textToSpeechForPersona, getTTSConfig } from "@/lib/ttsService";

export async function synthesizeSpeech(
  text: string,
  language: string = 'en'
): Promise<ArrayBuffer> {
  try {
    console.log('TTS Server Action - Text:', text.substring(0, 100) + '...', 'Language:', language);
    
    const response = await textToSpeechForPersona(text, language);
    
    // Return ArrayBuffer directly for PCM player
    return response.audioContent;
  } catch (error) {
    console.error('TTS Server Action Error:', error);
    throw new Error(`TTS synthesis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getAvailableVoices() {
  try {
    const configs = {
      'hi': getTTSConfig('hi'),
      'en': getTTSConfig('en')
    };
    
    return configs;
  } catch (error) {
    console.error('Error getting available voices:', error);
    throw new Error('Failed to get available voices');
  }
}

export async function testTTSSynthesis(text: string = "नमस्ते, मैं एक हिंदी महिला आवाज़ हूँ।", language: string = 'hi') {
  try {
    console.log('🧪 Testing TTS synthesis:', { text, language });
    const audioContent = await synthesizeSpeech(text, language);
    console.log('✅ TTS test successful, audio size:', audioContent.byteLength);
    return audioContent;
  } catch (error) {
    console.error('❌ TTS test failed:', error);
    throw error;
  }
}