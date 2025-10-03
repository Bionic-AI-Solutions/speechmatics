import { useMemo, useSyncExternalStore, useEffect } from "react";

// Feel free to change the recording sample rate
const recordingSampleRate = 16_000;

// Playback sample rate should always be 16_000
const playbackSampleRate = 16_000;

/**
 * This hook returns audio contexts for recording and playback.
 * In practice they will be the same AudioContext, except in Firefox where sample rates may differ
 * See bug tracked here: https://bugzilla.mozilla.org/show_bug.cgi?id=1725336
 * @todo: If/when the bug is fixed, we can use the same audio context for both recording and playback
*/
export function useAudioContexts() {
  const hydrated = useHydrated();
  const inputAudioContext = useMemo(
    () => {
      if (!hydrated) return undefined;
      try {
        const context = new window.AudioContext({ sampleRate: recordingSampleRate });
        // Ensure the context is running
        if (context.state === 'suspended') {
          context.resume();
        }
        return context;
      } catch (error) {
        console.error('Failed to create input audio context:', error);
        return undefined;
      }
    },
    [hydrated],
  );

  const playbackAudioContext = useMemo(() => {
    if (!hydrated) return undefined;
    const isFirefox = typeof navigator !== "undefined" && navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    if (isFirefox) {
      try {
        const context = new window.AudioContext({ sampleRate: playbackSampleRate });
        if (context.state === 'suspended') {
          context.resume();
        }
        return context;
      } catch (error) {
        console.error('Failed to create playback audio context:', error);
        return undefined;
      }
    }
    return inputAudioContext;
  }, [inputAudioContext, hydrated]);

  return { inputAudioContext, playbackAudioContext };
}

/**
 * Hook to check if the component has hydrated on the client side
 */
function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}