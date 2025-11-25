## Relevant Files

- `lib/pinecone.ts` - Contains Pinecone client initialization and query logic.
- `lib/llm/synthesis.ts` - New service for LLM synthesis and deduplication.
- `app/api/memories/core/route.ts` - New API route for retrieving/triggering core memories calculation.
- `components/memories/MemoryViewer.tsx` - Existing component to be updated to display core memories.
- `components/memories/CoreMemoryList.tsx` - New component for displaying the list of core memories.
- `app/api/chat/route.ts` - Chat API route to inject core memories into context.

### Notes

- This is a PoC with no testing requirements
- Focus on functionality over error handling perfection
- All chats share a single global namespace ("poc-user") in Pinecone
- localStorage is used for chat persistence (no database)
- Prefer client side funcitonlaity whereever possible
- Unit tests should typically be placed alongside the code files they are testing

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

## Tasks

- [x] 1.0 Implement Data Retrieval & Ranking (Pinecone query)
  - [x] 1.1 Create a function `getBroadCandidateMemories` in `lib/pinecone.ts` to query Pinecone for top 50-100 vectors.
  - [x] 1.2 Implement scoring/ranking logic within `getBroadCandidateMemories` (or a helper) to weigh frequency and recency.
- [x] 2.0 Implement LLM Synthesis Service (Deduplication & Synthesis)
  <!-- - [x] 2.1 Create `lib/llm/synthesis.ts` and define the prompt for GPT-4o-mini to deduplicate and synthesize memories into 10 distinct statements. -->
  - [x] 2.2 Implement `synthesizeCoreMemories` function in `lib/llm/synthesis.ts` that takes raw fragments and returns the JSON array.
- [x] 3.0 Implement Caching & Trigger Logic
  - [x] 3.1 Create API route `app/api/memories/core/route.ts` to handle requests for core memories.
  - [x] 3.2 Implement caching strategy (e.g., check database/cache first) in the API route.
  - [x] 3.3 Implement the trigger logic: calculate if cache is missing or stale (optional background trigger).
  - [x] 3.4 Add integration tests for the API route in `app/api/memories/core/route.test.ts`.
- [x] 4.0 Update Memory Viewer UI
  - [x] 4.1 Create `components/memories/CoreMemoryList.tsx` to display the list of 10 memories as cards or a list.
  - [x] 4.2 Update `components/memories/MemoryViewer.tsx` to fetch core memories from the new API and render `CoreMemoryList`.
  - [x] 4.3 Add loading state and error handling in the UI.
- [x] 5.0 Integrate with Chat Context
  - [x] 5.1 Modify `app/api/chat/route.ts` to fetch core memories.
  - [x] 5.2 Inject the core memories into the system prompt or context block for the chat interaction.
  - [x] 5.3 Verify that the chat context includes the core memories.
