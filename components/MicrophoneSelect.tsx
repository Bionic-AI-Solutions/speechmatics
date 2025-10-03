"use client";
import { useAudioDevices } from "@speechmatics/browser-audio-input-react";

export function MicrophoneSelect({ disabled }: { disabled?: boolean }) {
  const devices = useAudioDevices();

  switch (devices.permissionState) {
    case "prompt":
      return (
        <select
          onClick={devices.promptPermissions}
          onKeyDown={devices.promptPermissions}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option>Click to allow microphone access</option>
        </select>
      );
    case "prompting":
      return (
        <select 
          aria-busy="true" 
          disabled
          className="px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
        >
          <option>Requesting microphone access...</option>
        </select>
      );
    case "granted": {
      return (
        <select 
          name="deviceId" 
          disabled={disabled}
          defaultValue={devices.deviceList[0]?.deviceId || ""}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        >
          {devices.deviceList.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label}
            </option>
          ))}
        </select>
      );
    }
    case "denied":
      return (
        <select 
          disabled 
          className="px-3 py-2 border border-gray-300 rounded-md bg-red-100 text-red-600"
        >
          <option>Microphone access denied</option>
        </select>
      );
    default:
      devices satisfies never;
      return null;
  }
}