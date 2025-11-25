# Tasks: Long-Term Memory Layer for Bhindi PoC

## Relevant Files

- `src/app/page.tsx` - Main app entry point with chat UI layout
- `src/app/layout.tsx` - Root layout with providers
- `src/app/api/chat/route.ts` - Streaming LLM chat endpoint with memory retrieval
- `src/app/api/embed/route.ts` - Endpoint for embedding and storing conversation chunks
- `src/app/api/retrieve/route.ts` - Endpoint for retrieving relevant memories from Pinecone
- `src/components/ChatList.tsx` - Sidebar component displaying all chat threads
- `src/components/ChatInterface.tsx` - Main chat UI with message display and input
- `src/components/MessageBubble.tsx` - Individual message component (user/assistant styling)
- `src/lib/openai.ts` - OpenAI client initialization and helper functions
- `src/lib/pinecone.ts` - Pinecone client initialization and connection setup
- `src/lib/memory-store.ts` - Core memory logic (embed, retrieve, format)
- `src/store/chat-store.ts` - Zustand store for chat state management
- `src/lib/types.ts` - TypeScript interfaces for Message, Chat, Memory
- `.env.local` - Environment variables for API keys
- `package.json` - Dependencies and scripts
- `tailwind.config.ts` - Tailwind configuration
- `components.json` - shadcn/ui configuration

### Notes

- This is a PoC with no testing requirements
- Focus on functionality over error handling perfection
- All chats share a single global namespace ("poc-user") in Pinecone
- localStorage is used for chat persistence (no database)
- Prefer client side funcitonlaity whereever possible
- Target timeline: 3 hours (1hr setup, 2hrs memory iteration)

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:

- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [ ] 0.0 Create feature branch

  - [x] 0.1 Create and checkout a new branch `feature/long-term-memory-poc`

- [x] 1.0 Initialize Next.js 15 project and install dependencies

  - [x] 1.1 Create new Next.js 15 project with TypeScript using `pnpm dlx create-next-app@15.0.0-rc.0 . --ts`
  - [x] 1.2 Install core dependencies: `npm i openai @pinecone-database/pinecone zod dotenv nanoid zustand lucide-react`
  - [x] 1.3 Install dev dependencies: `npm i -D tailwindcss postcss autoprefixer @types/node`
  - [x] 1.4 Initialize shadcn/ui: `pnpm dlx shadcn-ui@latest init`
  - [x] 1.5 Add shadcn components: `pnpm dlx shadcn-ui@latest add button input scroll-area card avatar`
  - [x] 1.6 Verify all dependencies installed correctly by checking `package.json`

- [x] 2.0 Configure environment and API clients

  - [x] 2.1 Create `.env.local` file with placeholder keys: `OPENAI_API_KEY`, `PINECONE_API_KEY`, `PINECONE_INDEX_NAME`
  - [x] 2.2 Add `.env.local` to `.gitignore` if not already present
  - [x] 2.3 Create `src/lib/openai.ts` - Initialize OpenAI client with API key from env
  - [x] 2.4 Create `src/lib/pinecone.ts` - Initialize Pinecone client and connect to index
  - [x] 2.5 Add environment variable validation using Zod in a `src/lib/env.ts` file

- [x] 3.0 Set up Zustand store and TypeScript types

  - [x] 3.1 Create `src/lib/types.ts` with interfaces: `Message` (id, role, content, timestamp), `Chat` (id, title, messages, createdAt, updatedAt), `Memory` (id, content, metadata, embedding)
  - [x] 3.2 Create `src/store/chat-store.ts` with Zustand store managing: chats array, activeChat, addChat, selectChat, addMessage, updateChat
  - [x] 3.3 Add localStorage persistence middleware to chatStore (sync on mount, save on change)
  - [x] 3.4 Add helper functions: createNewChat, deleteChat, getChatById

- [x] 4.0 Build core UI components (ChatList, ChatInterface, MessageBubble)

  - [x] 4.1 Create `src/components/MessageBubble.tsx` - Display individual message with role-based styling (user: right-aligned blue, assistant: left-aligned gray)
  - [x] 4.2 Create `src/components/ChatInterface.tsx` - Main chat view with ScrollArea for messages, input field at bottom, send button
  - [x] 4.3 Add auto-scroll to bottom when new messages arrive in ChatInterface
  - [x] 4.4 Create `src/components/ChatList.tsx` - Sidebar with list of chats, "New Chat" button, chat selection logic
  - [x] 4.5 Style ChatList items: show chat title (truncated), last message timestamp, highlight active chat
  - [x] 4.6 Create `src/app/page.tsx` - Main layout with ChatList sidebar (1/4 width) and ChatInterface main area (3/4 width)
  - [x] 4.7 Add empty state UI when no chats exist ("Start a new conversation")

