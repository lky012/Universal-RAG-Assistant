# Universal RAG Assistant (BYOK Edition) 🤖

這是一個現代化、專業且完全可自定義的 RAG (Retrieval-Augmented Generation) 網頁應用。專為作品集展示設計，強調 **隱私性**、**靈活性** 與 **極簡部署**。

## 🌟 核心理念
與傳統 RAG 專案不同，本應用採用 **BYOK (Bring Your Own Key)** 模式：
- **不設限的內容**：用戶可自由上傳任何 PDF, DOCX 或 TXT 檔案進行分析，不侷限於單一文件。
- **用戶自主 API**：直接調用用戶提供的 OpenAI 或 Google Gemini API，無需開發者負擔運算成本。
- **無狀態隱私**：所有向量數據與對話紀錄僅存儲於當前會話 (In-Memory)，網頁關閉即清除，符合最高隱私標準。

## ✨ 關鍵功能
1. **多模型支持**：完美相容 OpenAI (GPT-4o) 與 Google Gemini (2.5/3 Flash)。
2. **現代化專業 UI**：採用 Slate & Blue 專業配色、Glassmorphism 視覺風格。
3. **智慧文檔解析**：支援複雜的 PDF, DOCX, TXT 文本提取。
4. **示範模式 (Demo Mode)**：內建《香港創科藍圖》示範資料，讓訪客在沒有 API Key 的情況下也能立即體驗 RAG 效果。
5. **一鍵部署**：完全適配 Vercel Serverless 環境，無需配置資料庫。

## 🚀 部署指南
1. 將本專案上傳至 GitHub。
2. 在 Vercel 連結該 Repository。
3. 將 **Root Directory** 設定為 `rag-web-app`。
4. 點擊 **Deploy**，完畢！

## 🛠️ 技術棧
- **Frontend**: Next.js 14 (App Router)
- **RAG Framework**: LangChain.js
- **LLM**: OpenAI / Google Generative AI
- **Vector Store**: Custom In-Memory Vector Store (Cosine Similarity)
- **Styling**: Pure CSS3 (Professional Dark Theme)

---
Built by [Your Name] • Focused on Privacy-First AI Applications
