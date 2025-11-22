"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Memory } from "@/lib/types";
import { Search, Loader2 } from "lucide-react";

interface MemoryViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MemoryViewer({ open, onOpenChange }: MemoryViewerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const response = await fetch("/api/memories/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.memories);
      } else {
        console.error("Failed to search memories");
        setResults([]);
      }
    } catch (error) {
      console.error("Error searching memories:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Memory Viewer</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 py-4">
          <Input
            placeholder="Search memories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button onClick={handleSearch} disabled={isLoading || !query.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {!hasSearched && (
              <div className="text-center text-muted-foreground py-8">
                Search to find relevant memories stored in the system.
              </div>
            )}
            {hasSearched && results.length === 0 && !isLoading && (
              <div className="text-center text-muted-foreground py-8">
                No memories found matching your query.
              </div>
            )}
            {results.map((memory) => (
              <div
                key={memory.id}
                className="rounded-lg border p-4 text-sm space-y-2"
              >
                <div className="font-medium text-muted-foreground text-xs">
                  {new Date(memory.metadata.timestamp).toLocaleString()}
                </div>
                <div className="whitespace-pre-wrap">
                  {memory.metadata.messageContent}
                </div>
                <div className="text-xs text-muted-foreground">
                  Relevance: {(memory.score || 0).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
