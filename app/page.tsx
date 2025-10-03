import { fetchPersonas } from "@speechmatics/flow-client-react";
import { Controls } from "@/components/Controls";
import { Status } from "@/components/Status";
import { TranscriptView } from "@/components/TranscriptView";
import { Providers } from "./providers";

export default async function Home() {
  const personasData = await fetchPersonas();
  const personas = Object.entries(personasData).map(([id, persona]) => ({
    id,
    name: persona.name,
    description: persona.description,
    character: persona.character,
    startText: persona.start_text,
    avatar: persona.avatar,
  }));

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎤 Voice Bot App
          </h1>
          <p className="text-lg text-gray-600">
            Powered by Speechmatics Flow - Have natural conversations with AI
          </p>
        </div>
        
        <Providers>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Controls and Status */}
            <div className="lg:col-span-1 space-y-6">
              <Controls personas={personas} />
              <Status />
            </div>
            
            {/* Transcript View */}
            <div className="lg:col-span-2">
              <TranscriptView />
            </div>
          </div>
        </Providers>
        
        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>
            Built with Next.js and Speechmatics Flow | 
            <a 
              href="https://docs.speechmatics.com/voice-agents-flow" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline ml-1"
            >
              Documentation
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}