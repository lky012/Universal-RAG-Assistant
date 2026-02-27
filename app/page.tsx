"use client";

import { useState, useRef, useEffect } from "react";
import { DEMO_SUGGESTED_QUESTIONS, DEMO_DOCUMENT_NAME } from "@/lib/demoData";

type Message = {
  role: "user" | "ai";
  content: string;
  sources?: string[];
  isError?: boolean;
};

export default function RAGPage() {
  // --- State ---
  const [provider, setProvider] = useState<"openai" | "gemini">("gemini");
  const [apiKey, setApiKey] = useState("");
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // --- Handlers ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isDemoMode && !apiKey) {
      alert("Please enter your API Key first.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("apiKey", apiKey);
    formData.append("provider", provider);
    if (sessionId) formData.append("sessionId", sessionId);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSessionId(data.sessionId);
      setUploadedFiles(data.totalFiles);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const sendMessage = async (overrideInput?: string) => {
    const text = overrideInput || input;
    if (!text.trim() || isLoading) return;

    if (!isDemoMode && (!apiKey || uploadedFiles.length === 0)) {
      alert("Please enter API Key and upload a file first.");
      return;
    }

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const endpoint = isDemoMode ? "/api/demo" : "/api/chat";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, sessionId }),
      });
      const data = await res.json();

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          { role: "ai", content: data.error, isError: true },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "ai", content: data.answer, sources: data.sources },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Failed to connect to server.", isError: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetAll = async () => {
    if (sessionId) {
      await fetch("/api/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
    }
    setSessionId(null);
    setUploadedFiles([]);
    setMessages([]);
    setIsDemoMode(false);
  };

  const startDemo = () => {
    resetAll();
    setIsDemoMode(true);
    setUploadedFiles([DEMO_DOCUMENT_NAME]);
    setMessages([
      {
        role: "ai",
        content: `Welcome to **Demo Mode**!\n\nI've pre-loaded the **${DEMO_DOCUMENT_NAME}** for you. You can ask me questions about Hong Kong's I&T strategy without using an API Key.\n\nTry one of the suggested questions below!`,
      },
    ]);
  };

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>
            </div>
            <div className="logo-text">RAG Assistant</div>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="section-label">Configuration</div>
          <div className="provider-tabs">
            <button
              className={`provider-tab ${provider === "gemini" ? "active" : ""}`}
              onClick={() => setProvider("gemini")}
              disabled={isDemoMode}
            >
              Gemini
            </button>
            <button
              className={`provider-tab ${provider === "openai" ? "active" : ""}`}
              onClick={() => setProvider("openai")}
              disabled={isDemoMode}
            >
              OpenAI
            </button>
          </div>

          <div className="input-group">
            <label className="input-label">
              {provider === "openai" ? "OpenAI API Key" : "Google AI Key"}
            </label>
            <input
              type="password"
              className="api-input"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={isDemoMode}
            />
            <div className="api-hint">
              Keys are only stored in your browser session.
            </div>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="section-label">Documents</div>
          <div className={`drop-zone ${isDemoMode ? "disabled" : ""}`}>
            <div className="drop-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            </div>
            <div className="drop-title">Upload Documents</div>
            <div className="drop-subtitle">PDF, DOCX, TXT (Max 15MB)</div>
            <input
              type="file"
              accept=".pdf,.docx,.txt,.md"
              onChange={handleFileUpload}
              disabled={isDemoMode || isUploading}
            />
          </div>
          <div className="api-hint" style={{ marginTop: 10, textAlign: 'center' }}>
            Note: Only text content is parsed. Charts and images are skipped.
          </div>

          {isUploading && (
            <div className="progress-bar-wrap">
              <div className="progress-bar-fill"></div>
            </div>
          )}

          <div className="files-list">
            {uploadedFiles.map((f, i) => (
              <div key={i} className="file-chip">
                <span className="file-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14.5 2 14.5 7.5 20 7.5"></polyline></svg>
                </span>
                <span className="file-name">{f}</span>
                <span className="file-check">✓</span>
              </div>
            ))}
          </div>

          <div
            className={`status-badge ${uploadedFiles.length > 0 ? "ready" : "idle"
              }`}
          >
            <span className="status-dot"></span>
            {uploadedFiles.length > 0 ? "Knowledge Base Ready" : "Waiting for Docs"}
          </div>
        </div>

        <div className="sidebar-section" style={{ marginTop: "auto" }}>
          {!isDemoMode && uploadedFiles.length === 0 && (
            <button className="btn-reset" onClick={startDemo} style={{ marginBottom: 10, borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>
              Try Demo Mode
            </button>
          )}
          <button className="btn-reset" onClick={resetAll}>
            Clear Session
          </button>
        </div>
      </aside>

      {/* Main Chat */}
      <main className="chat-area">
        <header className="chat-header">
          <div className="chat-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isDemoMode && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>}
            {isDemoMode ? "Demo Mode: HK I&T Blueprint" : "Chat Interface"}
          </div>
          <div className="chat-meta">
            {isDemoMode ? "No API Key required" : "BYOK Mode Active"}
          </div>
        </header>

        <div className="messages-scroll" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              </div>
              <div className="empty-title">Start a Conversation</div>
              <div className="empty-body">
                Upload a document and ask questions. The AI will answer based
                on the content and remember your conversation.
              </div>
              {isDemoMode && (
                <div className="steps-hint">
                  {DEMO_SUGGESTED_QUESTIONS.map((q, i) => (
                    <button key={i} className="step-chip" onClick={() => sendMessage(q)}>
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`msg-row ${m.role === "user" ? "user" : "ai"}`}>
                <div className="msg-avatar">
                  {m.role === "user" ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
                  )}
                </div>
                <div className={`msg-bubble ${m.isError ? "msg-error" : ""}`}>
                  <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
                  {m.sources && m.sources.length > 0 && (
                    <div className="msg-sources">
                      {m.sources.map((s, si) => (
                        <span key={si} className="source-chip">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="msg-row ai">
              <div className="msg-avatar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
              </div>
              <div className="msg-bubble">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="input-bar">
          <div className="input-bar-inner">
            <textarea
              className="chat-input"
              placeholder="Ask a question about your documents..."
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button
              className="btn-send"
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
          <div className="input-footer">
            Built with Next.js & LangChain • Session-scoped memory
          </div>
        </footer>
      </main>
    </div>
  );
}
