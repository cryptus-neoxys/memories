import { ChatList } from "@/components/chat-list";
import { ChatInterface } from "@/components/chat-interface";

export default function Home() {
  return (
    <main className="h-screen bg-background px-4 py-10 font-sans md:px-8 overflow-hidden">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 h-full">
        <header>
          <h1 className="mt-2 text-2xl font-semibold text-foreground">
            Bhindi · Long-Term Memory PoC
          </h1>
          <p className="text-sm text-muted-foreground">
            Create multiple chats, capture preferences, and let the memory layer
            aggregate what matters.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr] flex-1 min-h-0">
          <ChatList />
          <ChatInterface />
        </div>
      </div>
    </main>
  );
}
