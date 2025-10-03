"use client";

import { usePCMAudioRecorderContext } from "@speechmatics/browser-audio-input-react";
import { useFlow } from "@speechmatics/flow-client-react";

export function Status() {
  const { socketState, sessionId } = useFlow();
  const { isRecording } = usePCMAudioRecorderContext();

  const getStatusColor = (state: string | undefined) => {
    switch (state) {
      case "open":
        return "text-green-600";
      case "connecting":
        return "text-yellow-600";
      case "closing":
        return "text-yellow-600";
      case "closed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getRecordingColor = (recording: boolean) => {
    return recording ? "text-red-600" : "text-gray-600";
  };

  return (
    <section className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Status</h3>
      <dl className="space-y-2">
        <div className="flex justify-between items-center">
          <dt className="font-medium text-gray-600">🔌 Socket:</dt>
          <dd className={`font-mono text-sm ${getStatusColor(socketState)}`}>
            {socketState ?? "(uninitialized)"}
          </dd>
        </div>
        <div className="flex justify-between items-center">
          <dt className="font-medium text-gray-600">💬 Session ID:</dt>
          <dd className="font-mono text-sm text-gray-800">
            {sessionId ? sessionId.slice(0, 8) + "..." : "(none)"}
          </dd>
        </div>
        <div className="flex justify-between items-center">
          <dt className="font-medium text-gray-600">🎤 Microphone:</dt>
          <dd className={`font-mono text-sm ${getRecordingColor(isRecording)}`}>
            {isRecording ? "recording" : "not recording"}
          </dd>
        </div>
      </dl>
    </section>
  );
}