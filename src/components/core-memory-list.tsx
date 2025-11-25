"use client";

import { useEffect, useState } from "react";
import { Loader2, Brain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function CoreMemoryList() {
  const [memories, setMemories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoreMemories = async () => {
      try {
        const response = await fetch("/api/memories/core");
        if (!response.ok) {
          throw new Error("Failed to fetch core memories");
        }
        const data = await response.json();
        setMemories(data.memories || []);
      } catch (err) {
        console.error("Error fetching core memories:", err);
        setError("Failed to load core memories");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoreMemories();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p className="text-sm">Synthesizing core memories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive text-sm">{error}</div>
    );
  }

  if (memories.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No core memories synthesized yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Core Identity & Facts</h3>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {memories.map((memory, index) => (
          <Card key={index} className="bg-muted/50">
            <CardContent className="p-3 flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5 shrink-0">
                {index + 1}
              </Badge>
              <p className="text-sm leading-relaxed">{memory}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
