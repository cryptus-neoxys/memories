# PRD: Long-Term Memory Layer for Bhindi

## Introduction/Overview

This PRD describes a Proof of Concept (PoC) implementation of a Long-Term Memory (LTM) layer for Bhindi, an LLM chat application. The core problem being solved is conversation context loss across sessions—users currently must repeat preferences, tools, and instructions every time they start a new chat.

The goal is to build a barebones multi-chat LLM application with global long-term memory capabilities that persists, retrieves, and utilizes conversation context across all chat sessions, making the AI feel like it "remembers" the user.

**Timeline:** 3 hours total

- 1 hour: Basic frontend LLM chat app setup
- 2 hours: Memory generation and retrieval iteration

## Goals

1. Build a functional multi-chat LLM interface where users can create and switch between multiple conversation threads
2. Automatically embed and store meaningful conversation chunks in a vector database (Pinecone)
3. Retrieve and inject relevant past context into new conversations across all chats
4. Demonstrate that the AI can recall previous conversations, preferences, and context without user repetition
5. Create a lightweight PoC that validates the LTM concept without authentication or user management

## User Stories

**As a user**, I want to:

- Start multiple chat conversations and switch between them seamlessly
- Have the AI remember what I said in previous chats (across all sessions)
- See the AI automatically recall my preferences (e.g., "use Linear not Jira") without me repeating them
- Experience continuity in conversations even after closing and reopening the app
- Not have to re-explain context that I've already provided in any previous chat

**As a developer**, I want to:

- Understand how conversation embedding and retrieval works in practice
- See how vector similarity search performs for conversational context
- Validate that memory injection improves conversation quality
- Build a foundation that can later scale with authentication and user isolation

## Functional Requirements

### Core Chat Functionality

1. The system must allow users to create new chat threads
2. The system must display a list of all chat threads with basic metadata (title, last message time)
3. The system must allow users to switch between chat threads
4. The system must persist chat threads in localStorage for the PoC
5. The system must stream LLM responses using OpenAI's API (gpt-4o-mini)
6. The system must display messages in a scrollable chat interface with user/assistant distinction

### Memory Storage (Embedding)

7. The system must embed conversation chunks after every 5 messages OR at the end of each session
8. The system must use OpenAI's `text-embedding-3-large` model for embeddings
9. The system must store embeddings in Pinecone serverless vector database
10. The system must include metadata with each embedding: timestamp, message_role, message_content, token_count, source_message_ids (array), occurrence_count
11. The system must generate a unique ID for each memory chunk using `nanoid`
12. The system must embed meaningful conversation pairs (user query + assistant response together)

### Memory Retrieval

13. The system must retrieve the top-15 most relevant memory chunks at the start of each new message
14. The system must perform vector similarity search against the user's query embedding
15. The system must inject retrieved memories into the LLM context as additional system/user messages
16. The system must format retrieved memories clearly (e.g., "[From previous chat on Nov 20]: User said...")
17. The system must handle memory retrieval failures gracefully by continuing without injected context
18. The system must log retrieval failures for debugging purposes

### Memory Management (PoC Scope)

19. The system must namespace all vectors under a single global namespace (e.g., "poc-user")
20. The system must NOT implement user authentication or per-user isolation
21. The system must NOT implement memory editing or deletion UI (out of scope for PoC)

## Non-Goals (Out of Scope)

The following are explicitly **NOT** included in this PoC:

1. **User Authentication & Authorization** - No login, signup, or user management
2. **Per-User Memory Isolation** - All memories stored in a single namespace
3. **User OS Page** - No UI showing what memories are stored
4. **Memory Editing/Deletion UI** - No ability to view, edit, or delete specific memories
5. **Advanced Memory Ranking** - No custom scoring, re-ranking, or preference weighting
6. **Production-Ready Error Handling** - Basic error handling only
7. **Database Persistence** - Chat history stored in localStorage only
8. **Mobile Optimization** - Desktop-first UI
9. **Analytics/Metrics** - No tracking or success measurement
10. **Deployment Configuration** - Local development only (Vercel deployment optional)

