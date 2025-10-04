import { fetchPersonas } from "@speechmatics/flow-client-react";
import { VoiceBotWidget } from "@/components/VoiceBotWidget";
import { Providers } from "./providers";
import { loadPersonas, Persona } from "@/lib/personaLoader";

export default async function Home() {
  // Load custom personas from JSON files
  const customPersonas = await loadPersonas();

  // Also load default personas from Speechmatics
  const personasData = await fetchPersonas();
  const defaultPersonas = Object.entries(personasData).map(([id, persona]) => ({
    id,
    name: persona.name,
    description: persona.description,
    character: persona.character,
    startText: persona.start_text,
    avatar: persona.avatar,
  }));

  // Combine custom and default personas, with custom ones taking priority
  const allPersonas = [...customPersonas, ...defaultPersonas];
  const uniquePersonas = allPersonas.filter((persona, index, self) =>
    index === self.findIndex(p => p.id === persona.id)
  );

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Providers>
        <VoiceBotWidget personas={uniquePersonas} />
      </Providers>
    </main>
  );
}