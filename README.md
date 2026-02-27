# Universal BYOK RAG Assistant 🤖

A high-performance, session-based **Retrieval-Augmented Generation (RAG)** engine designed to demonstrate scalable AI orchestration and document intelligence. This system allows users to interact with any private dataset using their own AI infrastructure.

## 🏗️ Technical Architecture

### 1. Bring Your Own Key (BYOK) Integration
Optimized for the modern "API-as-a-Service" landscape, the system orchestrates directly with the user's provided **OpenAI** or **Google Generative AI** keys. This ensures:
- **Zero-Latency Orchestration**: Direct client-to-model communication where applicable.
- **Resource Efficiency**: Eliminates server-side LLM hosting overhead while providing a professional interface.

### 2. Stateless In-Memory Vector Engine
A custom-built retrieval layer implemented for high-speed, privacy-first document analysis:
- **Cosine Similarity Search**: Leveraging custom vector arithmetic to rank relevant document chunks.
- **Session-Scoped Persistence**: Data is ingested into memory and cleared upon session termination, ensuring zero data footprint on the server.
- **Recursive Character Chunking**: Implementation of overlapping window splitting for maintaining semantic context across documents.

## 🚀 Key Technical Features

- **Standardized Multi-Model Support**: Advanced support for **GPT-4o** and **Gemini 2.5/3 Flash**, including robust handling of different API versioning (v1/v1beta).
- **Universal Document Intelligence**: Modular parser supporting **PDF**, **DOCX**, and **TXT** files through asynchronous ingestion pipelines.
- **Intelligent Conversation Memory**: Context-aware buffering that manages token windows for sustained, multi-turn RAG dialogues.
- **Synthetic Demo Layer**: An integrated simulation mode that demonstrates the full RAG pipeline (Retrieval -> Context Injection -> LLM Inference) using a pre-indexed knowledge base.

## 🛠️ Tech Stack
- **Framework**: Next.js (App Router)
- **AI Orchestration**: LangChain.js
- **Foundational Models**: OpenAI & Google Generative AI
- **Parsing**: mammoth (DOCX), pdf-parse (PDF)
- **Vector Operations**: Custom In-Memory Implementation

---
*Focused on engineering excellence in document intelligence and privacy-preserving AI.*
