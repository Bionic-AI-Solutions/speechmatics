"use client";
import { useFlowEventListener } from "@speechmatics/flow-client-react";
import {
  transcriptGroupKey,
  useFlowTranscript,
  wordsToText,
} from "@speechmatics/use-flow-transcript";
import { useEffect, useRef, useState } from "react";
import { useTranscriptExport } from "@/hooks/useTranscriptExport";

interface TranscriptEntry {
  timestamp: string;
  speaker: string;
  text: string;
  type: "agent" | "user";
}

export function TranscriptView() {
  const transcriptGroups = useFlowTranscript();
  const [fullTranscript, setFullTranscript] = useState<TranscriptEntry[]>([]);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { exportTranscript, copyToClipboard } = useTranscriptExport();

  useFlowEventListener("message", ({ data }) => {
    if (data.message === "Error") {
      console.error("Error message from server:", data);
      // Don't throw - just log the error
    }
  });

  useFlowEventListener("socketError", (e) => {
    console.error("Socket error:", e);
    // Don't throw - just log the error
  });

  // Capture full transcript as it updates
  useEffect(() => {
    const newEntries: TranscriptEntry[] = [];
    
    transcriptGroups.forEach((group) => {
      const timestamp = new Date().toLocaleTimeString();
      const speaker = group.type === "agent" ? "Agent" : group.speaker.replace("S", "Speaker ");
      const text = group.type === "agent" 
        ? group.data.map((response) => response.text).join(" ")
        : wordsToText(group.data);
      
      newEntries.push({
        timestamp,
        speaker,
        text,
        type: group.type
      });
    });

    setFullTranscript(newEntries);
  }, [transcriptGroups]);

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    if (scrollRef.current) {
      const element = scrollRef.current;
      element.scrollTop = element.scrollHeight;
    }
  });

  const handleExportTranscript = () => {
    exportTranscript(fullTranscript);
  };

  const handleCopyToClipboard = async () => {
    const success = await copyToClipboard(fullTranscript);
    if (success) {
      alert('Transcript copied to clipboard!');
    } else {
      alert('Failed to copy transcript to clipboard');
    }
  };

  const clearTranscript = () => {
    setFullTranscript([]);
    setShowExportOptions(false);
  };

  return (
    <section className="h-full min-h-0 flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h3>Transcript</h3>
        <div className="flex gap-2">
          {fullTranscript.length > 0 && (
            <>
              <button
                onClick={() => setShowExportOptions(!showExportOptions)}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Export
              </button>
              <button
                onClick={clearTranscript}
                className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {showExportOptions && fullTranscript.length > 0 && (
        <div className="mb-2 p-2 bg-gray-100 rounded flex gap-2">
          <button
            onClick={handleExportTranscript}
            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
          >
            Download TXT
          </button>
          <button
            onClick={handleCopyToClipboard}
            className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Copy to Clipboard
          </button>
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-2"
        style={{
          scrollBehavior: "smooth",
        }}
      >
        {transcriptGroups.map((group) => (
          <div
            className={`flex flex-row ${group.type === "agent" ? "justify-start" : "justify-end"}`}
            key={transcriptGroupKey(group)}
          >
            <div
              className={`h-full flex flex-col gap-1 p-2 w-3/4 rounded-md ${group.type === "agent" ? "bg-amber-50" : "bg-blue-50"}`}
            >
              <h6>
                {group.type === "agent"
                  ? "Agent"
                  : group.speaker.replace("S", "Speaker ")}
              </h6>
              <p className="flex-1">
                {group.type === "agent"
                  ? group.data.map((response) => response.text).join(" ")
                  : wordsToText(group.data)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}