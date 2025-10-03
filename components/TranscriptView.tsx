"use client";
import { useFlowEventListener } from "@speechmatics/flow-client-react";
import {
  transcriptGroupKey,
  useFlowTranscript,
  wordsToText,
} from "@speechmatics/use-flow-transcript";
import { useEffect, useRef } from "react";

export function TranscriptView() {
  const transcriptGroups = useFlowTranscript();

  useFlowEventListener("message", ({ data }) => {
    if (data.message === "Error") {
      throw new Error("Error message from server", { cause: data.error });
    }
  });

  useFlowEventListener("socketError", (e) => {
    throw new Error("Socket error", { cause: e });
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    if (scrollRef.current) {
      const element = scrollRef.current;
      element.scrollTop = element.scrollHeight;
    }
  });

  return (
    <section className="h-full min-h-0 bg-white rounded-lg shadow-md">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Conversation</h3>
      </div>
      <div
        ref={scrollRef}
        className="h-full overflow-y-auto min-h-0 flex flex-col gap-3 p-4"
        style={{
          scrollBehavior: "smooth",
        }}
      >
        {transcriptGroups.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">🎤</div>
              <p>Start a conversation to see the transcript here</p>
            </div>
          </div>
        ) : (
          transcriptGroups.map((group) => (
            <div
              className={`flex flex-row ${
                group.type === "agent" ? "justify-start" : "justify-end"
              }`}
              key={transcriptGroupKey(group)}
            >
              <div
                className={`flex flex-col gap-1 p-3 max-w-3/4 rounded-lg ${
                  group.type === "agent"
                    ? "bg-blue-50 border-l-4 border-blue-400"
                    : "bg-green-50 border-l-4 border-green-400"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">
                    {group.type === "agent"
                      ? "🤖 Agent"
                      : `👤 ${group.speaker.replace("S", "Speaker ")}`}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-gray-800 leading-relaxed">
                  {group.type === "agent"
                    ? group.data.map((response) => response.text).join(" ")
                    : wordsToText(group.data)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}