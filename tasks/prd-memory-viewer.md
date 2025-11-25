# Product Requirements Document: Memory Viewer Modal

## 1. Introduction

The Memory Viewer is a new feature that allows users to actively inspect the long-term memories stored by the AI. Currently, memories are hidden and only surfaced contextually. This feature provides a dedicated UI (modal) for users to search and view these memories, increasing transparency and trust in the system.

## 2. Goals

- Provide a user interface to search for specific memories stored in the vector database.
- Display memory details (content and timestamp) to the user.
- Integrate seamlessly into the existing application layout.

## 3. User Stories

- **Open Viewer:** As a user, I want to click a "Memories" button in the sidebar to open a modal window.
- **Search Memories:** As a user, I want to type a query (e.g., "project management") into a search bar within the modal.
- **View Results:** As a user, I want to see a list of the top 15 most relevant memories matching my search, including when they were created.
- **Empty State:** As a user, I want to see a clear prompt to search when I first open the modal.

## 4. Functional Requirements

1.  **Sidebar Integration:**
    - Add a "Memories" button to the `ChatList` sidebar.
    - Placement: Top of the sidebar, adjacent to or below the "New Chat" button.
2.  **Memory Modal:**
    - Use a Modal/Dialog component (shadcn/ui `Dialog`).
    - The modal must contain a search input field.
    - The modal must have a results area to display memories.
3.  **Search Functionality:**
    - Users must manually trigger a search (e.g., on Enter or button click) or use debounced input.
    - The system shall query the Pinecone vector database for the top 15 semantically similar memories.
4.  **Results Display:**
    - Display a list of found memories.
    - Each item must show:
      - Memory Content (text).
      - Date/Timestamp (formatted).
    - If no results are found, show a "No memories found" message.
5.  **API Interaction:**
    - Create or update an API endpoint to return structured memory objects (ID, content, date) instead of just formatted strings.

## 5. Non-Goals (Out of Scope)

- **Deleting Memories:** Users cannot delete memories in this version.
- **Editing Memories:** Users cannot edit memory content.
- **Browsing All:** The system will not list all memories; it relies on search/querying (Vector DB limitation).
- **Pagination:** We will limit results to the top 15 matches only.

## 6. Design Considerations

- **UI Library:** Use existing `shadcn/ui` components (`Dialog`, `Input`, `Button`, `ScrollArea`).
- **Layout:**
  - Header: Title "Memory Viewer".
  - Body: Search bar at the top, scrollable list of cards/items below.
- **Styling:** Match the existing application theme (Tailwind CSS).

## 7. Technical Considerations

- **Endpoint:** The existing `/api/retrieve` returns formatted strings for the LLM. We should create a new endpoint `POST /api/memories/search` (or similar) that returns the raw `Memory` objects (JSON) so the UI can render them richly.
- **State Management:** Local state within the Modal component is sufficient; no need for global store persistence for search results.

## 8. Success Metrics

- **Usability:** Users can successfully find a known memory (e.g., "I like bullet points") by searching for it.
- **Performance:** Search results load within reasonable time (< 2 seconds).

## 9. Open Questions

- None at this stage.
