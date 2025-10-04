import { TextToSpeechClient } from '@google-cloud/text-to-speech';

// Initialize the TTS client with different authentication methods
let ttsClient: TextToSpeechClient;

try {
  // Try to initialize with environment variables first
  if (process.env.GOOGLE_CLOUD_PROJECT_ID && process.env.GOOGLE_CLOUD_PRIVATE_KEY && process.env.GOOGLE_CLOUD_CLIENT_EMAIL) {
    console.log('Initializing TTS client with environment variables');
    ttsClient = new TextToSpeechClient({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: {
        type: 'service_account',
        project_id: process.env.GOOGLE_CLOUD_PROJECT_ID,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
      }
    });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log('Initializing TTS client with credentials file');
    ttsClient = new TextToSpeechClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });
  } else {
    console.log('Initializing TTS client with Application Default Credentials');
    // This will use ADC (gcloud auth, metadata service, etc.)
    ttsClient = new TextToSpeechClient();
  }
  
  // List available voices for debugging
  setTimeout(() => {
    listAvailableVoices().catch(console.error);
  }, 1000);
  
} catch (error) {
  console.error('Failed to initialize TTS client:', error);
  throw new Error('TTS client initialization failed');
}

export interface TTSConfig {
  language: string;
  voiceName?: string;
  gender?: 'MALE' | 'FEMALE';
  speakingRate?: number;
  pitch?: number;
}

export interface TTSResponse {
  audioContent: ArrayBuffer;
  contentType: string;
}

// Voice configurations for different languages
const VOICE_CONFIGS: Record<string, TTSConfig> = {
  'hi': {
    language: 'hi-IN',
    voiceName: 'hi-IN-Chirp3-HD-Achernar', // High-quality Hindi female voice
    gender: 'FEMALE',
    speakingRate: 0.9 // Slightly slower for clarity
    // Note: This voice doesn't support pitch parameters
  },
  'en': {
    language: 'en-US',
    voiceName: 'en-US-Wavenet-F', // English female voice
    gender: 'FEMALE',
    speakingRate: 1.0,
    pitch: 0.0 // English voices typically support pitch
  }
};

/**
 * Convert text to speech using Google Cloud TTS
 */
export async function textToSpeech(
  text: string, 
  config: TTSConfig
): Promise<TTSResponse> {
  try {
    const request = {
      input: { text },
      voice: {
        languageCode: config.language,
        name: config.voiceName,
        ssmlGender: config.gender,
      },
      audioConfig: {
        audioEncoding: 'LINEAR16' as const,
        sampleRateHertz: 16000,
        speakingRate: config.speakingRate,
        ...(config.pitch !== undefined && { pitch: config.pitch }),
      },
    };

    console.log('TTS Request:', {
      text: text.substring(0, 100) + '...',
      language: config.language,
      voice: config.voiceName,
      gender: config.gender,
      speakingRate: config.speakingRate,
      pitch: config.pitch
    });

    const [response] = await ttsClient.synthesizeSpeech(request);
    
    if (!response.audioContent) {
      throw new Error('No audio content received from TTS service');
    }

          // Convert Uint8Array to ArrayBuffer if needed
          let audioBuffer: ArrayBuffer;
          if (response.audioContent instanceof Uint8Array) {
            audioBuffer = response.audioContent.buffer.slice(
              response.audioContent.byteOffset,
              response.audioContent.byteOffset + response.audioContent.byteLength
            );
          } else {
            audioBuffer = response.audioContent as ArrayBuffer;
          }

          return {
            audioContent: audioBuffer,
            contentType: 'audio/wav'
          };
  } catch (error) {
    console.error('TTS Error:', error);
    throw new Error(`TTS synthesis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get TTS configuration for a specific language
 */
export function getTTSConfig(language: string): TTSConfig {
  return VOICE_CONFIGS[language] || VOICE_CONFIGS['en'];
}

/**
 * Convert text to speech for Hindi
 */
export async function textToSpeechHindi(text: string): Promise<TTSResponse> {
  return textToSpeech(text, getTTSConfig('hi'));
}

/**
 * Convert text to speech for English
 */
export async function textToSpeechEnglish(text: string): Promise<TTSResponse> {
  return textToSpeech(text, getTTSConfig('en'));
}

/**
 * Convert text to speech based on persona language
 */
export async function textToSpeechForPersona(
  text: string, 
  personaLanguage: string
): Promise<TTSResponse> {
  const config = getTTSConfig(personaLanguage);
  return textToSpeech(text, config);
}

/**
 * List available voices for debugging
 */
export async function listAvailableVoices(): Promise<void> {
  try {
    const [result] = await ttsClient.listVoices();
    const voices = result.voices || [];
    
    console.log('Available Hindi voices:');
    voices
      .filter(voice => voice.languageCodes?.includes('hi-IN'))
      .forEach(voice => {
        console.log(`- ${voice.name}: ${voice.ssmlGender} (${voice.languageCodes?.join(', ')})`);
      });
      
    console.log('Available English voices:');
    voices
      .filter(voice => voice.languageCodes?.includes('en-US'))
      .forEach(voice => {
        console.log(`- ${voice.name}: ${voice.ssmlGender} (${voice.languageCodes?.join(', ')})`);
      });
  } catch (error) {
    console.error('Error listing voices:', error);
  }
}