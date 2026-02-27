# Universal RAG Assistant (BYOK Edition) 🤖

A modern, professional, and fully customizable RAG (Retrieval-Augmented Generation) web application. Designed for portfolios, this project emphasizes **privacy**, **flexibility**, and **seamless deployment**.

## 🌟 Core Philosophy
Unlike traditional RAG demos, this application uses a **BYOK (Bring Your Own Key)** model:
- **Unlimited Content**: Users can upload any PDF, DOCX, or TXT files for analysis—it is not limited to a single dataset.
- **User-Provided API**: Connects directly to the user's OpenAI or Google Gemini API, ensuring zero operational costs for the developer.
- **Stateless Privacy**: All vector data and conversation history are stored only in the current session (In-Memory). Once the browser tab is closed, all data is wiped, adhering to the highest privacy standards.

## ✨ Key Features
1. **Multi-Model Support**: Seamlessly compatible with OpenAI (GPT-4o) and Google Gemini (1.5 / 2.0 / 2.5 / 3 Flash).
2. **Modern Professional UI**: Sleek Slate & Blue color palette with Glassmorphism visual style and smooth micro-animations.
3. **Smart Document Parsing**: Robust text extraction for complex PDF, DOCX, and TXT files.
4. **Demo Mode**: Built-in "Hong Kong I&T Blueprint" dataset allows visitors to experience the RAG workflow instantly without an API Key.
5. **One-Click Deployment**: Fully optimized for Vercel Serverless environments with no database configuration required.

## 🚀 Quick Start
1. Fork or upload this repository to GitHub.
2. Link the repository to your Vercel account.
3. Ensure the **Root Directory** is set to the project root.
4. Click **Deploy** and you're ready to go!

## 🛠️ Tech Stack
- **Frontend**: Next.js 16 (App Router)
- **RAG Framework**: LangChain.js
- **LLM**: OpenAI / Google Generative AI
- **Vector Store**: Custom In-Memory Vector Store (Cosine Similarity)
- **Styling**: Pure CSS3 (Professional Dark Theme)

---
Built for high-performance, privacy-first AI applications.