- [x] 5.0 Implement streaming chat API endpoint

  - [x] 5.1 Create `src/app/api/chat/route.ts` with POST handler accepting `{ chatId, messages }` in request body
  - [x] 5.2 Implement OpenAI streaming call using `openai.chat.completions.create()` with `stream: true` and model `gpt-4o-mini`
  - [x] 5.3 Set up Next.js streaming response using `ReadableStream` and `new Response(stream)`
  - [x] 5.4 Return streamed chunks in SSE format for client consumption
  - [x] 5.5 Add basic error handling: catch API errors and return error response with status code
  - [x] 5.6 Test streaming in ChatInterface by wiring up fetch call to `/api/chat` on message send

- [x] 6.0 Implement memory embedding system

  - [x] 6.1 Create `src/lib/memory-store.ts` with `embedMemory()` function
  - [x] 6.2 Implement logic to generate embedding using OpenAI `text-embedding-3-large` model
  - [x] 6.3 Add function to chunk messages: combine single user message as one chunk (not pairs, based on updated requirements)
  - [x] 6.4 Create Pinecone upsert logic: store vector with metadata (timestamp, message_role, message_content, token_count, source_message_ids, occurrence_count)
  - [x] 6.5 Implement token counting for memory chunks with upper limit (e.g., 500 tokens max per chunk)
  - [x] 6.6 Generate unique memory ID using `nanoid()`
  - [x] 6.7 Use namespace `"poc-user"` for all upserts
  - [x] 6.8 Create `src/app/api/embed/route.ts` POST handler accepting `{ chatId, messages }` and calling `embedMemory()`
  - [x] 6.9 Add retry logic: retry up to 3 times on embedding or upsert failure, then fail with error log

- [x] 7.0 Implement memory retrieval and context injection

  - [x] 7.1 Create `retrieveMemories()` function in `src/lib/memory-store.ts`
  - [x] 7.2 Implement query embedding: embed user's current message using `text-embedding-3-large`
  - [x] 7.3 Perform Pinecone vector similarity search with `topK: 15`, namespace `"poc-user"`, include metadata
  - [x] 7.4 Filter results by relevance score threshold (e.g., score > 0.7)
  - [x] 7.5 Limit to maximum 15 memories even if more pass threshold
  - [x] 7.6 Create `formatMemories()` function to convert retrieved memories into formatted context strings
  - [x] 7.7 Format each memory as: `[From previous chat on {date}]: {message_content}`
  - [x] 7.8 Create `src/app/api/retrieve/route.ts` POST handler accepting `{ query }` and returning formatted memories
  - [x] 7.9 Add retry logic: retry up to 3 times on retrieval failure, then return empty array with error log

- [x] 8.0 Integrate memory layer with chat flow

  - [x] 8.1 Update ChatInterface to track message count per chat in component state
  - [x] 8.2 On user message send: first call `/api/retrieve` with user query to get relevant memories
  - [x] 8.3 Inject retrieved memories into messages array as system messages BEFORE user's current message
  - [x] 8.4 Send augmented messages array to `/api/chat` for LLM streaming response
  - [x] 8.5 After receiving complete assistant response: increment message count
  - [x] 8.6 When message count % 5 === 0: call `/api/embed` in background to store last 5 messages
  - [x] 8.7 Ensure embedding happens asynchronously without blocking UI
  - [x] 8.8 Add console logs for debugging: log when memories retrieved, when embedding triggered

- [x] 9.0 Test end-to-end memory functionality
  - [x] 9.1 Start dev server and create Chat 1
  - [x] 9.2 Send message: "I prefer bullet points over paragraphs"
  - [x] 9.3 Verify message embedded (check Pinecone dashboard or logs after 5 messages)
  - [x] 9.4 Create Chat 2 and send message: "Summarize the benefits of TypeScript"
  - [x] 9.5 Verify AI response includes bullet points WITHOUT user re-stating preference
  - [x] 9.6 Create Chat 3 and send message: "I use Linear for project management"
  - [x] 9.7 Send 4 more messages to trigger embedding (total 5 messages)
  - [x] 9.8 Create Chat 4 and ask: "Help me create a task for this bug fix"
  - [x] 9.9 Verify AI mentions or suggests Linear based on retrieved memory
  - [x] 9.10 Test localStorage persistence: refresh page and verify all chats still exist
  - [x] 9.11 Test error handling: temporarily break Pinecone connection and verify chat still works without memories
  - [x] 9.12 Document any issues or improvements discovered during testing in PRD "Open Questions" section
