# AI Knowledge Base Roadmap (RAG Application)

> **Goal**: Build a local, free, production-grade Quality Retrieval Augmented Generation (RAG) system. Users upload PDFs and chat with them using Google Gemini.

## 1. What are we building? (The Concept)

We are building a **RAG (Retrieval Augmented Generation)** system.
Standard LLMs (like Gemini or ChatGPT) don't know about _your_ specific private documents. RAG solves this by:

1.  **Ingesting** your documents (PDFs) and breaking them into small "chunks".
2.  **Indexing** them by converting text into "vectors" (lists of numbers representing meaning).
3.  **Retrieving** the most relevant chunks when you ask a question.
4.  **Generating** an answer by giving the LLM both your question AND the retrieved chunks.

## 2. Tech Stack & Rationale

We will use an "Industry Standard" stack for JavaScript AI apps.

### **Backend (The Brain)**

- **Runtime**: **Node.js** (Fast, familiar).
- **Framework**: **Express.js** (Robust, easy to set up).
- **Orchestration**: **LangChain.js**
  - _Why?_ It's the standard library for building LLM apps. It handles the complexity of connecting to AI models, splitting text, and formatting prompts.
- **AI Model**: **Google Gemini (via `google-generative-ai`)**
  - _Why?_ High quality, large context window, and currently offers a generous free tier. Used for _generation_ (answering).
- **Embeddings**: **Ollama (Locally running `nomic-embed-text`)**
  - _Why?_ Runs 100% locally on your machine. Free. No API limits. High performance.
  - _Deployment_: **Docker Container**.

### **Database (The Memory)**

- **Vector Database**: **ChromaDB**
  - _Why?_ It is open-source, runs locally via Docker, is extremely popular for RAG, and is very fast. It stores the "meaning" of your data.
  - _Deployment_: **Docker Container**.

### **Frontend (The Face)**

- **Framework**: **React** (Vite)
- **Styling**: **Tailwind CSS** + **Shadcn/UI** (for a polished, modern look).
- **Interaction**: Chat interface with streaming responses.

---

## 3. Architecture & Data Flow

### A. Ingestion Pipeline (Upload -> Store)

1.  **User uploads PDF** -> Server receives file (Multer).
2.  **Extract Text** -> Server reads PDF content (`pdf-parse`).
3.  **Chunking** -> Text is split into overlapping chunks (e.g. 1000 chars) using `RecursiveCharacterTextSplitter`.
4.  **Embedding** -> Each chunk is sent to **Ollama** which runs a local model (`nomic-embed-text`) to create the vector.
5.  **Storage** -> Vectors + Original Text are saved to **ChromaDB**.

### B. Retrieval Pipeline (Question -> Answer)

1.  **User asks question** -> Server receives text.
2.  **Embed Query** -> Convert question to vector (using **Ollama**).
3.  **Semantic Search** -> ChromaDB finds the 5 text chunks most similar to the question.
4.  **Prompt Construction** -> Server creates a prompt: _"Using this context: [Chunks], answer this question: [Question]"_.
5.  **Generation** -> Gemini generates the answer.
6.  **Response** -> User sees the answer.

---

## 4. Implementation Roadmap

### Phase 1: Infrastructure Setup

- [x] Initialize Git repository.
- [x] Create folder structure: `server/` (Backend), `client/` (Frontend).
- [x] Create `docker-compose.yml` to run **ChromaDB**.
- [x] Verify ChromaDB is running (`localhost:8000`).
- [x] Verify local Ollama is running (`nomic-embed-text` model loaded).

### Phase 2: Backend Core

- [x] Initialize Node.js project (`npm init`).
- [x] Install dependencies: `express`, `cors`, `dotenv`, `multer`.
- [x] Install AI libs: `langchain`, `@langchain/google-genai`, `@langchain/community` (for Chroma).
- [x] Configure Gemini API Key.

### Phase 3: The Knowledge Engine (Ingestion)

- [x] Implement `PDFLoader` to read uploaded files.
- [x] Implement `RecursiveCharacterTextSplitter`.
- [x] Connect to ChromaDB.
- [x] Create `POST /api/ingest`: Accepts PDF, processes it, saves vectors.

### Phase 4: The Chat Engine (Retrieval)

- [ ] Create `POST /api/chat`.
- [ ] Implement RetrievalQA chain using LangChain.
- [ ] Connect to Gemini Pro model for generation.
- [ ] Test with sample questions ("What is the summary of page 2?").

### Phase 5: Modern Frontend

- [ ] Initialize Vite React project.
- [ ] Install Tailwind CSS & Lucide React (icons).
- [ ] Create `FileUpload` component (Drag & drop).
- [ ] Create `ChatWindow` component (Message bubbles).
- [ ] Connect Frontend to Backend API.

### Phase 6: Polish

- [ ] Add "Source Citations" (e.g., "From page 5").
- [ ] Streaming responses (Typewriter effect).
- [ ] Error handling (Invalid PDFs, API limits).

## Docker Strategy

You mentioned using Docker.
We will run the parts that are hard to install (Vector DB) in Docker.

1.  **ChromaDB**: Run via `docker-compose`. `chromadb/chroma` image.
2.  **Ollama**: Run via `docker-compose`. `ollama/ollama` image. (For Embeddings).
3.  (Optional) **Backend**: Can be dockerized later using `node:18-alpine`.
4.  (Optional) **Frontend**: Can be dockerized using `nginx` or `node`.
    For now, running the app directly (`npm start`) and the DB/AI in Docker is the easiest development flow.
