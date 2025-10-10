"use client";

// Import the worklet script as a URL
const workletScriptURL = "/static/media/pcm-audio-worklet.min.js";
import { PCMAudioRecorderProvider } from "@speechmatics/browser-audio-input-react";
import { FlowProvider } from "@speechmatics/flow-client-react";
import { PCMPlayerProvider } from "@speechmatics/web-pcm-player-react";
import { useAudioContexts } from "@/hooks/useAudioContexts";

// This component will contain the context providers for the app
export function Providers({ children }: { children?: React.ReactNode }) {
  const { inputAudioContext, playbackAudioContext } = useAudioContexts();

  return (
    <FlowProvider
      // `appId is optional, it can be any string uniquely identifying your app
      appId="nextjs-example"
      audioBufferingMs={500}
      websocketBinaryType="arraybuffer" // This is optional, but does lead to better audio performance, particularly on Firefox
    >
      <PCMAudioRecorderProvider
        audioContext={inputAudioContext}
        workletScriptURL={workletScriptURL}
      >
        <PCMPlayerProvider audioContext={playbackAudioContext}>
          {children}
        </PCMPlayerProvider>
      </PCMAudioRecorderProvider>
    </FlowProvider>
  );
}