import { useCallback } from 'react';

interface TranscriptEntry {
  timestamp: string;
  speaker: string;
  text: string;
  type: "agent" | "user";
}

export function useTranscriptExport() {
  const exportTranscript = useCallback((transcript: TranscriptEntry[]) => {
    const transcriptText = transcript
      .map(entry => `[${entry.timestamp}] ${entry.speaker}: ${entry.text}`)
      .join('\n');
    
    const blob = new Blob([transcriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-transcript-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const copyToClipboard = useCallback(async (transcript: TranscriptEntry[]) => {
    const transcriptText = transcript
      .map(entry => `[${entry.timestamp}] ${entry.speaker}: ${entry.text}`)
      .join('\n');
    
    try {
      await navigator.clipboard.writeText(transcriptText);
      return true;
    } catch (err) {
      console.error('Failed to copy: ', err);
      return false;
    }
  }, []);

  return { exportTranscript, copyToClipboard };
}