## Design Considerations

### Tech Stack (as specified in PoC):

- **Framework:** Next.js 15 (App Router) + TypeScript
- **UI:** shadcn/ui + Tailwind CSS + Lucide React
- **LLM & Embeddings:** OpenAI SDK (`gpt-4o-mini` + `text-embedding-3-large`)
- **Vector DB:** Pinecone (serverless, free tier)
- **State Management:** Zustand for chat list management
- **Local Persistence:** localStorage for chat threads
- **IDs:** nanoid for unique identifiers

### UI Components Needed:

- Chat list sidebar (scrollable list of chat threads)
- Chat interface (message list + input box)
- New chat button
- Chat thread switcher
- Message bubbles (user vs assistant styling)
- Streaming message indicator

### UX Flow:

1. User opens app → sees chat list (empty on first load)
2. User creates new chat → chat interface appears
3. User sends message → LLM responds with streaming
4. Every 5 messages → system embeds conversation in background
5. User creates another chat → asks related question → AI recalls context from previous chat
6. User refreshes page → chats persist via localStorage

## Technical Considerations

### Architecture:

```
/app
  /api
    /chat/route.ts        # Streaming LLM endpoint
    /embed/route.ts       # Embedding storage endpoint
    /retrieve/route.ts    # Memory retrieval endpoint
  /components
    ChatList.tsx
    ChatInterface.tsx
    MessageBubble.tsx
  /lib
    openai.ts             # OpenAI client
    pinecone.ts           # Pinecone client
    memoryStore.ts        # Memory logic
  /store
    chatStore.ts          # Zustand state
```

### Key Implementation Notes:

1. **Embedding Trigger:** Track message count in each chat; embed when count % 5 === 0
2. **Embedding Format:** Combine user message + assistant response as single chunk
3. **Retrieval Timing:** Fetch memories BEFORE sending user message to LLM
4. **Context Injection:** Prepend retrieved memories as system messages with clear formatting
5. **Failure Handling:** If Pinecone is down or retrieval fails, continue chat without memories (log error)
6. **Namespace:** Use `"poc-user"` as the single namespace for all embeddings

### Dependencies (exact packages):

```bash
openai
@pinecone-database/pinecone
zod
dotenv
nanoid
zustand
lucide-react
shadcn/ui components: button, input, scroll-area, card, avatar
```

### Environment Variables Required:

```
OPENAI_API_KEY=
PINECONE_API_KEY=
PINECONE_INDEX_NAME=
```

## Success Metrics

Since this is a PoC, success is qualitative and demo-based:

1. **Memory Persistence:** Conversations are successfully embedded and stored in Pinecone
2. **Memory Retrieval:** Relevant past context is retrieved and displayed in LLM responses
3. **Cross-Chat Recall:** The AI demonstrates recall of information from different chat threads
4. **System Stability:** The app handles embedding/retrieval failures without crashing
5. **Developer Understanding:** The PoC clearly demonstrates how LTM works for future iteration

**Demo Scenario for Validation:**

- Chat 1: User says "I prefer bullet points over paragraphs"
- Chat 2: User asks "Summarize this article [paste text]"
- Expected: AI responds with bullet points WITHOUT user re-stating preference
- Chat 3: User mentions "I use Linear for project management"
- Chat 4: User asks "Help me track this task"
- Expected: AI suggests Linear integration based on memory

## Next Steps After PoC

If the PoC successfully validates the LTM concept, the next iterations would include:

1. Add user authentication (Clerk or NextAuth)
2. Implement per-user memory namespaces
3. Build "User OS" page showing stored memories
4. Add memory editing/deletion UI
5. Implement advanced memory ranking (recency + relevance scoring)
6. Add proper error handling and retry logic
7. Migrate from localStorage to proper database (PostgreSQL + Prisma)
8. Deploy to production with monitoring

---

**Version:** 1.0  
**Created:** November 22, 2025  
**Owner:** Product/Engineering  
**Status:** Ready for Development
