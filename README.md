# Memories: Long-Term Memory for LLMs

A Proof of Concept (PoC) demonstrating how to equip Large Language Models (LLMs) with persistent, long-term memory using Vector Databases (Pinecone) and RAG (Retrieval-Augmented Generation).

## 🚀 Overview

This project implements a memory system that allows an AI assistant to "remember" user preferences, facts, and past interactions across different sessions. It goes beyond simple context window buffering by actively storing, retrieving, and synthesizing memories.

### Key Features

- **Semantic Search**: Retrieves relevant past interactions based on the meaning of the user's current query.
- **Core Memory Synthesis**: Periodically distills raw conversation logs into high-level facts (e.g., "User is allergic to peanuts") using a background synthesis process.
- **Hybrid Ranking**: Uses a weighted scoring algorithm (Similarity + Recency + Frequency) to prioritize memories for synthesis.
- **Real-time Streaming**: Chat interface with real-time streaming and dynamic scroll.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Pinecone (Vector DB)
- **AI/LLM**: OpenAI (GPT-4o-mini for synthesis, text-embedding-3-small for embeddings)
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management**: Zustand

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- OpenAI API Key
- Pinecone API Key & Index

### Setup

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd memories
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Configuration**
   Copy the example environment file and fill in your credentials:

   ```bash
   cp .env.example .env
   ```

   Update `.env` with:

   ```env
   OPENAI_API_KEY=sk-...
   PINECONE_API_KEY=pc-...
   PINECONE_INDEX_NAME=your-index-name
   ```

4. **Run the Development Server**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧠 How It Works

The memory architecture consists of two main loops: the **Interaction Loop** and the **Synthesis Loop**.

### 1. Interaction Loop (Fast Path)

This happens in real-time as the user chats.

1.  **User Input**: User sends a message (e.g., "What was that pizza recipe I liked?").
2.  **Retrieval**: The system embeds the query and searches Pinecone for semantically similar past messages (`/api/retrieve`).
    - _Mechanism_: Pure Vector Similarity (Cosine).
    - _Threshold_: Matches with score > 0.35.
3.  **Augmentation**: Retrieved memories are injected into the LLM's system prompt as context.
4.  **Generation**: The LLM responds, aware of the past context.
5.  **Embedding**: The user's new message is chunked, embedded, and stored in Pinecone asynchronously (`/api/embed`).

### 2. Synthesis Loop (Background Path)

This process runs to distill "Core Memories"—high-level facts about the user.

1.  **Broad Retrieval**: Fetches a large set of candidate memories (`getBroadCandidateMemories`).
2.  **Re-Ranking**: Candidates are re-scored using a custom algorithm:
    - **Similarity (40%)**: Relevance to "User preferences and facts".
    - **Recency (40%)**: Newer memories are weighted higher to capture current state.
    - **Frequency (20%)**: Repeated information is prioritized.
3.  **LLM Synthesis**: The top candidates are sent to an LLM (GPT-4o-mini) with instructions to:
    - Deduplicate information.
    - Resolve conflicts (favoring recent data).
    - Extract distinct facts (e.g., "User prefers dark mode").
4.  **Storage**: The synthesized list is stored and displayed in the UI as the user's "Core Identity".

## 🔮 Future Scope & Roadmap

Based on current State-of-the-Art (SOTA) research in LLM memory systems (MemGPT, Generative Agents, GraphRAG), here are the identified gaps and planned improvements:

### 1. Hierarchical Memory Architecture (MemGPT-inspired)

- **Current**: Flat vector storage + simple list of core memories.
- **Future**: Implement a tiered architecture:
  - **Working Context**: RAM-like immediate context.
  - **Recall Storage**: Episodic memory (current implementation).
  - **Archival Storage**: Deep storage for cold data.
- **Goal**: Allow the LLM to explicitly "page in" and "page out" memories rather than relying solely on implicit retrieval.

### 2. Knowledge Graphs (GraphRAG)

- **Current**: Unstructured text chunks.
- **Future**: Extract entities (People, Places, Concepts) and relationships into a Knowledge Graph.
- **Goal**: Enable multi-hop reasoning (e.g., "How is my project X related to the meeting I had last week?") which vector search struggles with.

### 3. Reflection & Planning (Generative Agents)

- **Current**: Simple summarization of facts.
- **Future**: Implement a "Reflection" step where the agent periodically pauses to analyze its own behavior and form higher-level goals or personality adjustments.
- **Goal**: Create a more agentic feel where the AI evolves its personality based on interactions.

### 4. Active Memory Management

- **Current**: Passive storage (everything is saved).
- **Future**: Allow the user (or the agent) to explicitly _forget_ or _modify_ memories.
- **Goal**: Better privacy and accuracy control.
