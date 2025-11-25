# PRD: Top 10 Core Memories Generation

## 1. Introduction/Overview

This feature aims to implement a mechanism that synthesizes the "Top 10 Core Memories" for a user. Instead of simply listing raw past messages, the system will analyze the user's chat history stored in the vector database (Pinecone) using Recency, Frequency, and Similarity metrics. These raw inputs will be processed by an LLM to generate concrete, high-level facts or insights (e.g., "User prefers Italian food on Fridays"). These memories will be displayed in the UI and used to augment the context of future conversations.

## 2. Goals

- **Synthesize Insights:** Convert raw vector fragments into 10 coherent, high-value facts about the user.
- **Multi-factor Ranking:** Utilize Recency (freshness), Frequency (repetition), and Similarity (relevance) to prioritize which information is "Core".
- **Context Augmentation:** Improve the AI's persona and helpfulness by injecting these core memories into the chat context.
- **User Visibility:** Provide a transparent view of what the AI "believes" are the most important facts about the user.

## 3. User Stories

- **As a User**, I want to view a list of the top 10 things the AI remembers about me, so I can verify its understanding of my preferences.
- **As a User**, I want the AI to automatically reference these core facts (e.g., dietary restrictions, hobbies) in conversation without me needing to remind it.
- **As a User**, I want these memories to update automatically as I interact more with the application, reflecting my changing or reinforced preferences.

## 4. Functional Requirements

### 4.1. Data Retrieval & Ranking

1.  **Source:** The system must query the Pinecone vector database, scoped to the current user's namespace.
2.  **Retrieval Strategy:**
    - The system should retrieve a broad set of candidate memories (e.g., top 50-100) potentially using a generic query like "User preferences, facts, and important details" or by clustering existing vectors.
3.  **Scoring Algorithm:**
    - **Frequency:** Weigh repeated information higher (using `occurrenceCount` metadata).
    - **Recency:** Weigh newer memories higher (using `timestamp` metadata).
    - **Similarity:** Ensure the selected set covers diverse topics (avoiding 10 variations of the same fact) or aligns with the "Core Identity" query.

### 4.2. LLM Synthesis

1.  **Input:** The top ranked raw memory fragments.
2.  **Process:** An LLM (GPT-4o-mini) prompt must be designed to:
    - Analyze the fragments.
    - Deduplicate conflicting or redundant information.
    - Synthesize the data into exactly 10 distinct, concise statements (e.g., "User is allergic to peanuts").
    - This should either be an offline or a batch process, don't put unnecessary load on the server or client.
3.  **Output:** A JSON array of 10 string objects representing the core memories.

### 4.3. Trigger & Storage

1.  **Trigger:**
    - **Primary:** When the "Memory Viewer" component is opened/loaded.
    - **Secondary (Background):** Optionally, re-calculate after a set number of new messages (e.g., every 5 messages, every 1 messages in dev mode) to keep the context fresh.
2.  **Caching:** The synthesized list should be cached (e.g., in `localStorage` or a lightweight server-side store) to prevent excessive LLM calls on every page load, invalidating the cache when new conversations occur.

### 4.4. User Interface

1.  **Memory Viewer:** Update the existing Memory Viewer to display these "Top 10 Core Memories" prominently, separate from the raw search results.
2.  **Visuals:** Display as a clean list or cards.

### 4.5. Context Injection

1.  **Chat Flow:** When sending a message to the `api/chat` endpoint, the system must include these 10 core memories in the `system` prompt or as a high-priority context block.

## 5. Non-Goals (Out of Scope)

- Manual editing or deleting of individual core memories by the user (for this iteration).
- Complex graph database implementation.
- User-defined categories for memories.

## 6. Technical Considerations

- **Existing Stack:** Next.js, Pinecone, OpenAI.
- **Performance:** Retrieving multiple vectors and running an LLM synthesis step can be slow, use batching. The UI should show a loading state or stream the results.
- **Cost:** Frequent re-synthesis using LLMs can incur costs; aggressive caching is recommended.

## 7. Success Metrics

- **Relevance:** User feedback (if available) indicating the memories are accurate.
- **Latency:** The "Core Memories" view loads within 3 seconds.
- **Context Usage:** The AI successfully answers questions based on these core memories without explicit prompting in the current session. The user doesn't have to re-specify their preferences.

## 8. Open Questions

- What is the exact decay rate for "Recency"? decide in future scope, lets do a standard implementation for now, keep it extensible.
- How do we handle contradictory information? (e.g., "I love pizza" vs "I'm on a diet"). The LLM synthesis step should ideally resolve this based on the most recent data. let the LLM combine it, also always prioritise recent memories
