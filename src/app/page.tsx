import { Controls } from "@/components/Controls";
import { Status } from "@/components/Status";
import { TranscriptView } from "@/components/TranscriptView";
import { Providers } from "./providers";

export default function Home() {
  // Use your custom template ID instead of fetching personas
  const personas = {
    "d275a370-d772-470f-8347-3cffc44c6e1e:latest": {
      name: "Custom Voice Agent"
    }
  };

  return (
    <main>
      <h1>Custom Voice Agent - Speechmatics Flow</h1>
      <Providers>
        <div className="flex flex-col gap-4 h-full min-h-0">
          <div className="flex flex-row gap-2">
            <Controls personas={personas} />
            <Status />
          </div>
          <TranscriptView />
        </div>
      </Providers>
    </main>
  );
}