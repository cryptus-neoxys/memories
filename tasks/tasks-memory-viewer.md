# Tasks: Memory Viewer Feature

## Relevant Files

- `src/app/api/memories/search/route.ts` - New API endpoint for searching memories and returning structured data.
- `src/components/memory-viewer.tsx` - New component for the Memory Viewer modal.
- `src/components/chat-list.tsx` - Update to include the "Memories" button.
- `src/lib/memory-store.ts` - Reuse existing retrieval logic.
- `src/lib/types.ts` - Ensure Memory type is exported and usable on the client.

### Notes

- Focus on reusing existing `shadcn/ui` components.
- Ensure the API returns structured data (JSON) for the UI, not just formatted strings.

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:

- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [ ] 0.0 DO NOT Create feature branch, its a part of this current feature branch

- [ ] 1.0 Implement Memory Search API

  - [x] 1.1 Create `src/app/api/memories/search/route.ts`
  - [x] 1.2 Implement POST handler accepting `{ query }`
  - [x] 1.3 Import `retrieveMemories` from `@/lib/memory-store`
  - [x] 1.4 Call `retrieveMemories(query)` to get raw memory objects
  - [x] 1.5 Return JSON response `{ memories: Memory[] }`
  - [x] 1.6 Add error handling for missing query or internal errors

- [ ] 2.0 Create Memory Viewer UI Components

  - [x] 2.1 Install Dialog component if missing: `pnpm dlx shadcn-ui@latest add dialog`
  - [x] 2.2 Create `src/components/memory-viewer.tsx`
  - [x] 2.3 Implement `MemoryViewer` component accepting `open` and `onOpenChange` props
  - [x] 2.4 Add `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle` structure
  - [x] 2.5 Add `Input` for search query and `Button` for triggering search
  - [x] 2.6 Add state for `query`, `results` (Memory[]), `isLoading`
  - [x] 2.7 Implement `handleSearch` function calling `/api/memories/search`
  - [x] 2.8 Render list of results using `ScrollArea`
  - [x] 2.9 Display memory content and formatted timestamp for each result
  - [x] 2.10 Handle empty state ("No memories found") and initial state ("Search to find memories")

- [ ] 3.0 Integrate Memory Viewer into Sidebar

  - [x] 3.1 Open `src/components/chat-list.tsx`
  - [x] 3.2 Add state `isMemoryViewerOpen`
  - [x] 3.3 Import `MemoryViewer` component
  - [x] 3.4 Add "Memories" button (using `Button` variant="outline" or similar) above the chat list
  - [x] 3.5 Render `MemoryViewer` component controlled by `isMemoryViewerOpen`

- [x] 4.0 End-to-End Testing & Polish
  - [x] 4.1 Start dev server
  - [x] 4.2 Open Memory Viewer from sidebar
  - [x] 4.3 Search for a known term (e.g., from previous testing)
  - [x] 4.4 Verify results display correct content and dates
  - [x] 4.5 Verify loading state appears during search
  - [x] 4.6 Verify empty state when no matches found
