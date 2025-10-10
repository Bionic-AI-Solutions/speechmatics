import { SimpleVoiceChat } from "@/components/SimpleVoiceChat";
import { Providers } from "./providers";

export default function Home() {
  return (
    <main className="h-screen flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">Voice Assistant</h1>
      </div>
      <Providers>
        <SimpleVoiceChat />
      </Providers>
    </main>
  );
}